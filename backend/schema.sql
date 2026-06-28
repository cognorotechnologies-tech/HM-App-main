-- Full Schema Dump

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TYPE IF EXISTS appointment_status CASCADE;
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show');

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient', 'receptionist');

CREATE OR REPLACE FUNCTION public.update_workflow_trigger_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_medical_documents_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_family_members_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_message_read_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INT;
    year_month VARCHAR;
BEGIN
    year_month := TO_CHAR(NEW.issue_date, 'YYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INT)), 0) + 1
    INTO next_number
    FROM billing_invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '%';
    
    NEW.invoice_number := 'INV-' || year_month || '-' || LPAD(next_number::TEXT, 4, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_billing_item_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.total_price := (NEW.quantity * NEW.unit_price);
    NEW.discount_amount := NEW.total_price * (NEW.discount_percent / 100);
    NEW.total_price := NEW.total_price - NEW.discount_amount;
    NEW.tax_amount := NEW.total_price * (NEW.tax_rate / 100);
    NEW.total_price := NEW.total_price + NEW.tax_amount;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_invoice_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE billing_invoices
    SET 
        subtotal = (
            SELECT COALESCE(SUM(quantity * unit_price - discount_amount), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(tax_amount), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM billing_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_invoice_payment_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    invoice_total DECIMAL(10,2);
    total_paid DECIMAL(10,2);
BEGIN
    IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
        -- Get invoice total
        SELECT total_amount INTO invoice_total
        FROM billing_invoices
        WHERE id = NEW.invoice_id;
        
        -- Calculate total paid
        SELECT COALESCE(SUM(amount), 0) INTO total_paid
        FROM payment_transactions
        WHERE invoice_id = NEW.invoice_id AND status = 'success';
        
        -- Update invoice
        UPDATE billing_invoices
        SET 
            paid_amount = total_paid,
            payment_status = CASE
                WHEN total_paid >= invoice_total THEN 'paid'
                WHEN total_paid > 0 THEN 'partial'
                ELSE 'pending'
            END,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_workflow_failure(p_instance_id uuid, p_step_id uuid, p_error_message text, p_error_stack text DEFAULT NULL::text, p_retry_count integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_failure_id UUID;
    v_requires_intervention BOOLEAN;
BEGIN
    v_requires_intervention := p_retry_count >= 3;
    
    INSERT INTO workflow_failures (
        workflow_instance_id,
        workflow_step_id,
        error_message,
        error_stack,
        retry_count,
        requires_manual_intervention
    ) VALUES (
        p_instance_id,
        p_step_id,
        p_error_message,
        p_error_stack,
        p_retry_count,
        v_requires_intervention
    ) RETURNING id INTO v_failure_id;
    
    RETURN v_failure_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.resolve_workflow_failure(p_failure_id uuid, p_resolved_by uuid, p_resolution_notes text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE workflow_failures
    SET 
        resolved_at = now(),
        resolved_by = p_resolved_by,
        resolution_notes = p_resolution_notes,
        updated_at = now()
    WHERE id = p_failure_id
    AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_campaign_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE campaigns
        SET
            sent_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('sent', 'delivered', 'opened', 'clicked')),
            delivered_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')),
            failed_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('failed', 'bounced')),
            opened_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status IN ('opened', 'clicked')),
            clicked_count = (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = NEW.campaign_id AND status = 'clicked'),
            updated_at = NOW()
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_prescription_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.prescription_number IS NULL THEN
    NEW.prescription_number := generate_prescription_number();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_whatsapp_templates_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'patient'))::public.user_role
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RAISE; 
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_prescription_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_number TEXT;
    year_month TEXT;
BEGIN
    -- Format: RX-YYYYMM-XXXX (e.g., RX-202601-1001)
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    new_number := 'RX-' || year_month || '-' || LPAD(nextval('prescription_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role public.user_role;
BEGIN
  SELECT role INTO _role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN _role;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_schedules_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

DROP TABLE IF EXISTS receptionists CASCADE;
CREATE TABLE receptionists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role user_role DEFAULT 'patient'::user_role,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS doctors CASCADE;
CREATE TABLE doctors (
  id uuid NOT NULL,
  department_id uuid,
  specialization text,
  qualifications text,
  years_of_experience integer,
  consultation_fee numeric,
  bio text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'offline'::text,
  license_number text,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS departments CASCADE;
CREATE TABLE departments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS doctor_schedules CASCADE;
CREATE TABLE doctor_schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  doctor_id uuid,
  day_of_week integer,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  slot_duration_minutes integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS letterhead_template CASCADE;
CREATE TABLE letterhead_template (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  hospital_logo_url text,
  hospital_name text NOT NULL,
  hospital_tagline text,
  hospital_address text,
  contact_details jsonb,
  registration_numbers text[],
  accreditations text[],
  footer_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS consultations CASCADE;
CREATE TABLE consultations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  visit_id uuid,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  examination_findings text,
  diagnosis text[],
  icd_codes text[],
  investigations_advised text[],
  advice text,
  follow_up_date date,
  status text DEFAULT 'draft'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS prescription_items CASCADE;
CREATE TABLE prescription_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  prescription_id uuid NOT NULL,
  medicine_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  instructions text,
  route character varying(100),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS site_content CASCADE;
CREATE TABLE site_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS patients CASCADE;
CREATE TABLE patients (
  id uuid NOT NULL,
  date_of_birth date,
  gender text,
  blood_group text,
  address text,
  medical_history text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  allergies text[],
  chronic_conditions text[],
  current_medications text,
  previous_surgeries text,
  family_history text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  address_street text,
  address_city text,
  address_state text,
  address_pincode text,
  insurance_details jsonb,
  alternative_phone text,
  first_name text,
  last_name text,
  contact_number text,
  email text,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS appointments CASCADE;
CREATE TABLE appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  appointment_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  status appointment_status DEFAULT 'pending'::appointment_status,
  reason text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  department_id uuid,
  family_member_id uuid,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS prescriptions CASCADE;
CREATE TABLE prescriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  diagnosis text NOT NULL,
  follow_up_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  consultation_id uuid,
  prescription_number text DEFAULT generate_prescription_number(),
  medicines jsonb,
  investigations text[],
  advice text,
  doctor_id uuid,
  patient_id uuid,
  instructions text,
  prescription_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'final'::text,
  symptoms text,
  PRIMARY KEY (id)
);

CREATE TRIGGER trigger_set_prescription_number BEFORE INSERT ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION set_prescription_number();

DROP TABLE IF EXISTS patient_visits CASCADE;
CREATE TABLE patient_visits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  token_number text NOT NULL,
  visit_type text DEFAULT 'opd'::text,
  department_id uuid,
  doctor_id uuid,
  status text DEFAULT 'waiting'::text,
  chief_complaint text,
  vitals jsonb,
  queue_position integer,
  created_at timestamp with time zone DEFAULT now(),
  consultation_started_at timestamp with time zone,
  consultation_completed_at timestamp with time zone,
  created_by uuid,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS schedules CASCADE;
CREATE TABLE schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  day_of_week integer NOT NULL,
  start_time time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone,
  end_time time without time zone NOT NULL,
  slot_duration integer NOT NULL DEFAULT 30,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER set_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION update_schedules_updated_at();

DROP TABLE IF EXISTS medical_documents CASCADE;
CREATE TABLE medical_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  document_type character varying(50) NOT NULL,
  file_name character varying(255) NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type character varying(100),
  category character varying(50),
  tags text[],
  notes text,
  uploaded_by uuid,
  version integer DEFAULT 1,
  parent_document_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER medical_documents_updated_at BEFORE UPDATE ON public.medical_documents FOR EACH ROW EXECUTE FUNCTION update_medical_documents_updated_at();

DROP TABLE IF EXISTS appointment_modifications CASCADE;
CREATE TABLE appointment_modifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  modification_type character varying(20) NOT NULL,
  old_date date,
  old_start_time time without time zone,
  old_end_time time without time zone,
  new_date date,
  new_start_time time without time zone,
  new_end_time time without time zone,
  reason text,
  modified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS patient_doctor_messages CASCADE;
CREATE TABLE patient_doctor_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  appointment_id uuid,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  message_text text NOT NULL,
  attachments text[],
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER message_read_at_trigger BEFORE UPDATE ON public.patient_doctor_messages FOR EACH ROW EXECUTE FUNCTION set_message_read_at();

DROP TABLE IF EXISTS billing_invoices CASCADE;
CREATE TABLE billing_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying NOT NULL,
  patient_id uuid NOT NULL,
  appointment_id uuid,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL,
  paid_amount numeric NOT NULL DEFAULT 0,
  payment_status character varying NOT NULL DEFAULT 'pending'::character varying,
  notes text,
  terms text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.billing_invoices FOR EACH ROW WHEN ((new.invoice_number IS NULL)) EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.billing_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TABLE IF EXISTS billing_items CASCADE;
CREATE TABLE billing_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  service_type character varying NOT NULL,
  description text NOT NULL,
  item_code character varying,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER calculate_item_total BEFORE INSERT OR UPDATE ON public.billing_items FOR EACH ROW EXECUTE FUNCTION calculate_billing_item_total();

CREATE TRIGGER update_invoice_on_item_change AFTER INSERT OR DELETE OR UPDATE ON public.billing_items FOR EACH ROW EXECUTE FUNCTION update_invoice_total();

DROP TABLE IF EXISTS payment_transactions CASCADE;
CREATE TABLE payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  transaction_id character varying NOT NULL,
  amount numeric NOT NULL,
  payment_method character varying NOT NULL,
  payment_gateway character varying,
  gateway_transaction_id character varying,
  gateway_response jsonb,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  processed_at timestamp with time zone,
  refunded_at timestamp with time zone,
  notes text,
  processed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER update_invoice_on_payment AFTER INSERT OR UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION update_invoice_payment_status();

DROP TABLE IF EXISTS family_members CASCADE;
CREATE TABLE family_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text,
  relationship text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TABLE IF EXISTS health_metrics CASCADE;
CREATE TABLE health_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  type character varying(50) NOT NULL,
  value jsonb NOT NULL,
  unit character varying(20) NOT NULL,
  measured_at timestamp with time zone DEFAULT now(),
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS user_credentials CASCADE;
CREATE TABLE user_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS campaign_analytics CASCADE;
CREATE TABLE campaign_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  date date NOT NULL,
  sent integer DEFAULT 0,
  delivered integer DEFAULT 0,
  failed integer DEFAULT 0,
  bounced integer DEFAULT 0,
  opened integer DEFAULT 0,
  clicked integer DEFAULT 0,
  unsubscribed integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  description text,
  channel character varying(20) NOT NULL,
  campaign_type character varying(50) DEFAULT 'general'::character varying,
  status character varying(50) DEFAULT 'draft'::character varying,
  subject character varying(255),
  message text NOT NULL,
  target_type character varying(50) NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  send_type character varying(50) DEFAULT 'immediate'::character varying,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TABLE IF EXISTS campaign_recipients CASCADE;
CREATE TABLE campaign_recipients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  campaign_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  channel character varying(20) NOT NULL,
  recipient_address character varying(255) NOT NULL,
  status character varying(50) DEFAULT 'pending'::character varying,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  failed_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  external_id character varying(255),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trigger_update_campaign_stats AFTER INSERT OR UPDATE ON public.campaign_recipients FOR EACH ROW EXECUTE FUNCTION update_campaign_stats();

DROP TABLE IF EXISTS campaign_templates CASCADE;
CREATE TABLE campaign_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  description text,
  template_type character varying(50),
  channel character varying(20) NOT NULL,
  subject character varying(255),
  body text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.campaign_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TABLE IF EXISTS workflow_templates CASCADE;
CREATE TABLE workflow_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  description text,
  category character varying(100),
  trigger_type character varying(50) NOT NULL,
  trigger_event character varying(100),
  trigger_config jsonb DEFAULT '{}'::jsonb,
  estimated_duration_days integer,
  is_active boolean DEFAULT true,
  is_template boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  total_executions integer DEFAULT 0,
  successful_executions integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  type text DEFAULT 'standalone'::text,
  version integer DEFAULT 1,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS workflow_steps CASCADE;
CREATE TABLE workflow_steps (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL,
  step_order integer NOT NULL,
  parent_step_id uuid,
  step_name character varying(255) NOT NULL,
  step_type character varying(50) NOT NULL,
  delay_days integer DEFAULT 0,
  delay_hours integer DEFAULT 0,
  delay_minutes integer DEFAULT 0,
  condition_type character varying(50) DEFAULT 'always'::character varying,
  condition_rules jsonb DEFAULT '{}'::jsonb,
  action_type character varying(50),
  action_config jsonb DEFAULT '{}'::jsonb,
  on_success_step_id uuid,
  on_failure_step_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  transfer_to_workflow_id uuid,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS workflow_instances CASCADE;
CREATE TABLE workflow_instances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  trigger_event character varying(100),
  trigger_data jsonb DEFAULT '{}'::jsonb,
  triggered_at timestamp with time zone DEFAULT now(),
  status character varying(50) DEFAULT 'active'::character varying,
  current_step_id uuid,
  next_execution_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  paused_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  error_count integer DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS workflow_step_executions CASCADE;
CREATE TABLE workflow_step_executions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  instance_id uuid NOT NULL,
  step_id uuid NOT NULL,
  status character varying(50) DEFAULT 'pending'::character varying,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  execution_duration_ms integer,
  result jsonb DEFAULT '{}'::jsonb,
  output_data jsonb DEFAULT '{}'::jsonb,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS survey_instances CASCADE;
CREATE TABLE survey_instances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  survey_template_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  workflow_instance_id uuid,
  sent_via character varying(50),
  sent_at timestamp with time zone DEFAULT now(),
  sent_to character varying(255),
  access_token character varying(255),
  expires_at timestamp with time zone,
  status character varying(50) DEFAULT 'sent'::character varying,
  opened_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  completion_time_minutes integer,
  questions_total integer,
  questions_answered integer DEFAULT 0,
  progress_percentage integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS survey_templates CASCADE;
CREATE TABLE survey_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  description text,
  category character varying(100),
  questions jsonb NOT NULL,
  scoring_rules jsonb DEFAULT '{}'::jsonb,
  alert_rules jsonb DEFAULT '{}'::jsonb,
  estimated_time_minutes integer,
  expires_after_hours integer DEFAULT 72,
  allow_partial_responses boolean DEFAULT true,
  is_active boolean DEFAULT true,
  is_template boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  total_sent integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  average_completion_time_minutes integer,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS survey_responses CASCADE;
CREATE TABLE survey_responses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  survey_instance_id uuid NOT NULL,
  question_id character varying(100) NOT NULL,
  question_text text NOT NULL,
  question_type character varying(50) NOT NULL,
  answer_value jsonb NOT NULL,
  answer_text text,
  is_concerning boolean DEFAULT false,
  concern_level character varying(50),
  answered_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS survey_alerts CASCADE;
CREATE TABLE survey_alerts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  survey_instance_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  workflow_instance_id uuid,
  alert_type character varying(50) NOT NULL,
  severity integer NOT NULL,
  category character varying(100),
  title character varying(255) NOT NULL,
  alert_reason text NOT NULL,
  triggered_by jsonb,
  recommended_actions jsonb,
  status character varying(50) DEFAULT 'open'::character varying,
  assigned_to uuid,
  assigned_at timestamp with time zone,
  acknowledged_at timestamp with time zone,
  acknowledged_by uuid,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  resolution_notes text,
  actions_taken jsonb DEFAULT '[]'::jsonb,
  escalated boolean DEFAULT false,
  escalated_to uuid,
  escalated_at timestamp with time zone,
  escalation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS staff_tasks CASCADE;
CREATE TABLE staff_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid,
  workflow_instance_id uuid,
  title character varying(255) NOT NULL,
  description text,
  priority character varying(50) DEFAULT 'medium'::character varying,
  assigned_role character varying(50),
  status character varying(50) DEFAULT 'pending'::character varying,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER update_staff_tasks_updated_at BEFORE UPDATE ON public.staff_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TABLE IF EXISTS user_actions CASCADE;
CREATE TABLE user_actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid,
  workflow_instance_id uuid,
  action_type character varying(50) NOT NULL,
  action_data jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address character varying(45),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS whatsapp_templates CASCADE;
CREATE TABLE whatsapp_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  category character varying(50) NOT NULL,
  language character varying(10) DEFAULT 'en'::character varying,
  template_id character varying(255) NOT NULL,
  content text NOT NULL,
  variables jsonb,
  status character varying(50) DEFAULT 'pending'::character varying,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TRIGGER trigger_update_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates FOR EACH ROW EXECUTE FUNCTION update_whatsapp_templates_updated_at();

DROP TABLE IF EXISTS whatsapp_messages CASCADE;
CREATE TABLE whatsapp_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid,
  phone_number character varying(20) NOT NULL,
  message_type character varying(50) DEFAULT 'template'::character varying,
  template_id uuid,
  content text,
  media_url text,
  status character varying(50) DEFAULT 'pending'::character varying,
  whatsapp_message_id character varying(255),
  error_message text,
  campaign_id uuid,
  workflow_action_id uuid,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS workflow_triggers CASCADE;
CREATE TABLE workflow_triggers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_template_id uuid NOT NULL,
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  PRIMARY KEY (id)
);

CREATE TRIGGER trigger_update_workflow_trigger_timestamp BEFORE UPDATE ON public.workflow_triggers FOR EACH ROW EXECUTE FUNCTION update_workflow_trigger_updated_at();

DROP TABLE IF EXISTS workflow_failures CASCADE;
CREATE TABLE workflow_failures (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_instance_id uuid NOT NULL,
  workflow_step_id uuid,
  error_message text,
  error_stack text,
  retry_count integer DEFAULT 0,
  failed_at timestamp with time zone DEFAULT now(),
  last_retry_at timestamp with time zone,
  requires_manual_intervention boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);


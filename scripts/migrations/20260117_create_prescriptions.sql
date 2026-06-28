-- Phase 4: Doctor Module - Digital Prescriptions
-- Migration: 20260117_create_prescriptions.sql

-- ============================================
-- 1. PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    
    -- Clinical Details
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    notes TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(appointment_id) -- One prescription per appointment usually
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON public.prescriptions(appointment_id);

-- ============================================
-- 2. PRESCRIPTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    
    -- Medicine Details
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL, -- e.g., "500mg"
    frequency VARCHAR(100) NOT NULL, -- e.g., "1-0-1", "OD", "BD"
    duration VARCHAR(100) NOT NULL, -- e.g., "5 days"
    route VARCHAR(100), -- e.g., "Oral", "IV", "Topical"
    instructions TEXT, -- e.g., "After food"
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON public.prescription_items(prescription_id);

-- ============================================
-- 3. RLS POLICIES
-- ============================================
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

-- PRESCRIPTIONS POLICIES

-- Doctor: Can create prescriptions for their appointments
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (
        doctor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = prescriptions.appointment_id
            AND a.doctor_id = auth.uid()
        )
    );

-- Doctor: Can view prescriptions they created
CREATE POLICY "Doctors can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (doctor_id = auth.uid());

-- Doctor: Can update prescriptions they created
CREATE POLICY "Doctors can update own prescriptions" ON public.prescriptions
    FOR UPDATE USING (doctor_id = auth.uid());

-- Patient: Can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (
        patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid()) OR
        -- Allow family members access if authorized (Phase 4 consideration)
        EXISTS (
            SELECT 1 FROM public.family_members fm
            WHERE fm.patient_id = prescriptions.patient_id
            AND fm.primary_user_id = auth.uid()
        )
    );

-- PRESCRIPTION ITEMS POLICIES

-- Doctor: Can manage items for their prescriptions
CREATE POLICY "Doctors manage prescription items" ON public.prescription_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND p.doctor_id = auth.uid()
        )
    );

-- Patient: Can view items for their prescriptions
CREATE POLICY "Patients view prescription items" ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND (
                p.patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid()) OR
                EXISTS (
                    SELECT 1 FROM public.family_members fm
                    WHERE fm.patient_id = p.patient_id
                    AND fm.primary_user_id = auth.uid()
                )
            )
        )
    );

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Reuse handle_updated_at if available, else create
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END $$;

CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Force schema reload
NOTIFY pgrst, 'reload';

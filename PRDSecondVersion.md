PHASE 2: OPD Management System with Receptionist Role
Task: Build a comprehensive OPD workflow system focusing on real-world hospital operations.
1. New Role: Receptionist/Front Desk (role: 'receptionist')
Receptionist Dashboard (/receptionist/dashboard):

Today's statistics: Total patients, Walk-ins, Appointments, Pending consultations
Quick actions: Register New Patient, Token Management, Search Patient
Real-time queue display by department
Doctor availability status board

2. Patient Registration & Management
Walk-in Registration (/receptionist/register):
Create comprehensive patient intake form with:
Basic Information:

Full Name, Age, Gender, Date of Birth
Contact Number (Primary, Alternative)
Email Address
Address (Street, City, State, Pincode)
Emergency Contact (Name, Relationship, Phone)

Medical Information:

Blood Group
Known Allergies
Chronic Conditions (Diabetes, Hypertension, etc.)
Current Medications
Previous Surgeries/Hospitalizations
Family Medical History (optional)

Visit Information:

Visit Type: OPD / Emergency / Follow-up
Referring Doctor (if any)
Department Selection
Doctor Selection (based on availability)
Chief Complaint (reason for visit)
Insurance Details (optional)

Token/Queue Management:

Auto-generate token number (Department-wise: e.g., CARDIO-001)
Assign to doctor's queue
Display estimated waiting time
SMS/notification to patient with token number

3. Patient Records & Search (/receptionist/patients)
Features:

Advanced Search: By Name, Phone, Patient ID, Token Number
Patient List View: Sortable table with:

Patient ID, Name, Age, Contact, Last Visit, Status
Quick actions: View Details, Edit, Add to Queue


Patient Detail View:

Complete profile with all information
Visit history timeline
Prescriptions archive
Billing history
Ability to edit/update information



4. Virtual Letterhead & Report System
Letterhead Template Editor (/admin/settings/letterhead):

Customizable Hospital Letterhead:

Upload hospital logo
Hospital name, tagline, address
Contact details (phone, email, website)
Registration numbers, accreditations
Doctor's signature placeholder
Footer with legal disclaimers



Pre-Consultation Form Template:
Create editable template with sections:

Patient Demographics (auto-filled from registration)
Vitals Section (BP, Pulse, Temperature, Weight, Height, BMI - to be filled by receptionist/nurse)
Chief Complaints (editable text area)
Present History
Past Medical History
Examination Findings (to be filled by doctor)
Provisional Diagnosis (to be filled by doctor)
Investigations Advised (to be filled by doctor)
Prescription Section (to be filled by doctor)
Follow-up Instructions
Doctor's Notes

Form Workflow:

Receptionist Stage: Fill basic details, vitals, chief complaints
Forward to Doctor: Send form to doctor's consultation queue
Doctor Stage: Complete examination findings, diagnosis, prescription
Finalize: Save to patient record, generate printable version

5. Doctor Consultation Enhancement
Updated Doctor Dashboard (/doctor/dashboard):

Consultation Queue: Real-time list of patients waiting

Show: Token Number, Patient Name, Age, Chief Complaint, Waiting Time
Status indicators: Waiting / In Progress / Completed


Start Consultation Button: Opens patient form

Enhanced Consultation Interface (/doctor/consultation/:patientId):
Patient Summary Panel (Left Side):

Patient photo and basic info
Vital signs display
Allergy alerts (highlighted in red)
Previous visit summary
Last prescription quick view

Consultation Form (Center):

Pre-filled patient details from receptionist
Clinical Examination:

General Examination findings
Systemic Examination (editable sections)


Diagnosis Section:

ICD-10 code search and selection
Multiple diagnosis support


Prescription Builder:

Medicine search with auto-complete
Dosage, Frequency, Duration dropdowns
Special instructions per medicine
Add/Remove medicine rows
Template prescriptions (save frequently used combinations)


Investigations:

Lab tests, imaging, procedures to be done
Urgency indicators


Advice & Instructions:

Diet recommendations
Activity restrictions
Follow-up date
Referral to specialist (if needed)



Action Buttons:

Save Draft: Save without completing
Complete & Print: Finalize consultation, generate prescription
Mark as Completed: Close consultation and remove from queue

6. Prescription Generation & Printing
Prescription Template Features:

Hospital letterhead (from template editor)
Patient details section
Date and consultation number
Doctor's details and qualification
Rx Section: Medicines in proper medical format

Sr. No. | Medicine Name | Dosage | Frequency | Duration


Investigations section
Advice and instructions
Next visit date
Doctor's digital signature and stamp
Footer with clinic timings and contact

Printing Options:

Print Preview
Direct Print
Save as PDF
Email to Patient
SMS prescription summary

7. Queue Management Dashboard (/receptionist/queue)
Real-time Board:

Department-wise queue display
Token numbers currently being consulted (on LED board style)
Next token ready (highlighting system)
Average waiting time per doctor
Doctor availability status (Available / Busy / Break / Offline)

Queue Actions:

Call next patient (send notification)
Move patient to different doctor (if needed)
Mark patient as No-show
Emergency priority override


Technical Implementation Requirements
Database Schema Updates (Supabase)
New Tables Needed:
sql-- Receptionist users
CREATE TABLE receptionists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS
  blood_group TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_pincode TEXT,
  insurance_details JSONB;

-- Patient visits/tokens
CREATE TABLE patient_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  token_number TEXT NOT NULL,
  visit_type TEXT CHECK (visit_type IN ('opd', 'emergency', 'followup')),
  department_id UUID REFERENCES departments(id),
  doctor_id UUID REFERENCES doctors(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled', 'no_show')),
  chief_complaint TEXT,
  vitals JSONB,
  queue_position INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  consultation_started_at TIMESTAMP,
  consultation_completed_at TIMESTAMP
);

-- Hospital letterhead template
CREATE TABLE letterhead_template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_logo_url TEXT,
  hospital_name TEXT,
  hospital_address TEXT,
  contact_details JSONB,
  footer_text TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultation records
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID REFERENCES patient_visits(id),
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES doctors(id),
  examination_findings TEXT,
  diagnosis TEXT[],
  icd_codes TEXT[],
  investigations_advised TEXT[],
  advice TEXT,
  follow_up_date DATE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS
  consultation_id UUID REFERENCES consultations(id),
  prescription_number TEXT UNIQUE,
  medicines JSONB, -- Array of {name, dosage, frequency, duration, instructions}
  investigations TEXT[],
  advice TEXT,
  follow_up_date DATE;
```

### Frontend Routes to Implement
```
Public Routes:
/ - Homepage
/about - About Us
/departments - Departments List
/departments/:id - Department Detail
/doctors - Doctors Directory
/doctors/:id - Doctor Profile
/services - Treatments & Services
/contact - Contact
/resources - Patient Resources

Receptionist Routes:
/receptionist/login
/receptionist/dashboard
/receptionist/register - New Patient Registration
/receptionist/patients - Patient Search & Records
/receptionist/queue - Queue Management
/receptionist/appointments - Today's Appointments

Doctor Routes (Enhanced):
/doctor/consultation/:patientId - Consultation Interface
/doctor/queue - My Queue

Admin Routes (Enhanced):
/admin/letterhead - Letterhead Editor
/admin/receptionists - Manage Receptionist Accounts
Key Features to Implement

Real-time Updates: Use Supabase real-time subscriptions for queue updates
Print Functionality: Use react-to-print or similar library
PDF Generation: Use jsPDF or pdfmake for prescription PDFs
Form Validation: Implement comprehensive validation for patient registration
Search Optimization: Implement debounced search with indexing
Responsive Design: Ensure all interfaces work on tablets (for reception desk use)
Keyboard Shortcuts: Add shortcuts for frequent actions (save, print, next patient)
Offline Support: Consider PWA for reception desk continuity

UI/UX Guidelines

Color Scheme: Medical theme with trust-building colors (Blue primary, White, Light green accents)
Typography: Clear, readable fonts (Inter, Roboto, or similar)
Icons: Use Lucide React or similar medical-appropriate icon set
Loading States: Show skeleton loaders for better UX
Error Handling: User-friendly error messages with recovery options
Success Feedback: Toast notifications for successful actions
Confirmation Dialogs: For critical actions (delete, mark no-show)


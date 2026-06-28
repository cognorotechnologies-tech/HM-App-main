-- Comprehensive RLS fix for prescriptions and prescription_items
-- The issue: RLS policies check auth.uid() directly, but doctors.id != auth.uid()
-- Solution: Check if auth.uid() has a corresponding doctor record

-- ============================================
-- 1. DROP ALL EXISTING PRESCRIPTION POLICIES
-- ============================================
DROP POLICY IF EXISTS "Doctors can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors view prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Patients view prescriptions" ON public.prescriptions;

DROP POLICY IF EXISTS "Doctors manage prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors insert prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors view prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors update prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors delete prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Patients view prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors insert items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors view items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors update items" ON public.prescription_items;
DROP POLICY IF EXISTS "Doctors delete items" ON public.prescription_items;
DROP POLICY IF EXISTS "Patients view items" ON public.prescription_items;

-- ============================================
-- 2. CREATE NEW PRESCRIPTIONS POLICIES
-- ============================================

-- Doctor INSERT: Check if auth user has a doctor record
CREATE POLICY "Doctors create prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = auth.uid()
            AND d.id = prescriptions.doctor_id
        )
    );

-- Doctor SELECT: View prescriptions where they are the doctor
CREATE POLICY "Doctors view prescriptions" ON public.prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = auth.uid()
            AND d.id = prescriptions.doctor_id
        )
    );

-- Doctor UPDATE: Update prescriptions where they are the doctor
CREATE POLICY "Doctors update prescriptions" ON public.prescriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = auth.uid()
            AND d.id = prescriptions.doctor_id
        )
    );

-- Patient SELECT: View their own prescriptions
CREATE POLICY "Patients view prescriptions" ON public.prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = auth.uid()
            AND p.id = prescriptions.patient_id
        )
    );

-- ============================================
-- 3. CREATE NEW PRESCRIPTION_ITEMS POLICIES
-- ============================================

-- Doctor INSERT items
CREATE POLICY "Doctors insert items" ON public.prescription_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prescriptions pr
            JOIN public.doctors d ON d.id = pr.doctor_id
            WHERE pr.id = prescription_items.prescription_id
            AND d.id = auth.uid()
        )
    );

-- Doctor SELECT items
CREATE POLICY "Doctors view items" ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions pr
            JOIN public.doctors d ON d.id = pr.doctor_id
            WHERE pr.id = prescription_items.prescription_id
            AND d.id = auth.uid()
        )
    );

-- Doctor UPDATE items
CREATE POLICY "Doctors update items" ON public.prescription_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions pr
            JOIN public.doctors d ON d.id = pr.doctor_id
            WHERE pr.id = prescription_items.prescription_id
            AND d.id = auth.uid()
        )
    );

-- Doctor DELETE items
CREATE POLICY "Doctors delete items" ON public.prescription_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions pr
            JOIN public.doctors d ON d.id = pr.doctor_id
            WHERE pr.id = prescription_items.prescription_id
            AND d.id = auth.uid()
        )
    );

-- Patient SELECT items
CREATE POLICY "Patients view items" ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions pr
            JOIN public.patients p ON p.id = pr.patient_id
            WHERE pr.id = prescription_items.prescription_id
            AND p.id = auth.uid()
        )
    );

-- Force schema reload
NOTIFY pgrst, 'reload';

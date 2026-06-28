-- Fix prescription_items RLS policy for INSERT operations
-- The original policy only had USING clause which doesn't apply to INSERT

-- Drop the old policy
DROP POLICY IF EXISTS "Doctors manage prescription items" ON public.prescription_items;

-- Create separate policies for different operations

-- Doctor can INSERT items for their prescriptions
CREATE POLICY "Doctors insert prescription items" ON public.prescription_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND p.doctor_id = auth.uid()
        )
    );

-- Doctor can SELECT items for their prescriptions
CREATE POLICY "Doctors view prescription items" ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND p.doctor_id = auth.uid()
        )
    );

-- Doctor can UPDATE items for their prescriptions
CREATE POLICY "Doctors update prescription items" ON public.prescription_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND p.doctor_id = auth.uid()
        )
    );

-- Doctor can DELETE items for their prescriptions
CREATE POLICY "Doctors delete prescription items" ON public.prescription_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id
            AND p.doctor_id = auth.uid()
        )
    );

-- Keep the patient view policy
-- (This should already exist from the original migration)

-- Force schema reload
NOTIFY pgrst, 'reload';

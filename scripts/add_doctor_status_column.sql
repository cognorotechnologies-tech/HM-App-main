-- Add status column to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'offline' 
CHECK (status IN ('available', 'busy', 'break', 'offline'));

-- Allow doctors to update their own status
CREATE POLICY "Doctors can update their own status"
ON public.doctors
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users (receptionists, admins) to view doctor status
-- (This might already be covered by existing select policies, but ensuring it's explicit)
CREATE POLICY "Authenticated users can view doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (true);

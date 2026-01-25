-- Make user_id nullable in scans table to allow anonymous scans
ALTER TABLE public.scans ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint
ALTER TABLE public.scans DROP CONSTRAINT IF EXISTS scans_user_id_fkey;

-- Update RLS policies for public access
DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;

-- Create new public access policies
CREATE POLICY "Anyone can insert scans" 
ON public.scans 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view scans" 
ON public.scans 
FOR SELECT 
USING (true);
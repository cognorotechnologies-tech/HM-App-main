-- Create missing get_current_user_role function required by RLS policies

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.user_role;
BEGIN
  SELECT role INTO _role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN _role;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO postgres, anon, authenticated, service_role;

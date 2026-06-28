-- Fix: Rename departmentid to department_id to match code conventions
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='appointments' and column_name='departmentid')
  THEN
      ALTER TABLE public.appointments RENAME COLUMN "departmentid" TO "department_id";
  END IF;
END $$;

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload';

-- HR Laos: multi-tenant B2B HR schema
-- org_id isolation via RLS; helper get_user_org_id() for policies

-- ---------------------------------------------------------------------------
-- Extensions (Supabase: pgcrypto lives in schema "extensions")
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.organization_status AS ENUM (
  'active',
  'suspended',
  'trial',
  'churned'
);

CREATE TYPE public.organization_plan AS ENUM (
  'free',
  'starter',
  'professional',
  'enterprise'
);

CREATE TYPE public.user_role AS ENUM (
  'admin',
  'hr',
  'manager',
  'employee'
);

CREATE TYPE public.employment_contract_status AS ENUM (
  'draft',
  'active',
  'expired',
  'terminated'
);

CREATE TYPE public.employee_status AS ENUM (
  'active',
  'on_leave',
  'terminated'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name text NOT NULL,
  subdomain text NOT NULL,
  plan public.organization_plan NOT NULL DEFAULT 'free',
  status public.organization_status NOT NULL DEFAULT 'trial',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_subdomain_format CHECK (
    subdomain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'
  )
);

CREATE UNIQUE INDEX organizations_subdomain_key ON public.organizations (lower(subdomain));

CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'employee',
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_profiles_org_id_idx ON public.user_profiles (org_id);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  parent_id uuid REFERENCES public.departments (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX departments_org_id_idx ON public.departments (org_id);
CREATE INDEX departments_parent_id_idx ON public.departments (parent_id);

CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX positions_org_id_idx ON public.positions (org_id);
CREATE INDEX positions_department_id_idx ON public.positions (department_id);

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_profile_id uuid REFERENCES public.user_profiles (id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments (id) ON DELETE SET NULL,
  position_id uuid REFERENCES public.positions (id) ON DELETE SET NULL,
  employee_code text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  hired_on date,
  status public.employee_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX employees_org_id_idx ON public.employees (org_id);
CREATE INDEX employees_user_profile_id_idx ON public.employees (user_profile_id);
CREATE INDEX employees_department_id_idx ON public.employees (department_id);
CREATE INDEX employees_position_id_idx ON public.employees (position_id);

CREATE TABLE public.employment_contracts (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
  contract_type text NOT NULL DEFAULT 'full_time',
  start_date date NOT NULL,
  end_date date,
  salary_amount numeric(14, 2),
  currency text NOT NULL DEFAULT 'LAK',
  document_url text,
  status public.employment_contract_status NOT NULL DEFAULT 'draft',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX employment_contracts_org_id_idx ON public.employment_contracts (org_id);
CREATE INDEX employment_contracts_employee_id_idx ON public.employment_contracts (employee_id);

-- ---------------------------------------------------------------------------
-- Same-org integrity (CHECK cannot use subqueries in PostgreSQL — use triggers)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_departments_parent_same_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.departments p
      WHERE p.id = NEW.parent_id
        AND p.org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'departments: parent_id must reference a department in the same org'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER departments_enforce_parent_org
  BEFORE INSERT OR UPDATE OF parent_id, org_id ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_departments_parent_same_org();

CREATE OR REPLACE FUNCTION public.enforce_positions_department_same_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.department_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.departments d
      WHERE d.id = NEW.department_id
        AND d.org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'positions: department_id must belong to the same org'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER positions_enforce_department_org
  BEFORE INSERT OR UPDATE OF department_id, org_id ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_positions_department_same_org();

CREATE OR REPLACE FUNCTION public.enforce_employees_fk_same_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_profile_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.id = NEW.user_profile_id
        AND up.org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'employees: user_profile_id must belong to the same org'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.department_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.departments d
      WHERE d.id = NEW.department_id
        AND d.org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'employees: department_id must belong to the same org'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.position_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.positions p
      WHERE p.id = NEW.position_id
        AND p.org_id = NEW.org_id
    ) THEN
      RAISE EXCEPTION 'employees: position_id must belong to the same org'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER employees_enforce_fk_org
  BEFORE INSERT OR UPDATE OF org_id, user_profile_id, department_id, position_id ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_employees_fk_same_org();

CREATE OR REPLACE FUNCTION public.enforce_employment_contracts_employee_same_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.id = NEW.employee_id
      AND e.org_id = NEW.org_id
  ) THEN
    RAISE EXCEPTION 'employment_contracts: employee_id must belong to the same org'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER employment_contracts_enforce_employee_org
  BEFORE INSERT OR UPDATE OF employee_id, org_id ON public.employment_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_employment_contracts_employee_same_org();

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER departments_set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER positions_set_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER employees_set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER employment_contracts_set_updated_at
  BEFORE UPDATE ON public.employment_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helper: current user's org (SECURITY DEFINER bypasses RLS on user_profiles)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT up.org_id
  FROM public.user_profiles up
  WHERE up.id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_org_id() IS
  'Returns the caller''s organization id from user_profiles; used in RLS policies.';

CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin() TO service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_contracts ENABLE ROW LEVEL SECURITY;

-- organizations: members read; admins update own org (no insert/delete for clients by default)
CREATE POLICY organizations_select_member
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (id = public.get_user_org_id());

CREATE POLICY organizations_update_admin
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (id = public.get_user_org_id() AND public.is_org_admin())
  WITH CHECK (id = public.get_user_org_id());

-- user_profiles: same-org isolation; users manage own row; admins can manage org profiles
CREATE POLICY user_profiles_select_same_org
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id());

-- First row: org_id from JWT invite metadata (set server-side in app_metadata when inviting).
-- Later: org_id must match existing profile via get_user_org_id() (normally no second insert).
CREATE POLICY user_profiles_insert_self
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = org_id)
    AND (
      org_id = public.get_user_org_id()
      OR (
        NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid())
        AND org_id = coalesce(
          nullif(trim(auth.jwt() -> 'app_metadata' ->> 'org_id'), '')::uuid,
          nullif(trim(auth.jwt() -> 'user_metadata' ->> 'org_id'), '')::uuid
        )
      )
    )
  );

CREATE POLICY user_profiles_update_self_or_admin
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    org_id = public.get_user_org_id()
    AND (
      id = auth.uid()
      OR public.is_org_admin()
    )
  )
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY user_profiles_delete_admin
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (org_id = public.get_user_org_id() AND public.is_org_admin());

-- Tenant-scoped tables: full CRUD for authenticated members of the org
CREATE POLICY departments_all_same_org
  ON public.departments
  FOR ALL
  TO authenticated
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY positions_all_same_org
  ON public.positions
  FOR ALL
  TO authenticated
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY employees_all_same_org
  ON public.employees
  FOR ALL
  TO authenticated
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY employment_contracts_all_same_org
  ON public.employment_contracts
  FOR ALL
  TO authenticated
  USING (org_id = public.get_user_org_id())
  WITH CHECK (org_id = public.get_user_org_id());

-- ---------------------------------------------------------------------------
-- Grants (authenticated app users; service_role bypasses RLS)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_contracts TO authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: Postgres Changes for core HR entities
-- ---------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.departments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employment_contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;

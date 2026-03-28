-- Public tenant resolution by subdomain (anon-safe; no org data leakage beyond uuid)
CREATE OR REPLACE FUNCTION public.get_org_id_by_subdomain(p_subdomain text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id
  FROM public.organizations o
  WHERE lower(trim(o.subdomain)) = lower(trim(p_subdomain))
    AND o.status IN ('active', 'trial')
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_org_id_by_subdomain(text) IS
  'Resolve organization id from subdomain/slug for multi-tenant routing (callable before login).';

GRANT EXECUTE ON FUNCTION public.get_org_id_by_subdomain(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_org_id_by_subdomain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_id_by_subdomain(text) TO service_role;

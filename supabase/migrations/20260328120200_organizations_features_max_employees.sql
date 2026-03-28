-- Tenant plan limits & feature flags (used by edge gateway KV cache)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS max_employees integer;

COMMENT ON COLUMN public.organizations.features IS 'Feature flags for org (JSON array or object); cached at edge.';
COMMENT ON COLUMN public.organizations.max_employees IS 'Soft limit for billing / enforcement; nullable = no cap in DB.';

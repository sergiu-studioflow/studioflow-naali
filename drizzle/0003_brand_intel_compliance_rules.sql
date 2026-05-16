-- 0003_brand_intel_compliance_rules.sql
-- Add a single source of truth for Naali compliance rules.
-- Edited in /brand-intelligence; fetched at generation time by every Naali
-- generator workflow so rule changes take effect on the very next click.
ALTER TABLE brand_intelligence ADD COLUMN IF NOT EXISTS compliance_rules text;

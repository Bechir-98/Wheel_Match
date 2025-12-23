-- One-way migration: remove the clinician role (SLM owns matching now).
-- UTILISATEUR rows are kept: ex-clinician logins still authenticate but resolve to no role.
-- Consultation / MedicalEntry history and DemandeFauteuil.NOTES_CLINICIEN are kept.
-- Run inside the db container: psql -U postgres -d wheel -f drop_clinician.sql

BEGIN;

DROP TABLE IF EXISTS "LINK_REQUEST";
DROP TABLE IF EXISTS "CLINICIAN_PATIENT";
DROP TABLE IF EXISTS "CLINICIEN";

COMMIT;

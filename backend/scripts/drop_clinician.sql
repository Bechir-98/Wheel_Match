-- One-way migration: remove the clinician role (SLM owns matching now).
-- UTILISATEUR rows are kept: ex-clinician logins still authenticate but resolve to no role.
-- Consultation history is kept (read-only patient view).
-- DemandeFauteuil.NOTES_CLINICIEN is renamed to NOTES (data preserved).
-- Run inside the db container: psql -U postgres -d wheel -f drop_clinician.sql

BEGIN;

DROP TABLE IF EXISTS "LINK_REQUEST";
DROP TABLE IF EXISTS "CLINICIAN_PATIENT";
DROP TABLE IF EXISTS "CLINICIEN";
DROP TABLE IF EXISTS "MEDICAL_ENTRY";

ALTER TABLE "DEMANDE_FAUTEUIL" RENAME COLUMN "NOTES_CLINICIEN" TO "NOTES";
ALTER TABLE "PATIENT_MEDICAL" ALTER COLUMN "SOURCE" SET DEFAULT 'self';
UPDATE "PATIENT_MEDICAL" SET "SOURCE" = 'self' WHERE "SOURCE" = 'clinician';

COMMIT;

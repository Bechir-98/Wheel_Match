-- Bcrypt hashes need more than 10 characters. Run once if PASSWORD is too short.
-- PostgreSQL (identifiers match SQLAlchemy quoted uppercase tables):
ALTER TABLE "UTILISATEUR" ALTER COLUMN "PASSWORD" TYPE VARCHAR(255);

-- Both columns are nullable: existing rows (and admins) stay valid.
ALTER TABLE "users" ADD COLUMN "job_title" TEXT;
ALTER TABLE "users" ADD COLUMN "location" TEXT;
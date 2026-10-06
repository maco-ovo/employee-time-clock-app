-- Constraints Prisma cannot express in schema.prisma.
-- Paste this at the END of the generated migration.sql (the one ending in _init), then run:
--   npx prisma migrate dev

-- One open shift per employee (enforced by the database, not only by the API).
CREATE UNIQUE INDEX "shifts_one_open_per_user" ON "shifts" ("user_id") WHERE "clock_out" IS NULL;

-- Clock-out must be after clock-in.
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_clock_out_after_clock_in"
  CHECK ("clock_out" IS NULL OR "clock_out" > "clock_in");

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "clock_in" TIMESTAMPTZ(6) NOT NULL,
    "clock_out" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_edits" (
    "id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "edited_by" UUID NOT NULL,
    "edited_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "old_clock_in" TIMESTAMPTZ(6),
    "old_clock_out" TIMESTAMPTZ(6),
    "new_clock_in" TIMESTAMPTZ(6),
    "new_clock_out" TIMESTAMPTZ(6),

    CONSTRAINT "shift_edits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "shifts_user_id_clock_in_idx" ON "shifts"("user_id", "clock_in");

-- CreateIndex
CREATE INDEX "shift_edits_shift_id_idx" ON "shift_edits"("shift_id");

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_edits" ADD CONSTRAINT "shift_edits_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_edits" ADD CONSTRAINT "shift_edits_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

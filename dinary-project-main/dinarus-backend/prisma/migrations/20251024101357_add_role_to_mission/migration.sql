/*
  Warnings:

  - A unique constraint covering the columns `[type,role]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Mission" ADD COLUMN     "role" "public"."AudienceRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Mission_type_role_key" ON "public"."Mission"("type", "role");

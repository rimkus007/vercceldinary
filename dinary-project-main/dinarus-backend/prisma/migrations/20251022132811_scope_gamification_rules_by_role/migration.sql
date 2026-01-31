/*
  Warnings:

  - A unique constraint covering the columns `[level,role]` on the table `LevelRule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[action,role]` on the table `XpRule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."LevelRule_level_key";

-- DropIndex
DROP INDEX "public"."XpRule_action_key";

-- CreateIndex
CREATE UNIQUE INDEX "LevelRule_level_role_key" ON "public"."LevelRule"("level", "role");

-- CreateIndex
CREATE UNIQUE INDEX "XpRule_action_role_key" ON "public"."XpRule"("action", "role");

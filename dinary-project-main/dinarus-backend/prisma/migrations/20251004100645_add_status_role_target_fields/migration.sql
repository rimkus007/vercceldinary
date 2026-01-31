-- CreateEnum
CREATE TYPE "public"."AudienceRole" AS ENUM ('USER', 'MERCHANT');

-- AlterTable
ALTER TABLE "public"."CommissionRule" ADD COLUMN     "target" "public"."AudienceRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."LevelRule" ADD COLUMN     "role" "public"."AudienceRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."XpRule" ADD COLUMN     "role" "public"."AudienceRole" NOT NULL DEFAULT 'USER';

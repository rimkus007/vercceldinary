-- CreateEnum
CREATE TYPE "public"."ReferralRequiredAction" AS ENUM ('FIRST_TRANSACTION', 'FIRST_RECHARGE', 'FIRST_SALE', 'ACCOUNT_CREATED');

-- CreateTable
CREATE TABLE "public"."ReferralRule" (
    "id" TEXT NOT NULL,
    "referrerType" "public"."AudienceRole" NOT NULL,
    "refereeType" "public"."AudienceRole" NOT NULL,
    "requiredAction" "public"."ReferralRequiredAction" NOT NULL DEFAULT 'FIRST_TRANSACTION',
    "referrerReward" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "refereeReward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralRule_referrerType_refereeType_key" ON "public"."ReferralRule"("referrerType", "refereeType");

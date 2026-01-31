-- AlterTable
ALTER TABLE "RechargeRequest" ADD COLUMN "proofUrl" TEXT;

-- AlterTable (make reference nullable)
ALTER TABLE "RechargeRequest" ALTER COLUMN "reference" DROP NOT NULL;


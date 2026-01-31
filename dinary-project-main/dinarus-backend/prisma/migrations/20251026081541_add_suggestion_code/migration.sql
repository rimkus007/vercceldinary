/*
  Warnings:

  - A unique constraint covering the columns `[suggestionCode]` on the table `MerchantSuggestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[claimedByMerchantId]` on the table `MerchantSuggestion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."MerchantSuggestion" ADD COLUMN     "claimedByMerchantId" TEXT,
ADD COLUMN     "suggestionCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MerchantSuggestion_suggestionCode_key" ON "public"."MerchantSuggestion"("suggestionCode");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantSuggestion_claimedByMerchantId_key" ON "public"."MerchantSuggestion"("claimedByMerchantId");

-- AddForeignKey
ALTER TABLE "public"."MerchantSuggestion" ADD CONSTRAINT "MerchantSuggestion_claimedByMerchantId_fkey" FOREIGN KEY ("claimedByMerchantId") REFERENCES "public"."Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

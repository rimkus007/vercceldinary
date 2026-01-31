-- CreateTable
CREATE TABLE "VerificationArchive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userFullName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" TEXT,
    "documentType" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "VerificationArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationArchive_userId_idx" ON "VerificationArchive"("userId");

-- CreateIndex
CREATE INDEX "VerificationArchive_userEmail_idx" ON "VerificationArchive"("userEmail");

-- CreateIndex
CREATE INDEX "VerificationArchive_archivedAt_idx" ON "VerificationArchive"("archivedAt");

-- AddForeignKey
ALTER TABLE "VerificationArchive" ADD CONSTRAINT "VerificationArchive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


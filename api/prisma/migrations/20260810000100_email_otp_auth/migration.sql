CREATE TYPE "AccountStatus" AS ENUM ('UNVERIFIED', 'ACTIVE', 'BLOCKED');
CREATE TYPE "VerificationPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET');

ALTER TABLE "User"
ADD COLUMN "mobile" TEXT,
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "mobileVerifiedAt" TIMESTAMP(3),
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE "VerificationCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "purpose" "VerificationPurpose" NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "VerificationCode_userId_purpose_createdAt_idx" ON "VerificationCode"("userId", "purpose", "createdAt");
CREATE INDEX "VerificationCode_expiresAt_idx" ON "VerificationCode"("expiresAt");

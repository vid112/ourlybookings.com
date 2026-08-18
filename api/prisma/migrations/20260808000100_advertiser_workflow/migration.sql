CREATE TYPE "ModerationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED');

ALTER TABLE "Profile"
ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN "ownerId" TEXT,
ADD COLUMN "contactTelegram" TEXT,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "promotionAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "adminPriority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "moderationMessage" TEXT,
ADD COLUMN "submittedAt" TIMESTAMP(3);

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Profile_moderationStatus_submittedAt_idx" ON "Profile"("moderationStatus", "submittedAt");
CREATE INDEX "Profile_adminPriority_promotionAmount_idx" ON "Profile"("adminPriority", "promotionAmount");
CREATE INDEX "Profile_ownerId_updatedAt_idx" ON "Profile"("ownerId", "updatedAt");

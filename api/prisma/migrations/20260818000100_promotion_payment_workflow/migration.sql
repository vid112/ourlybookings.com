CREATE TYPE "PromotionPlan" AS ENUM ('PRIME', 'VIP', 'HIGHLIGHT');

ALTER TABLE "Profile"
ADD COLUMN "promotionPlan" "PromotionPlan",
ADD COLUMN "promotionDurationDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "promotionWindow" TEXT,
ADD COLUMN "promotionStartsAt" TIMESTAMP(3),
ADD COLUMN "promotionEndsAt" TIMESTAMP(3),
ADD COLUMN "paymentProofMediaId" TEXT,
ADD COLUMN "paymentProofUrl" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedById" TEXT;

CREATE INDEX "Profile_paymentStatus_paymentSubmittedAt_idx"
ON "Profile"("paymentStatus", "paymentSubmittedAt");

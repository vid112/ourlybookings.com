ALTER TABLE "User"
ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Profile"
ADD COLUMN "adTitle" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "ethnicity" TEXT,
ADD COLUMN "eyeColor" TEXT,
ADD COLUMN "hairColor" TEXT,
ADD COLUMN "weightKg" INTEGER,
ADD COLUMN "heightCm" INTEGER,
ADD COLUMN "bodyType" TEXT,
ADD COLUMN "bust" TEXT,
ADD COLUMN "attentionTo" TEXT,
ADD COLUMN "placeOfService" TEXT,
ADD COLUMN "availabilitySlots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Category"
ADD COLUMN "imageUrl" TEXT;

CREATE INDEX "Profile_gender_idx" ON "Profile"("gender");
CREATE INDEX "Profile_ethnicity_idx" ON "Profile"("ethnicity");
CREATE INDEX "Profile_bodyType_idx" ON "Profile"("bodyType");

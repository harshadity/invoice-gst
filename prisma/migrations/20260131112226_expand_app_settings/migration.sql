-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trialEndsAt" DATETIME,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "companyLegalName" TEXT,
    "brandName" TEXT,
    "businessType" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "registeredNumber" TEXT,
    "cin" TEXT,
    "authorizedSignatory" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "contactEmail" TEXT,
    "supportEmail" TEXT,
    "website" TEXT,
    "supportTimings" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT,
    "fullAddress" TEXT,
    "invoicePrefix" TEXT,
    "invoiceStartNumber" INTEGER NOT NULL DEFAULT 1,
    "defaultTaxPercentage" REAL NOT NULL DEFAULT 0.0,
    "invoiceFooterLine" TEXT,
    "terms" TEXT,
    "declaration" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "brandColor" TEXT,
    "accentColor" TEXT,
    "fontFamily" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "youtube" TEXT,
    "pinterest" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSettings" ("addressLine1", "addressLine2", "brandName", "city", "companyLegalName", "contactEmail", "country", "createdAt", "facebook", "gstin", "id", "instagram", "invoiceFooterLine", "logoUrl", "phone", "pincode", "pinterest", "registeredNumber", "shop", "signatureUrl", "state", "terms", "twitter", "updatedAt", "website", "youtube") SELECT "addressLine1", "addressLine2", "brandName", "city", "companyLegalName", "contactEmail", "country", "createdAt", "facebook", "gstin", "id", "instagram", "invoiceFooterLine", "logoUrl", "phone", "pincode", "pinterest", "registeredNumber", "shop", "signatureUrl", "state", "terms", "twitter", "updatedAt", "website", "youtube" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");
CREATE TABLE "new_TemplateCustomization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "customizations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TemplateCustomization" ("createdAt", "customizations", "id", "isActive", "shop", "templateId", "templateType", "updatedAt") SELECT "createdAt", "customizations", "id", "isActive", "shop", "templateId", "templateType", "updatedAt" FROM "TemplateCustomization";
DROP TABLE "TemplateCustomization";
ALTER TABLE "new_TemplateCustomization" RENAME TO "TemplateCustomization";
CREATE INDEX "TemplateCustomization_shop_idx" ON "TemplateCustomization"("shop");
CREATE UNIQUE INDEX "TemplateCustomization_shop_templateType_key" ON "TemplateCustomization"("shop", "templateType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_shop_key" ON "Subscription"("shop");

-- CreateIndex
CREATE INDEX "EmailAutomation_shop_idx" ON "EmailAutomation"("shop");

-- CreateIndex
CREATE INDEX "ProductGST_shop_idx" ON "ProductGST"("shop");

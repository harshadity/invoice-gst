-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_AppSettings" ("accentColor", "addressLine1", "addressLine2", "authorizedSignatory", "brandColor", "brandName", "businessType", "cin", "city", "companyLegalName", "contactEmail", "country", "createdAt", "declaration", "defaultTaxPercentage", "facebook", "fontFamily", "fullAddress", "gstin", "id", "instagram", "invoiceFooterLine", "invoicePrefix", "invoiceStartNumber", "isVerified", "linkedin", "logoUrl", "pan", "phone", "pincode", "pinterest", "registeredNumber", "shop", "signatureUrl", "state", "supportEmail", "supportTimings", "terms", "twitter", "updatedAt", "verifiedAt", "website", "whatsapp", "youtube") SELECT "accentColor", "addressLine1", "addressLine2", "authorizedSignatory", "brandColor", "brandName", "businessType", "cin", "city", "companyLegalName", "contactEmail", "country", "createdAt", "declaration", "defaultTaxPercentage", "facebook", "fontFamily", "fullAddress", "gstin", "id", "instagram", "invoiceFooterLine", "invoicePrefix", "invoiceStartNumber", "isVerified", "linkedin", "logoUrl", "pan", "phone", "pincode", "pinterest", "registeredNumber", "shop", "signatureUrl", "state", "supportEmail", "supportTimings", "terms", "twitter", "updatedAt", "verifiedAt", "website", "whatsapp", "youtube" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

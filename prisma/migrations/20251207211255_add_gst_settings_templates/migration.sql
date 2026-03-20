-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "companyLegalName" TEXT,
    "phone" TEXT,
    "brandName" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT,
    "invoiceFooterLine" TEXT,
    "registeredNumber" TEXT,
    "gstin" TEXT,
    "terms" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "pinterest" TEXT,
    "youtube" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductGST" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "gstPercentage" REAL NOT NULL DEFAULT 18.0,
    "hsnCode" TEXT,
    "taxCategory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateCustomization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "customizations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ProductGST_shop_productId_key" ON "ProductGST"("shop", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCustomization_shop_templateType_key" ON "TemplateCustomization"("shop", "templateType");

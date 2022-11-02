-- CreateTable
CREATE TABLE "AccountSubType" (
    "accountSubTypeId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "denomination" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountSubTypeId" TEXT,
    "bankId" TEXT,
    CONSTRAINT "Account_accountSubTypeId_fkey" FOREIGN KEY ("accountSubTypeId") REFERENCES "AccountSubType" ("accountSubTypeId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountClosure" (
    "parentAccountId" TEXT NOT NULL,
    "childAccountId" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    CONSTRAINT "AccountClosure_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccountClosure_childAccountId_fkey" FOREIGN KEY ("childAccountId") REFERENCES "Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ledger" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ledgerId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ledgerType" TEXT NOT NULL DEFAULT 'nominal'
);

-- CreateTable
CREATE TABLE "Transaction" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "transactionId" TEXT NOT NULL PRIMARY KEY,
    "transactionDate" DATETIME NOT NULL,
    "debitAmount" DECIMAL NOT NULL,
    "creditAmount" DECIMAL NOT NULL,
    "accountId" TEXT,
    "supplierId" TEXT,
    "customerId" TEXT,
    "journalEntryId" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("accountId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("supplierId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("customerId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry" ("journalEntryId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger" ("ledgerId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "journalEntryId" TEXT NOT NULL PRIMARY KEY,
    "exchangeRate" DECIMAL,
    "bankReconciledDate" DATETIME,
    "vatReportedDate" DATETIME,
    "purchaseRecordId" TEXT,
    "saleRecordId" TEXT,
    CONSTRAINT "JournalEntry_purchaseRecordId_fkey" FOREIGN KEY ("purchaseRecordId") REFERENCES "PurchaseRecord" ("purchaseRecordId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_saleRecordId_fkey" FOREIGN KEY ("saleRecordId") REFERENCES "SaleRecord" ("saleRecordId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "supplierId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "defaultNominalAccountId" TEXT,
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "ledgerId" TEXT NOT NULL,
    CONSTRAINT "Supplier_defaultNominalAccountId_fkey" FOREIGN KEY ("defaultNominalAccountId") REFERENCES "Account" ("accountId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Supplier_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address" ("addressId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Supplier_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address" ("addressId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Supplier_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger" ("ledgerId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "defaultNominalAccountId" TEXT,
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "ledgerId" TEXT NOT NULL,
    CONSTRAINT "Customer_defaultNominalAccountId_fkey" FOREIGN KEY ("defaultNominalAccountId") REFERENCES "Account" ("accountId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Customer_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address" ("addressId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Customer_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address" ("addressId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Customer_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger" ("ledgerId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Address" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addressId" TEXT NOT NULL PRIMARY KEY,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "addressLine3" TEXT,
    "addressLine4" TEXT,
    "city" TEXT,
    "provinceStateCounty" TEXT,
    "zipPostalCode" TEXT,
    "country" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LineItem" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lineItemId" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "netAmount" DECIMAL NOT NULL,
    "vatAmount" DECIMAL NOT NULL,
    "grossAmount" DECIMAL NOT NULL,
    "nominalAccountId" TEXT NOT NULL,
    "purchaseRecordId" TEXT,
    "saleRecordId" TEXT,
    CONSTRAINT "LineItem_nominalAccountId_fkey" FOREIGN KEY ("nominalAccountId") REFERENCES "Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LineItem_purchaseRecordId_fkey" FOREIGN KEY ("purchaseRecordId") REFERENCES "PurchaseRecord" ("purchaseRecordId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LineItem_saleRecordId_fkey" FOREIGN KEY ("saleRecordId") REFERENCES "SaleRecord" ("saleRecordId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseRecord" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "purchaseRecordId" TEXT NOT NULL PRIMARY KEY,
    "transactionType" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Outstanding',
    "reference" TEXT,
    "attachmentLink" TEXT,
    "denomination" TEXT NOT NULL,
    "exchangeRate" DECIMAL NOT NULL,
    "grossAmount" DECIMAL NOT NULL,
    "supplierId" TEXT,
    "dueDate" DATETIME,
    "purchaseInvoiceId" TEXT,
    "journalEntryId" TEXT,
    CONSTRAINT "PurchaseRecord_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("supplierId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PurchaseRecord_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES "PurchaseRecord" ("purchaseRecordId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaleRecord" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "saleRecordId" TEXT NOT NULL PRIMARY KEY,
    "transactionType" TEXT NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Outstanding',
    "reference" TEXT,
    "attachmentLink" TEXT,
    "denomination" TEXT NOT NULL,
    "exchangeRate" DECIMAL NOT NULL,
    "grossAmount" DECIMAL NOT NULL,
    "customerId" TEXT,
    "dueDate" DATETIME,
    "saleInvoiceId" TEXT,
    "journalEntryId" TEXT,
    CONSTRAINT "SaleRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("customerId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SaleRecord_saleInvoiceId_fkey" FOREIGN KEY ("saleInvoiceId") REFERENCES "SaleRecord" ("saleRecordId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bank" (
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "bankId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "nominalAssetAccountId" TEXT NOT NULL,
    CONSTRAINT "Bank_nominalAssetAccountId_fkey" FOREIGN KEY ("nominalAssetAccountId") REFERENCES "Account" ("accountId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountSubType_name_category_type_key" ON "AccountSubType"("name", "category", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AccountClosure_parentAccountId_childAccountId_depth_key" ON "AccountClosure"("parentAccountId", "childAccountId", "depth");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_purchaseRecordId_key" ON "JournalEntry"("purchaseRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_saleRecordId_key" ON "JournalEntry"("saleRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_shippingAddressId_key" ON "Supplier"("shippingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_billingAddressId_key" ON "Supplier"("billingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_shippingAddressId_key" ON "Customer"("shippingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_billingAddressId_key" ON "Customer"("billingAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRecord_journalEntryId_key" ON "PurchaseRecord"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleRecord_journalEntryId_key" ON "SaleRecord"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Bank_nominalAssetAccountId_key" ON "Bank"("nominalAssetAccountId");

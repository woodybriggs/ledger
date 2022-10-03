export enum TransactionType {
  SalesInvoice = 'Sales Invoice',
  PurchaseInvoice = 'Purchase Invoice',

  SalesInvoicePayment = 'Sales Invoice Payment',
  PurchaseInvoicePayment = 'Purchase Invoice Payment',

  InstantSale = 'Instant Sale',
  InstantExpense = 'Instant Expense',
  
  // Nominal Ledger
  Journal = 'Journal'
}
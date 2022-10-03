import { Transaction } from "@prisma/client"
import { TransactionType } from "../constants/transaction-types"

const getTransactionDisplayAmount = (transaction: Transaction): number => {
  switch(transaction.transactionType as TransactionType)
  {
    case TransactionType.InstantExpense: return transaction.debitAmount 
    case TransactionType.PurchaseInvoice: return transaction.creditAmount
    case TransactionType.PurchaseInvoicePayment: return -transaction.debitAmount

    case TransactionType.InstantSale: return transaction.creditAmount
    case TransactionType.SalesInvoice: return transaction.debitAmount
    case TransactionType.SalesInvoicePayment: return -transaction.creditAmount
  }

  return 0
}

export type TransactionRowData = {
  journalEntryId: string,
  transactionDate: Date,
  transactionType: TransactionType
  description: string,
  denomination: string,
  amount: number
}

export const formatTransactions = (transactions: Transaction[]): TransactionRowData[] => {
  return transactions.map(t => ({
    journalEntryId: t.journalEntryId,
    transactionDate: t.transactionDate,
    transactionType: t.transactionType as TransactionType,
    description: t.description,
    denomination: t.denomination,
    amount: getTransactionDisplayAmount(t)
  }))
}
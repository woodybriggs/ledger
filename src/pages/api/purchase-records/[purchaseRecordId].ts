import { Prisma } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"
import { client } from "@localprisma/db-client"
import { LedgerId } from "@src/constants/ledgers"
import { PresetAccountId } from "@src/schemas/account.schema"
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher"
import { PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema"

export const getAccountsPayableBalance = (record: Omit<PurchaseRecordDto, 'totalDue'>): Prisma.Decimal => {
  const purchaseInvoiceTransactions = record.journalEntry?.transactions || []

  const credits = purchaseInvoiceTransactions.filter(t => (
    t.accountId === PresetAccountId.AccountsPayable
  ))

  const existingPaymentTransactions = record.payments?.map(p => p.journalEntry?.transactions || [])
    .flat()

  const debits = existingPaymentTransactions?.filter(t => (
    t.accountId === PresetAccountId.AccountsPayable
  ))

  const totalCredit = credits.reduce((acc, n) => acc.add(n.creditAmount.toString()), new Prisma.Decimal(0))
  const totalDebit = debits?.reduce((acc, n) => acc.add(n.debitAmount.toString()), new Prisma.Decimal(0))

  return totalCredit.sub(totalDebit || 0)
}

export const getRemainingBalance = (record: Omit<PurchaseRecordDto, 'totalDue' | 'supplier' | 'lineItems'>): Prisma.Decimal => {

  const purchaseInvoiceTransactions = record.journalEntry?.transactions || []

  const credits = purchaseInvoiceTransactions.filter(t => (
    t.ledgerId === LedgerId.Supplier
  ))

  const existingPaymentTransactions = record.payments?.map(p => p.journalEntry?.transactions || [])
    .flat()
  
  const debits = existingPaymentTransactions?.filter(t => (
    t.ledgerId === LedgerId.Supplier
  ))

  const totalCredit = credits.reduce((acc, n) => acc.add(n.creditAmount.toString()), new Prisma.Decimal(0))
  const totalDebit = debits?.reduce((acc, n) => acc.add(n.debitAmount.toString()), new Prisma.Decimal(0))

  return totalCredit.sub(totalDebit || 0)
}

const getPurchaseRecord = async (
  req: NextApiRequest,
  res: NextApiResponse<PurchaseRecordDto>
) => {
  const { purchaseRecordId } = req.query as { purchaseRecordId: string }

  const purchaseRecord = await client.purchaseRecord.findFirst({ 
    where: { purchaseRecordId },
    include: {
      lineItems: {
        include: {
          nominalAccount: true
        },
      },
      supplier: true,
      journalEntry: {
        include: {
          transactions: true
        }
      },
      payments: {
        include: {
          journalEntry: {
            include: {
              transactions: true
            }
          }
        }
      }
    }
  })
  if (!purchaseRecord) return res.status(404)

  return res.status(200).json({
    ...purchaseRecord,
    transactionType: purchaseRecord.transactionType as unknown as PurchaseRecordType,
    totalDue: getRemainingBalance(purchaseRecord)
  })
}

export default methodHandlerDispatcher({
  GET: getPurchaseRecord
})
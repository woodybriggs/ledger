import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next"
import { client } from "@localprisma/db-client"
import { LedgerId } from "@src/constants/ledgers"
import { PresetAccountId } from "@src/schemas/account.schema"
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher"
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";

export const getAccountsReceivableBalance = (record: Omit<SaleRecordDto, 'totalDue'>): Prisma.Decimal => {
  const purchaseInvoiceTransactions = record.journalEntry?.transactions || []

  const credits = purchaseInvoiceTransactions.filter(t => (
    t.accountId === PresetAccountId.AccountsReceivable
  ))

  const existingPaymentTransactions = record.payments?.map(p => p.journalEntry?.transactions || [])
    .flat()

  const debits = existingPaymentTransactions?.filter(t => (
    t.accountId === PresetAccountId.AccountsReceivable
  ))

  const totalCredit = credits.reduce((acc, n) => acc.add(n.creditAmount.toString()), new Prisma.Decimal(0))
  const totalDebit = debits?.reduce((acc, n) => acc.add(n.debitAmount.toString()), new Prisma.Decimal(0))

  return totalCredit.sub(totalDebit || 0)
}

export const getRemainingBalance = (record: Omit<SaleRecordDto, 'totalDue' | 'customer' | 'lineItems'>): Prisma.Decimal => {

  const purchaseInvoiceTransactions = record.journalEntry?.transactions || []

  const credits = purchaseInvoiceTransactions?.filter(t => (
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

const getSaleRecord = async (
  req: NextApiRequest,
  res: NextApiResponse<SaleRecordDto>
) => {
  const { saleRecordId } = req.query as { saleRecordId: string }

  const saleRecord = await client.saleRecord.findFirst({ 
    where: { saleRecordId },
    include: {
      lineItems: {
        include: {
          nominalAccount: true
        },
      },
      customer: true,
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
  if (!saleRecord) return res.status(404)

  return res.status(200).json({
    ...saleRecord,
    transactionType: saleRecord.transactionType as unknown as SaleRecordType,
    totalDue: getRemainingBalance(saleRecord)
  })
}

export default methodHandlerDispatcher({
  GET: getSaleRecord
})
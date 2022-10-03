import { JournalEntry, PrismaClient, Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreateJournalEntrySchema } from "../../../src/schemas/journal-entry.schema";
import { CreateTransactionSchema } from "../../../src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";


const client = new PrismaClient()

const validateEntryTransactions = (transactions: z.infer<typeof CreateTransactionSchema>[]): [boolean, number] => {
  const totalDebits = transactions.map(t => t.debitAmount).reduce((total, next) => total + next, 0)
  const totalCredits = transactions.map(t => t.creditAmount).reduce((total, next) => total + next, 0)
  return [((totalCredits - totalDebits) === 0), totalCredits - totalDebits];
}

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  const { body } = req;
  const parseResult = CreateJournalEntrySchema.safeParse(body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  const [isValidEntry, errorAmount] = validateEntryTransactions(parseResult.data.transactions);
  if (!isValidEntry) return res.status(400).json({ message: `Debit and Credit inbalance of ${errorAmount}` })

  const transactions: Pick<Transaction, 'transactionDate' | 'description' | 'accountId' | 'debitAmount' | 'creditAmount'>[] = parseResult.data.transactions.map(({
    transactionDate,
    description,
    account: { accountId },
    debitAmount,
    creditAmount
  }) => ({
    transactionDate: new Date(transactionDate),
    description,
    accountId,
    debitAmount,
    creditAmount
  }))

  const journalEntry = await client.journalEntry.create({ 
    data: {
      transactions: {
        create: transactions
      }
    },
    include: {
      transactions: true
    }
  })

  return res.status(201).json(journalEntry)
}


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ journalEntries: (JournalEntry & { transactions: Transaction[]; })[]}>
) => {
  const journals = await client.journalEntry.findMany({
    include: {
      transactions: true
    }
  })

  return res.status(200).json({ journalEntries: journals })
}


export default methodHandlerDispatcher({
  GET: getHandler,
  POST: postHandler
})
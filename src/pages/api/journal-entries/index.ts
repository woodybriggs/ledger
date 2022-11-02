import { JournalEntry, Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@localprisma/db-client";
import { CreateJournalEntrySchema, JournalEntryDto } from "@src/schemas/journal-entry.schema";
import { CreateTransactionDto } from "@src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";



const validateEntryTransactions = (transactions: CreateTransactionDto[]): [boolean, Prisma.Decimal] => {
  const totalDebits = transactions.map(t => t.debitAmount).reduce((total, next) => total.add(next), new Prisma.Decimal(0))
  const totalCredits = transactions.map(t => t.creditAmount).reduce((total, next) => total.add(next), new Prisma.Decimal(0))
  return [((totalCredits.sub(totalDebits)).eq(0)), totalCredits.sub(totalDebits)];
}

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<JournalEntryDto | ZodError | { message: string }>
) => {
  const { body } = req;
  const parseResult = CreateJournalEntrySchema.safeParse(body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  const [isValidEntry, errorAmount] = validateEntryTransactions(parseResult.data.transactions);
  if (!isValidEntry) return res.status(400).json({ message: `Debit and Credit inbalance of ${errorAmount}` })

  const { transactions } = parseResult.data

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
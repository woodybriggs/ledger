import { JournalEntry, PrismaClient, Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";

const client = new PrismaClient()

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<JournalEntry & { transactions: Transaction[] }>
) => {

  const { journalEntryId } = req.query;

  const entry = await client.journalEntry.findFirst({
    where: {
      journalEntryId: journalEntryId as string
    },
    include: {
      transactions: {
        include: {
          account: true,
          supplier: true,
          customer: true
        }
      }
    }
  })

  if (!entry) return res.status(404)

  return res.status(200).json(entry)
}

export default methodHandlerDispatcher({
  GET: getHandler
})
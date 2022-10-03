import { Account, Customer, PrismaClient, Supplier, Transaction } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { ListTransactionsQuerySchema } from "../../../src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";

const client = new PrismaClient();

export type TransactionDto = Transaction & {
  account: Account | null,
  supplier: Supplier | null,
  customer: Customer | null
}

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: TransactionDto[];
  } | ZodError>
) => {

  const { query } = req;

  const parsedResult = ListTransactionsQuerySchema.safeParse(query);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const { accountId, ledgerId, customerId, supplierId } = parsedResult.data;

  const filter = {
    accountId: accountId,
    ledgerId: ledgerId,
    customerId: customerId,
    supplierId: supplierId
  }
  const transactions = await client.transaction.findMany({
    where: filter,
    include: {
      account: true,
      supplier: true,
      customer: true
    }
  })

  return res.status(200).json({ data: transactions })

}

export default methodHandlerDispatcher({
  GET: getHandler,
});

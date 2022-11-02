import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import { ListTransactionsQuerySchema, TransactionDto } from "@src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import { Prisma } from "@prisma/client";


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

  const where: Prisma.TransactionWhereInput = {
    accountId: accountId,
    ledgerId: ledgerId,
    customerId: customerId,
    supplierId: supplierId
  }
  const transactions = await client.transaction.findMany({
    where,
    include: {
      account: true,
      supplier: true,
      customer: true
    }
  })

  // @TypeHack: this is annoying because : Prisma.Decimal != DecimalJs.Decimal 
  return res.status(200).json({ data: transactions as unknown as TransactionDto[] })
}

export default methodHandlerDispatcher({
  GET: getHandler,
});

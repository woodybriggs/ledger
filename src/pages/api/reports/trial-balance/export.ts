import { Prisma } from "@prisma/client";;
import { json2csvAsync } from "json-2-csv";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { trialBalanceQuery } from ".";
import { TrialBalanceQuerySchema } from "@src/schemas/trial-balance.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";

const exportTrialBalanceHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<string | ZodError>
) => {
  const { query } = req;
  const parsedResult = TrialBalanceQuerySchema.safeParse(query);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { fromDate, toDate } = parsedResult.data;

  const data = await trialBalanceQuery(fromDate, toDate)
  const balances = data.map((t) => ({
    ...t,
    totalCredit: new Prisma.Decimal(String(t.totalCredit)),
    totalDebit: new Prisma.Decimal(String(t.totalDebit)),
  })).filter(t => t.accountId !== 'root');

  const csvRows = balances.map(b => ({
    'Account Name': b.name,
    'Account Number': b.number,
    'Account Category': b.category,
    'Account Type': b.type,
    'Account Sub Type': b.accountSubTypeName || '',
    'Total Debit': b.totalDebit.toFixed(2),
    'Total Credit': b.totalCredit.toFixed(2)
  }))

  const csvString = await json2csvAsync(csvRows)

  return res
    .status(200)
    .setHeader("Content-Type", "text/csv")
    .setHeader("Content-Disposition", `attachment; filename=trial_balance.csv`)
    .send(csvString)
};

export default methodHandlerDispatcher({
  GET: exportTrialBalanceHandler
})
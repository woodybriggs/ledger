import { Prisma } from "@prisma/client";;
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import {
  TrialBalanceDto,
  TrialBalanceLineDto,
  TrialBalanceQuerySchema,
} from "@src/schemas/trial-balance.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";

export const trialBalanceQuery = (fromDate: Date, toDate: Date) => client.$queryRawUnsafe<TrialBalanceLineDto[]>(`
SELECT a.*,
ast.name as accountSubTypeName,
SUM(totalDebit) as totalDebit,
SUM(totalCredit) as totalCredit
FROM (SELECT acc.parentAccountId,
acc.childAccountId,
acc.depth,
CASE WHEN totals.debits IS NULL THEN 0 ELSE totals.debits END AS totalDebit,
CASE WHEN totals.credits IS NULL THEN 0 ELSE totals.credits END AS totalCredit
FROM AccountClosure acc
LEFT JOIN
(
    SELECT accountId,
            SUM(debitAmount) AS debits,
            SUM(creditAmount) AS credits
      FROM [Transaction]
      WHERE ledgerId = "nominal" AND 
            date(transactionDate / 1000, 'unixepoch') BETWEEN $1 AND $2
      GROUP BY accountId
)
totals ON totals.accountId = acc.childAccountId
ORDER BY depth DESC)
LEFT JOIN [Account] a on a.accountId = parentAccountId
LEFT JOIN [AccountSubType] ast on a.accountSubTypeId = ast.accountSubTypeId 
GROUP BY parentAccountId
ORDER BY number ASC;
`, fromDate.toISOString(), toDate.toISOString())



const getTrialBalanceHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TrialBalanceDto | ZodError>
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
  }));

  return res.status(200).json({ data: balances });
};

export default methodHandlerDispatcher({
  GET: getTrialBalanceHandler
});

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  Account,
  AccountClosure,
  AccountSubType,
  PrismaClient,
} from "@prisma/client";
import { z, ZodError } from "zod";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import {
  AccountDto,
  CreateAccountSchema,
  ListAccountsQuerySchema,
  PresetAccountId,
} from "@src/schemas/account.schema";
import { sqltag } from "@prisma/client/runtime";
import { ClosureTableRepository } from "@localprisma/closure-table.repository";
import { client } from "@localprisma/db-client";


const post = async (
  req: NextApiRequest,
  res: NextApiResponse<Account | ZodError | Error>
) => {
  const body = req.body;

  const parseResult = CreateAccountSchema.safeParse(body);
  if (!parseResult.success) return res.status(400).json(parseResult.error);

  const { data } = parseResult;
  const { parentAccountId } = data;

  const clousreTableRepo = new ClosureTableRepository(
    client,
    "AccountClosure",
    "parentAccountId",
    "childAccountId",
    "depth"
  );
  const account = await client.account.create({
    data: {
      category: data.category,
      type: data.type,
      name: data.name,
      number: data.number,
      denomination: data.denomination,
      accountSubTypeId: data.accountSubTypeId,
    },
  });
  await clousreTableRepo.insertSelfRef(account.accountId);

  if (parentAccountId) {
    const parentAccount = await client.account.findFirst({
      where: { accountId: parentAccountId },
    });
    if (!parentAccount)
      return res
        .status(400)
        .json(new Error(`Parent Account ${parentAccountId} does not exist`));
    await clousreTableRepo.insertChild(
      parentAccount.accountId,
      account.accountId
    );
  } else {
    await clousreTableRepo.insertChild(
      PresetAccountId.Root,
      account.accountId
    );
  }

  return res.status(201).json(account);
};

const allAccounts = sqltag`
SELECT a.*,
  ast.name as accountSubType,
  SUM(t.debitAmount) as totalDebit, 
  SUM(t.creditAmount) as totalCredit,
  SUM(t.debitAmount) - SUM(t.creditAmount) as balance
FROM "Account" a
LEFT JOIN "AccountSubTypes" ast ON ast.accountSubTypeId = a.accountSubTypeId
LEFT JOIN "Transaction" t ON a.accountId = t.accountId
GROUP BY a.accountId
`;

const chartOfAccounts = sqltag`
WITH data AS (
  SELECT Account.*,
         CASE WHEN SUM([Transaction].debitAmount) IS NULL THEN 0 ELSE SUM([Transaction].debitAmount) END AS totalDebit,
         CASE WHEN SUM([Transaction].creditAmount) IS NULL THEN 0 ELSE SUM([Transaction].creditAmount) END AS totalCredit,
         AccountClosure.*
    FROM Account
         LEFT JOIN
         [Transaction] ON [Transaction].accountId = Account.accountId
         LEFT JOIN
         AccountClosure ON AccountClosure.childAccountId = Account.accountId
   GROUP BY AccountClosure.depth,
            AccountClosure.parentAccountId
)
SELECT parentAccountId,
     accountId,
     accountType,
     denomination,
     createdAt,
     updatedAt,
     name,
     SUM(totalDebit) as totalDebit,
     SUM(totalCredit) as totalCredit
FROM data
GROUP BY parentAccountId;
`;

export type RawAccount = Account & {
  accountSubType: AccountSubType | null;
  parents: (AccountClosure & { parentAccount: Account })[];
};

const serializeAccount = (rawAccount: RawAccount): AccountDto => {
  const {
    accountId,
    createdAt,
    updatedAt,
    name,
    denomination,
    number,
    category,
    type,
    accountSubTypeId,
    accountSubType,
    parents,
  } = rawAccount;
  return {
    accountId,
    createdAt,
    updatedAt,
    name,
    number,
    denomination,
    category,
    type,
    accountSubTypeId,
    accountSubType,
    parentAccountId: parents.length === 0 ? null : parents.map((pc) => pc.parentAccount)[0].accountId,
    parentAccount:
      parents.length === 0 ? null : parents.map((pc) => pc.parentAccount)[0],
  };
};

const serializeAccounts = (rawAccounts: RawAccount[]): AccountDto[] => {
  return rawAccounts.map(serializeAccount);
};

const get = async (
  req: NextApiRequest,
  res: NextApiResponse<{ data: AccountDto[] } | ZodError>
) => {
  const { query } = req;

  const parsedResult = ListAccountsQuerySchema.safeParse(query);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { setting, types } = parsedResult.data;


  let filter = undefined;
  if (types === 'all') {}
  else if (Array.isArray(types)) {
    setting === 'include' 
    ? filter = { type: { in: types } }
    : setting === 'exclude'
    ? filter = { type: { notIn: types } }
    : undefined
  }
  else {
    setting === 'include' 
    ? filter = { type: types }
    : setting === 'exclude'
    ? filter = { type: types }
    : undefined
  }

  const accounts = await client.account.findMany({
    include: {
      accountSubType: true,
      parents: {
        where: {
          AND: [
            { depth: 1 },
            {
              parentAccountId: {
                not: "root",
              },
            },
          ],
        },
        include: {
          parentAccount: true,
        },
      },
    },
    where: {
      AND: [
        {
          accountId: {
            not: PresetAccountId.Root,
            
          },
        },
        (filter as any),
      ],
    },
  });

  return res.status(200).json({
    data: serializeAccounts(accounts),
  });
};

export default methodHandlerDispatcher({
  GET: get,
  POST: post,
});

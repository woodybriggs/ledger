import { AccountSubType, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { client } from "../../../prisma/db-client";
import { AccountType } from "../../../src/constants/account-taxonimies";
import {
  CreateAccountSubTypeSchema,
  ListAccountSubTypesSchema,
} from "../../../src/schemas/account-subtype.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ data: AccountSubType[] } | ZodError>
) => {
  const { query } = req;

  const parsedResult = ListAccountSubTypesSchema.safeParse(query);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { accountType } = parsedResult.data;

  if (Array.isArray(accountType)) {
    const accountSubTypes = await client.accountSubType.findMany({
      where: { type: { in: accountType } },
    });
    return res.status(200).json({ data: accountSubTypes });
  } else if (accountType) {
    const accountSubTypes = await client.accountSubType.findMany({
      where: { type: accountType as AccountType },
    });
    return res.status(200).json({ data: accountSubTypes });
  } else {
    const accountSubTypes = await client.accountSubType.findMany();
    return res.status(200).json({ data: accountSubTypes });
  }
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<AccountSubType | ZodError>
) => {
  const { body } = req;

  const parsedResult = CreateAccountSubTypeSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const accountSubType = await client.accountSubType.create({
    data: parsedResult.data,
  });

  return res.status(201).json(accountSubType);
};

export default methodHandlerDispatcher({
  GET: getHandler,
  POST: postHandler,
});

import { Account, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ClosureTableRepository } from "../../../prisma/closure-table.repository";
import { client } from "../../../prisma/db-client";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";



const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ data: any }>
) => {

  const clousreTableRepo = new ClosureTableRepository(client, 'AccountClosure', 'parentAccountId', 'childAccountId', 'depth')

  const result = await clousreTableRepo.constructTree()

  return res.status(200).json({ data: result })
}

export default methodHandlerDispatcher({
  GET: getHandler
})
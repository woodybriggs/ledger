// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { Account, PrismaClient } from '@prisma/client'
import { methodHandlerDispatcher } from '../../../src/utils/api-method-dispatcher'
import { UpdateAccountSchema } from '../../../src/schemas/account.schema'
import { ZodError } from 'zod'
import { client } from '../../../prisma/db-client'


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Account | void>
) => {
  const { accountId } = req.query as { accountId: string }
  const account = await client.account.findFirst({where: { accountId }})
  if (!account) return res.status(404).send()
  return res.status(200).json(account)
}

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Account | ZodError | void>
) => {
  const { accountId } = req.query as { accountId: string }
  const { body } = req;
  const parsedResult = UpdateAccountSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const found = await client.account.findFirst({where: { accountId }});
  if (!found) return res.status(404).send()

  const updated = await client.account.update({where: { accountId }, data: parsedResult.data})
  return res.status(200).json(updated)
}

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<void>
) => {
  const { accountId } = req.query as { accountId: string }
  
  try {
    await client.account.delete({where: {accountId}})
  } catch (e) {
    return res.status(500).send()
  }
  return res.status(204).send()
}



export default methodHandlerDispatcher({
  GET: getHandler,
  PATCH: patchHandler,
  DELETE: deleteHandler
})
import { Account, Address, PrismaClient, Supplier } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { LedgerId } from "../../../src/schemas/ledger.schema";
import { CreateSupplierSchema } from "../../../src/schemas/supplier.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";

const client = new PrismaClient()

export type SupplierDto= Supplier & { 
  billingAddress: Address | null;
  shippingAddress: Address | null;
  defaultNominalAccount: Account;
}

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{data: SupplierDto[]}>
) => {
  const suppliers = await client.supplier.findMany({
    include: {
      billingAddress: true,
      shippingAddress: true,
      defaultNominalAccount: true
    }
  })

  return res.status(200).json({data: suppliers})
}

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Supplier | ZodError>
) => {
  const { body } = req
  const parsedResult = CreateSupplierSchema.safeParse(body)
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const { data } = parsedResult;

  const supplier = await client.supplier.create({
    data: {
      ...data,
      ledgerId: LedgerId.Supplier as string
    }
  })

  return res.status(201).json(supplier)
}

export default methodHandlerDispatcher({
  GET: getHandler,
  POST: postHandler
})
import { Account, Address, PrismaClient, Customer } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { CreateCustomerSchema, CustomerDto } from "@src/schemas/customer.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import { client } from "@localprisma/db-client";
import { LedgerId } from "@src/constants/ledgers";


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{data: CustomerDto[]}>
) => {
  const customers = await client.customer.findMany({
    include: {
      billingAddress: true,
      shippingAddress: true,
      defaultNominalAccount: true
    }
  })

  return res.status(200).json({data: customers})
}

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomerDto | ZodError>
) => {
  const { body } = req
  const parsedResult = CreateCustomerSchema.safeParse(body)
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const { data } = parsedResult;

  const customer = await client.customer.create({
    data: {
      ...data,
      ledgerId: LedgerId.Customer as string
    },
    include: {
      billingAddress: true,
      shippingAddress: true,
      defaultNominalAccount: true
    }
  })

  return res.status(201).json(customer)
}

export default methodHandlerDispatcher({
  GET: getHandler,
  POST: postHandler
})
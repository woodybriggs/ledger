import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { CustomerDto } from ".";
import { client } from "../../../prisma/db-client";
import { UpdateCustomerSchema } from "../../../src/schemas/customer.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomerDto | Error>
) => {
  const { customerId } = req.query as { customerId: string }

  const customer = await client.customer.findFirst({
    where: { customerId },
    include: {
      billingAddress: true,
      shippingAddress: true,
      defaultNominalAccount: true
    }
  })

  if (!customer) return res.status(404).send(new Error(`Customer not found`))

  return res.status(200).json(customer)
}

const updateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CustomerDto | ZodError |Error>
) => {
  const { body } = req;
  const { customerId } = req.query as { customerId: string }
  const parsedResult = UpdateCustomerSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const updatedCustomer = await client.customer.update({
    where: {
      customerId
    },
    include: {
      defaultNominalAccount: true,
      shippingAddress: true,
      billingAddress: true
    },
    data: parsedResult.data
  })

  return res.status(200).json(updatedCustomer)
}

export default methodHandlerDispatcher({
  GET: getHandler,
  PATCH: updateHandler
})
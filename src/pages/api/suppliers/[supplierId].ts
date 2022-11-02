import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import { SupplierDto, UpdateSupplierSchema } from "@src/schemas/supplier.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SupplierDto | Error>
) => {
  const { supplierId } = req.query as { supplierId: string }

  const supplier = await client.supplier.findFirst({
    where: { supplierId },
    include: {
      billingAddress: true,
      shippingAddress: true,
      defaultNominalAccount: true
    }
  })

  if (!supplier) return res.status(404).send(new Error(`Supplier not found`))

  return res.status(200).json(supplier)
}

const updateHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SupplierDto | ZodError |Error>
) => {
  const { body } = req;
  const { supplierId } = req.query as { supplierId: string }
  const parsedResult = UpdateSupplierSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const updatedSupplier = await client.supplier.update({
    where: {
      supplierId
    },
    include: {
      defaultNominalAccount: true,
      shippingAddress: true,
      billingAddress: true
    },
    data: parsedResult.data
  })

  return res.status(200).json(updatedSupplier)
}

export default methodHandlerDispatcher({
  GET: getHandler,
  PATCH: updateHandler
})
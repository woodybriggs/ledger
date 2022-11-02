import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import { AddressDto, UpdateAddressSchema } from "@src/schemas/address.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";

const patchHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<AddressDto | Error | ZodError>
) => {
  const { body, query } = req;
  const { addressId } = query as { addressId: string }

  const parsedResult = UpdateAddressSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error)

  const updatedAddress = await client.address.update({
    where: {
      addressId
    },
    data: parsedResult.data
  })

  return res.status(200).json(updatedAddress)
}

export default methodHandlerDispatcher({
  PATCH: patchHandler
})
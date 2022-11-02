import { Address, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { client } from "@localprisma/db-client";
import {
  AddressDto,
  AddressType,
  CreateAddressSchema,
} from "@src/schemas/address.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";


const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<AddressDto | ZodError | Error>
) => {
  const { body } = req;

  const parsedResult = CreateAddressSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { data } = parsedResult;

  const { supplierId, customerId, addressType, ...rest } = data;

  if (supplierId) {
    const foundSupplier = await client.supplier.findFirst({
      where: { supplierId },
    });
    if (!foundSupplier)
      return res
        .status(400)
        .json(new Error(`Supplier: ${supplierId} does not exist`));

    const address = await client.address.create({
      data: rest,
    });

    if (addressType === AddressType.Billing) {
      await client.supplier.update({
        where: { supplierId },
        data: {
          billingAddress: {
            connect: {
              addressId: address.addressId,
            },
          },
        },
      });
    }

    if (addressType === AddressType.Shipping) {
      await client.supplier.update({
        where: { supplierId },
        data: {
          shippingAddress: {
            connect: {
              addressId: address.addressId,
            },
          },
        },
      });
    }
    return res.status(201).json(address);
  } else if (customerId) {
    const foundCustomer = await client.customer.findFirst({
      where: { customerId },
    });
    if (!foundCustomer)
      return res
        .status(400)
        .json(new Error(`Customer: ${customerId} does not exist`));

    const address = await client.address.create({ data: rest });

    if (addressType === AddressType.Billing) {
      await client.customer.update({
        where: { customerId },
        data: {
          billingAddress: {
            connect: {
              addressId: address.addressId,
            },
          },
        },
      });
    }

    if (addressType === AddressType.Shipping) {
      await client.customer.update({
        where: { customerId },
        data: {
          shippingAddress: {
            connect: {
              addressId: address.addressId,
            },
          },
        },
      });
    }

    return res.status(201).json(address);
  }
};

export default methodHandlerDispatcher({
  POST: postHandler,
});

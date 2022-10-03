import { Address } from '@prisma/client';
import { toZod } from 'tozod';
import { z } from 'zod';
import { AddressDto } from '../../pages/api/addresses';



export enum AddressType {
  Billing = 'BILLING',
  Shipping = 'SHIPPING'
}

export const AddressSchema: toZod<AddressDto> = z.object({
  addressId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  //,
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  addressLine3: z.string().nullable(),
  addressLine4: z.string().nullable(),
  city: z.string().nullable(),
  provinceStateCounty: z.string().nullable(),
  zipPostalCode: z.string().nullable(),
  country: z.string(),
  supplierId: z.string().nullable(),
  customerId: z.string().nullable()
})

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>
export const CreateAddressSchema = AddressSchema.omit({
  addressId: true,
  createdAt: true,
  updatedAt: true
}).extend({
  addressType: z.nativeEnum(AddressType),
  supplierId: z.string().optional(),
  customerId: z.string().optional()
})

export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>
export const UpdateAddressSchema = CreateAddressSchema.partial({
  addressLine1: true,
  addressLine2: true,
  addressLine3: true,
  addressLine4: true,
  city: true,
  provinceStateCounty: true,
  zipPostalCode: true,
  country: true
}).extend({
  addressType: z.nativeEnum(AddressType)
})
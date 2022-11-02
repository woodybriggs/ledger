import { z } from 'zod';
import { DateSchema } from './date.schema';
import { CustomerDto, CustomerSchema } from './customer.schema';
import { SupplierSchema } from './supplier.schema';

export enum AddressType {
  Billing = 'BILLING',
  Shipping = 'SHIPPING'
}

export interface IAddress {
  addressId: string
  createdAt: string | Date
  updatedAt: string | Date
  
  addressLine1: string
  addressLine2: string | null
  addressLine3: string | null
  addressLine4: string | null
  city: string | null
  provinceStateCounty: string | null
  zipPostalCode: string | null
  country: string
}

export const BaseAddressSchema = z.object({
  addressId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,

  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  addressLine3: z.string().nullable(),
  addressLine4: z.string().nullable(),
  city: z.string().nullable(),
  provinceStateCounty: z.string().nullable(),
  zipPostalCode: z.string().nullable(),
  country: z.string()
})

export type AddressDto = z.infer<typeof AddressSchema>
export const AddressSchema: z.ZodType<IAddress> = z.lazy(() => BaseAddressSchema)

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>
export const CreateAddressSchema = BaseAddressSchema.omit({
  addressId: true,
  createdAt: true,
  updatedAt: true
}).extend({
  addressType: z.nativeEnum(AddressType),
  supplierId: z.string().optional(),
  customerId: z.string().optional()
})

export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>
export const UpdateAddressSchema = CreateAddressSchema.partial().extend({
  addressType: z.nativeEnum(AddressType)
})
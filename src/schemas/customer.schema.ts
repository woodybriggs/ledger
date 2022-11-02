import { z } from 'zod';
import { AccountDto, AccountSchema } from './account.schema';
import { AddressDto, AddressSchema } from './address.schema';
import { DateSchema } from './date.schema';
import { LedgerDto, LedgerSchema } from './ledger.schema';


export interface ICustomer {
  customerId: string,
  createdAt: Date,
  updatedAt: Date,
  denomination: string,
  name: string,

  defaultNominalAccountId: string | null,
  billingAddressId: string | null,
  shippingAddressId: string | null,
  ledgerId: string

  defaultNominalAccount?: AccountDto | null
  billingAddress?: AddressDto | null
  shippingAddress?: AddressDto | null
  ledger?: LedgerDto
}

export const BaseCustomerSchema = z.object({
  customerId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,

  denomination: z.string(),
  name: z.string(),

  defaultNominalAccountId: z.string().nullable(),
  billingAddressId: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  ledgerId: z.string()
})

export type CustomerDto = z.infer<typeof CustomerSchema>
export const CustomerSchema: z.ZodType<ICustomer> = z.lazy(() => BaseCustomerSchema.extend({
  defaultNominalAccount: AccountSchema.nullable().optional(),
  billingAddress: AddressSchema.nullable().optional(),
  shippingAddress: AddressSchema.nullable().optional(),
  ledger: LedgerSchema.optional(),
}))


export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>

export const CreateCustomerSchema = BaseCustomerSchema.omit({
  createdAt: true,
  updatedAt: true,
  supplierId: true,
  billingAddressId: true,
  shippingAddressId: true,
}).extend({
  defaultNominalAccountId: z.string().nullable()
})

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>

export const UpdateCustomerSchema = CreateCustomerSchema.partial()
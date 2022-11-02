import { z } from 'zod';
import { AccountDto, AccountSchema } from './account.schema';
import { AddressDto, AddressSchema } from './address.schema';
import { DateSchema } from './date.schema';
import { LedgerDto, LedgerSchema } from './ledger.schema';

export interface ISupplier {
  supplierId: string,
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

export const BaseSupplierSchema = z.object({
  supplierId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  denomination: z.string(),
  name: z.string(),
  defaultNominalAccountId: z.string().nullable(),
  billingAddressId: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  ledgerId: z.string()
})

export type SupplierDto = z.infer<typeof SupplierSchema>
export const SupplierSchema: z.ZodType<ISupplier> = z.lazy(() => BaseSupplierSchema.extend({
  defaultNominalAccount: AccountSchema.nullable().optional(),
  billingAddress: AddressSchema.nullable().optional(),
  shippingAddress: AddressSchema.nullable().optional(),
  ledger: LedgerSchema.optional()
}))

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>

export const CreateSupplierSchema = BaseSupplierSchema.omit({
  createdAt: true,
  updatedAt: true,
  supplierId: true,
  billingAddressId: true,
  shippingAddressId: true,
  defaultNominalAccountId: true,
}).extend({
  defaultNominalAccountId: z.string().nullable().optional(),
})

export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>

export const UpdateSupplierSchema = CreateSupplierSchema.partial()
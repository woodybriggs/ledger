import { z } from 'zod';

export const CustomerSchema = z.object({
  customerId: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  defaultNominalAccountId: z.string(),
  denomination: z.string(),
  name: z.string(),
  billingAddressId: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  ledgerId: z.string()
})

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>

export const CreateCustomerSchema = z.object({
  name: z.string(),
  denomination: z.string(),
  defaultNominalAccountId: z.string()
})

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>

export const UpdateCustomerSchema = CreateCustomerSchema.partial()
import { Supplier } from '@prisma/client';
import { toZod } from 'tozod';
import { z } from 'zod';

export const SupplierSchema = z.object({
  supplierId: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  defaultNominalAccountId: z.string(),
  denomination: z.string(),
  name: z.string(),
  billingAddressId: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  ledgerId: z.string()
})

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>

export const CreateSupplierSchema = z.object({
  name: z.string(),
  denomination: z.string(),
  defaultNominalAccountId: z.string()
})

export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>

export const UpdateSupplierSchema = CreateSupplierSchema.partial()
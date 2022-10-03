import { z } from "zod";
import { AccountSchema } from "./account.schema";
import { CustomerSchema } from "./customer.schema";
import { SupplierSchema } from "./supplier.schema";

export type CreateInstantSaleDto = z.infer<typeof CreateInstantSaleSchema>

export const CreateLineItemSchema = z.object({
  description: z.string(),
  netAmount: z.number(),
  vatAmount: z.number(),
  nominalAccount: AccountSchema
})

export const CreateInstantSaleSchema = z.object({
  exchangeRate: z.number(),
  lineItems: z.array(CreateLineItemSchema).min(1),
  paymentDate: z.union([z.date(), z.string()]),
  customer: CustomerSchema,
  totalNominalAmount: z.number().optional(),
  receiptAccount: AccountSchema
})
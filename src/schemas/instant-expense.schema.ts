import { z } from "zod";
import { AccountSchema } from "./account.schema";
import { SupplierSchema } from "./supplier.schema";

export type CreateInstantExpenseDto = z.infer<typeof CreateInstantExpenseSchema>

export const CreateLineItemSchema = z.object({
  description: z.string(),
  netAmount: z.number(),
  vatAmount: z.number(),
  nominalAccount: AccountSchema
})

export const CreateInstantExpenseSchema = z.object({
  exchangeRate: z.number(),
  lineItems: z.array(CreateLineItemSchema).min(1),
  paymentDate: z.union([z.date(), z.string()]),
  supplier: SupplierSchema,
  totalNominalAmount: z.number().optional(),
  paymentAccount: AccountSchema
})
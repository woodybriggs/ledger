import { Prisma } from "@prisma/client";;
import { z } from 'zod';
import { AccountDto } from './account.schema';
import { DateSchema } from './date.schema';
import { MoneySchema } from './money.schema';
import { PurchaseRecordDto } from './purchase-record.schema';
import { SaleRecordDto } from './sale-record.schema';

export interface ILineItem {
  lineItemId: string
  createdAt: string | Date
  updatedAt: string | Date

  description: string
  netAmount: Prisma.Decimal | string | number
  vatAmount: Prisma.Decimal | string | number

  nominalAccountId: string
  purchaseRecordId: string | null
  saleRecordId: string | null

  nominalAccount?: AccountDto
  purchaseRecord?: PurchaseRecordDto
  saleRecord?: SaleRecordDto
}

export const BaseLineItemSchema = z.object({
  lineItemId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  description: z.string(),
  netAmount: MoneySchema,
  vatAmount: MoneySchema,
  nominalAccountId: z.string()
})

export type LineItemDto = z.infer<typeof LineItemSchema>
export const LineItemSchema: z.ZodType<ILineItem> = z.late.object(() => ({
  createdAt: DateSchema,
  updatedAt: DateSchema,
  lineItemId: z.string(),

  description: z.string(),
  netAmount: MoneySchema,
  vatAmount: MoneySchema,

  nominalAccountId: z.string(),

  purchaseRecordId: z.string().nullable(),
  saleRecordId: z.string().nullable()
}))

export type CreateLineItemDto = z.infer<typeof CreateLineItemSchema>
export const CreateLineItemSchema = BaseLineItemSchema.omit({
  createdAt: true,
  updatedAt: true,
  lineItemId: true,
  grossAmount: true,
  purchaseRecordId: true,
  saleRecordId: true
})
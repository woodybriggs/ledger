import { z } from 'zod';
import { AccountSchema } from './account.schema';
import { CustomerDto, CustomerSchema } from './customer.schema';
import { DateSchema } from './date.schema';
import { CreateLineItemSchema, LineItemDto, LineItemSchema } from './line-item.schema';
import { MoneySchema } from './money.schema';
import { Prisma } from "@prisma/client";
import { JournalEntryDto, JournalEntrySchema } from './journal-entry.schema';
import { PurchaseRecordStatus } from '@src/constants/purchase-invoice-status';
;


export enum SaleRecordType {
  InstantSale = "Instant Sale",
  SalesInvoice = "Sales Invoice",
  SalesInvoicePayment = "Sales Invoice Payment"
}

export interface ISaleRecord {
  createdAt: string | Date
  updatedAt: string | Date
  saleRecordId: string
  
  status: string | PurchaseRecordStatus
  reference: string | null
  attachmentLink: string | null
  transactionType: string | SaleRecordType
  transactionDate: string | Date
  denomination: string
  exchangeRate: Prisma.Decimal | string | number;
  totalDue?: Prisma.Decimal | string | number
  grossAmount: Prisma.Decimal | string | number

  customerId: string | null

  customer?: CustomerDto | null
  lineItems?: LineItemDto[]
  payments?: ISaleRecord[]
  journalEntry?: JournalEntryDto | null
}


export type BaseSaleRecordDto = z.infer<typeof BaseSaleRecordSchema>
export const BaseSaleRecordSchema = z.object({
  createdAt: DateSchema,
  updatedAt: DateSchema,
  saleRecordId: z.string(),
  status: z.nativeEnum(PurchaseRecordStatus),
  reference: z.string().nullable(),
  attachmentLink: z.string().nullable(),
  transactionType: z.nativeEnum(SaleRecordType),
  transactionDate: DateSchema,
  denomination: z.string(),
  exchangeRate: MoneySchema,
  customerId: z.string().nullable(),
})

export const SaleRecordTypeSchema = BaseSaleRecordSchema.pick({
  transactionType: true
}).passthrough()

export type SaleRecordDto = z.infer<typeof SaleRecordSchema>
export const SaleRecordSchema: z.ZodType<ISaleRecord> = z.lazy(() => BaseSaleRecordSchema.extend({
  grossAmount: MoneySchema,
  totalDue: MoneySchema,
  lineItems: z.array(LineItemSchema),
  customer: CustomerSchema.nullable().optional(),
  journalEntry: JournalEntrySchema.nullable().optional(),
}))

export type CreateSaleRecordDto = z.infer<typeof CreateSaleRecordSchema>
export const CreateSaleRecordSchema = BaseSaleRecordSchema.omit({
  createdAt: true,
  updatedAt: true,
  saleRecordId: true,
  customerId: true,
  status: true
}).extend({
  customer: CustomerSchema,
}).passthrough()

export type CreateInstantSaleDto = z.infer<typeof CreateInstantSaleSchema>
export const CreateInstantSaleSchema = CreateSaleRecordSchema.extend({
  receiptAccount: AccountSchema,
  lineItems: z.array(CreateLineItemSchema)
})

export type CreateSaleInvoiceDto = z.infer<typeof CreateSaleInvoiceSchema>
export const CreateSaleInvoiceSchema = CreateSaleRecordSchema.extend({
  dueDate: DateSchema,
  lineItems: z.array(CreateLineItemSchema)
});

export type CreateSaleInvoicePaymentDto = z.infer<typeof CreateSaleInvoicePaymentSchema>
export const CreateSaleInvoicePaymentSchema = CreateSaleRecordSchema.extend({
  receiptAmount: MoneySchema,
  receiptAccount: AccountSchema,
  salesInvoiceId: z.string()
});
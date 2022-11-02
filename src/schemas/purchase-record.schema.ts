import { z } from 'zod';
import { TransactionType } from '@src/constants/transaction-types';
import { AccountSchema } from './account.schema';
import { DateSchema } from './date.schema';
import { CreateLineItemSchema, LineItemDto, LineItemSchema } from './line-item.schema';
import { MoneySchema } from './money.schema';
import { SupplierDto, SupplierSchema } from './supplier.schema';
import { Prisma } from "@prisma/client";;
import { JournalEntryDto, JournalEntrySchema } from './journal-entry.schema';
import { PurchaseRecordStatus } from '@src/constants/purchase-invoice-status';

export enum PurchaseRecordType {
  InstantExpense = "Instant Expense",
  PurchaseInvoice = "Purchase Invoice",
  PurchaseInvoicePayment = "Purchase Invoice Payment"
}

export interface IPurchaseRecord {
  createdAt: string | Date
  updatedAt: string | Date
  purchaseRecordId: string
  
  status: string | PurchaseRecordStatus
  reference: string | null
  attachmentLink: string | null
  transactionType: string | PurchaseRecordType
  transactionDate: string | Date
  denomination: string
  exchangeRate: Prisma.Decimal | string | number
  totalDue?: Prisma.Decimal | string | number
  grossAmount: Prisma.Decimal | string | number

  supplierId: string | null
  supplier?: SupplierDto | null

  lineItems?: LineItemDto[]
  payments?: IPurchaseRecord[]
  journalEntry?: JournalEntryDto | null
}

export type BasePurchaseRecordDto = z.infer<typeof BasePurchaseRecordSchema>
export const BasePurchaseRecordSchema = z.object({
  createdAt: DateSchema,
  updatedAt: DateSchema,
  purchaseRecordId: z.string(),
  status: z.nativeEnum(PurchaseRecordStatus),
  reference: z.string().nullable(),
  attachmentLink: z.string().nullable(),
  transactionType: z.nativeEnum(PurchaseRecordType),
  transactionDate: DateSchema,
  denomination: z.string(),
  exchangeRate: MoneySchema,
  grossAmount: MoneySchema,
  supplierId: z.string().nullable(),
  totalDue: MoneySchema,
})


export type PurchaseRecordDto = z.infer<typeof PurchaseRecordSchema>
export const PurchaseRecordSchema: z.ZodType<IPurchaseRecord> = z.lazy(() => BasePurchaseRecordSchema.extend({
  lineItems: z.array(LineItemSchema),
  supplier: SupplierSchema.nullable().optional(),
  journalEntry: JournalEntrySchema.nullable().optional(),
}))

export const PurchaseRecordTypeSchema = BasePurchaseRecordSchema.pick({
  transactionType: true
}).passthrough()

export type CreatePurchaseRecordDto = z.infer<typeof CreatePurchaseRecordSchema>
export const CreatePurchaseRecordSchema = BasePurchaseRecordSchema.omit({
  createdAt: true,
  updatedAt: true,
  purchaseRecordId: true,
  supplierId: true,
  status: true,
  grossAmount: true,
  totalDue: true,
}).extend({
  supplier: SupplierSchema,
}).passthrough()

export type CreateInstantExpenseDto = z.infer<typeof CreateInstantExpenseSchema>
export const CreateInstantExpenseSchema = CreatePurchaseRecordSchema.extend({
  paymentAccount: AccountSchema,
  lineItems: z.array(CreateLineItemSchema)
})

export type CreatePurchaseInvoiceDto = z.infer<typeof CreatePurchaseInvoiceSchema>
export const CreatePurchaseInvoiceSchema = CreatePurchaseRecordSchema.extend({
  dueDate: DateSchema,
  lineItems: z.array(CreateLineItemSchema)
});

export type CreatePurchaseInvoicePaymentDto = z.infer<typeof CreatePurchaseInvoicePaymentSchema>
export const CreatePurchaseInvoicePaymentSchema = CreatePurchaseRecordSchema.extend({
  paymentAmount: MoneySchema,
  paymentAccount: AccountSchema,
  purchaseInvoiceId: z.string()
});
import { Prisma } from "@prisma/client";;
import { z } from "zod";
import { DateSchema } from "./date.schema";
import { MoneySchema } from "./money.schema";
import { BaseTransactionSchema, CreateTransactionSchema, TransactionDto } from './transaction.schema';

export interface IJournalEntry {
  createdAt: string | Date
  updatedAt: string | Date
  journalEntryId: string
  exchangeRate: Prisma.Decimal | string | number | null
  bankReconciledDate: string | Date | null,
  vatReportedDate: string | Date | null,
  purchaseRecordId: string | null,
  saleRecordId: string | null,

  transactions?: TransactionDto[]
}

export type BaseJournalEntryDto = z.infer<typeof BaseJournalEntrySchema>
export const BaseJournalEntrySchema = z.object({
  createdAt: DateSchema,
  updatedAt: DateSchema,
  journalEntryId: z.string(),
  exchangeRate: MoneySchema.nullable(),
  bankReconciledDate: DateSchema.nullable(),
  vatReportedDate: DateSchema.nullable(),
  purchaseRecordId: z.string().nullable(),
  saleRecordId: z.string().nullable()
})

export type JournalEntryDto = z.infer<typeof JournalEntrySchema>
export const JournalEntrySchema: z.ZodType<IJournalEntry> = z.lazy(() => BaseJournalEntrySchema.extend({
  transactions: z.array(BaseTransactionSchema)
}));

export type CreateJournalEntryDto = z.infer<typeof CreateJournalEntrySchema>
export const CreateJournalEntrySchema = BaseJournalEntrySchema.omit({
  createdAt: true,
  updatedAt: true,
  journalEntryId: true
}).extend({
  transactions: z.lazy(() => z.array(CreateTransactionSchema)) 
})

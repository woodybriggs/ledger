import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AccountDto, AccountSchema } from "./account.schema";
import { CustomerDto, CustomerSchema } from "./customer.schema";
import { DateSchema } from "./date.schema";
import { JournalEntryDto, JournalEntrySchema } from "./journal-entry.schema";
import { LedgerDto, LedgerSchema } from "./ledger.schema";
import { MoneySchema } from "./money.schema";
import { SupplierDto, SupplierSchema } from "./supplier.schema";

export interface ITransaction {
  transactionId: string,
  createdAt: string | Date,
  updatedAt: string | Date,

  transactionDate: string | Date,
  debitAmount: Prisma.Decimal | string | number,
  creditAmount: Prisma.Decimal | string | number,

  accountId: string | null,
  customerId: string | null,
  supplierId: string | null,
  journalEntryId: string,
  ledgerId: string
  
  account?: AccountDto | null,
  customer?: CustomerDto | null,
  supplier?: SupplierDto | null,
  journalEntry?: JournalEntryDto,
  ledger?: LedgerDto
}

export const BaseTransactionSchema = z.object({
  transactionId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,

  transactionDate: DateSchema,
  debitAmount: MoneySchema,
  creditAmount: MoneySchema,

  accountId: z.string().nullable(),
  customerId: z.string().nullable(),
  supplierId: z.string().nullable(),
  journalEntryId: z.string(),
  ledgerId: z.string()
})

export type ListTransactionsQueryDto = z.infer<typeof ListTransactionsQuerySchema>
export const ListTransactionsQuerySchema = z.object({
  accountId: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  ledgerId: z.string().optional()
})

export type TransactionDto = z.infer<typeof TransactionSchema>
export const TransactionSchema: z.ZodType<ITransaction> = z.lazy(() => z.object({
  transactionId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,

  transactionDate: DateSchema,

  debitAmount: MoneySchema,
  creditAmount: MoneySchema,

  accountId: z.string().nullable(),
  customerId: z.string().nullable(),
  supplierId: z.string().nullable(),
  journalEntryId: z.string(),
  ledgerId: z.string(),
  
  account: AccountSchema.nullable().optional(),
  customer: CustomerSchema.nullable().optional(),
  supplier: SupplierSchema.nullable().optional(),
  journalEntry: JournalEntrySchema.optional(),
  ledger: LedgerSchema.optional()
}))

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>
export const CreateTransactionSchema = z.lazy(() => BaseTransactionSchema.omit({
  transactionId: true,
  createdAt: true,
  updatedAt: true,
  journalEntryId: true
})) 
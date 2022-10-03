import { Transaction } from "@prisma/client";
import { toZod } from "tozod";
import { z } from "zod";
import { AccountSchema } from "./account.schema";
import { LedgerSchema } from "./ledger.schema";

export type ListTransactionsQueryDto = z.infer<typeof ListTransactionsQuerySchema>

export const ListTransactionsQuerySchema = z.object({
  accountId: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  ledgerId: z.string().optional()
})

export const TransactionSchema = z.object({
  transactionId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  transactionType: z.string(),
  transactionDate: z.date(),

  description: z.string(),

  debitAmount: z.number(),
  creditAmount: z.number(),

  denomination: z.string(),

  accountId: z.string().nullable(),
  customerId: z.string().nullable(),
  supplierId: z.string().nullable(),

  journalEntryId: z.string(),
  ledgerId: z.string()
})

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>

export const CreateTransactionSchema = TransactionSchema.omit({
  transactionId: true,
  createdAt: true,
  updatedAt: true,
  journalEntryId: true
})
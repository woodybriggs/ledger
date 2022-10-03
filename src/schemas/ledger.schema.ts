import { Ledger } from '@prisma/client';
import { toZod } from 'tozod';
import { z } from 'zod';

export enum LedgerType {
  Nominal = 'NOMINAL',
  Supplier = 'SUPPLIER',
  Customer = 'CUSTOMER'
}

export enum LedgerId {
  Nominal = 'nominal',
  Supplier = 'supplier',
  Customer = 'customer'
}

export const LedgerSchema: toZod<Ledger> = z.object({
  ledgerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  ledgerType: z.string()
})

export type CreateLedgerDto = z.infer<typeof CreateLedgerSchema>

export const CreateLedgerSchema = z.object({
  ledgerId: z.string().optional(),
  name: z.string(),
  ledgerType: z.union([z.nativeEnum(LedgerType), z.string()])
})
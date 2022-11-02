import { z } from 'zod';
import { LedgerType } from '@src/constants/ledgers';
import { DateSchema } from './date.schema';

export type LedgerDto = z.infer<typeof LedgerSchema>
export const LedgerSchema = z.object({
  ledgerId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  name: z.string(),
  ledgerType: z.string()
})

export type CreateLedgerDto = z.infer<typeof CreateLedgerSchema>

export const CreateLedgerSchema = z.object({
  ledgerId: z.string().optional(),
  name: z.string(),
  ledgerType: z.union([z.nativeEnum(LedgerType), z.string()])
})
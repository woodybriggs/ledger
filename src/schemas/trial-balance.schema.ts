import { z } from 'zod'
import { BaseAccountSchema } from './account.schema';
import { DateSchema } from './date.schema'
import { MoneySchema } from './money.schema'

export type TrialBalanceQueryDto = z.infer<typeof TrialBalanceQuerySchema>
export const TrialBalanceQuerySchema = z.object({
  fromDate: DateSchema,
  toDate: DateSchema
})


export type TrialBalanceLineDto = z.infer<typeof TrialBalanceLineSchema>
export const TrialBalanceLineSchema = BaseAccountSchema.extend({
  accountSubTypeName: z.string().nullable(),
  totalDebit: MoneySchema,
  totalCredit: MoneySchema
})

export type TrialBalanceDto = z.infer<typeof TrialBalanceSchema>
export const TrialBalanceSchema = z.object({
  data: z.array(TrialBalanceLineSchema)
})
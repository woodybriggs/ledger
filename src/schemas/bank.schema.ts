import { z } from 'zod';
import { AccountDto, AccountSchema } from './account.schema';
import { DateSchema } from './date.schema';

export interface IBank {
  createdAt: Date | string
  updatedAt: Date | string
  bankId: string

  name: string
  denomination: string

  nominalAssetAccountId: string | null
  nominalAssetAccount?: AccountDto | null
}

export type BaseBankDto = z.infer<typeof BaseBankSchema>
export const BaseBankSchema = z.object({
  createdAt: DateSchema,
  updatedAt: DateSchema,
  bankId: z.string(),

  name: z.string(),
  denomination: z.string(),

  nominalAssetAccountId: z.string().nullable()
})

export type BankDto = z.infer<typeof BankSchema>
export const BankSchema: z.ZodType<IBank> = z.lazy(() => BaseBankSchema.extend({
  nominalAssetAccount: AccountSchema.nullable().optional()
}))

export type CreateBankDto = z.infer<typeof CreateBankSchema>
export const CreateBankSchema = BaseBankSchema.omit({
  createdAt: true,
  updatedAt: true,
  bankId: true,
  nominalAssetAccountId: true
}).extend({
  nominalAssetAccountId: z.string()
})

export type UpdateBankDto = z.infer<typeof UpdateBankSchema>
export const UpdateBankSchema = CreateBankSchema.partial()
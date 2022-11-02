import { z } from "zod";
import { AccountType } from "@src/constants/account-taxonimies";
import { AccountSubTypeDto, AccountSubTypeSchema } from "./account-subtype.schema";
import { DateSchema } from "./date.schema";

export enum PresetAccountId {
  Root = "root",
  AccountsPayable = "accounts-payable",
  AccountsReceivable = "accounts-receivable",
  ExchangeGainLoss = "exchange-gain-loss"
  //AccumulatedReserves = "accumulated-reserves"
}

export interface IAccount {
  accountId: string,
  createdAt: string | Date,
  updatedAt: string | Date,

  name: string
  number: number
  denomination: string | null,

  category: string
  type: string

  accountSubTypeId: string | null
  accountSubType?: AccountSubTypeDto | null
}

export type BaseAccountSchema = z.infer<typeof BaseAccountSchema>
export const BaseAccountSchema = z.object({
  accountId: z.string(),
  createdAt: DateSchema,
  updatedAt: DateSchema,

  name: z.string(),
  number: z.number(),
  denomination: z.string().nullable(),
  category: z.string(),
  type: z.string(),

  accountSubTypeId: z.string().nullable()
})

export type AccountDto = z.infer<typeof AccountSchema>
export const AccountSchema: z.ZodType<IAccount & { 
  parentAccountId?: string | null,
  parentAccount?: BaseAccountSchema | null
}> = z.lazy(() => BaseAccountSchema.extend({
  accountSubType: AccountSubTypeSchema.nullable().optional(),
  parentAccountId: z.string().nullable().optional(),
  parentAccount: BaseAccountSchema.nullable().optional()
}))


export type ListAccountsQueryDto = z.infer<typeof ListAccountsQuerySchema>

export const ListAccountsQuerySchema = z.object({
  setting: z.enum(['include', 'exclude']).optional().default('include'),
  types: z.union([z.enum(['all', ...Object.values(AccountType)]), z.array(z.nativeEnum(AccountType))]).optional().default('all')
})


export type CreateAccountDto = z.infer<typeof CreateAccountSchema>
export const CreateAccountSchema = BaseAccountSchema.omit({
  accountId: true, 
  createdAt: true, 
  updatedAt: true, 
  accountSubTypeId: true
}).extend({
  parentAccountId: z.string().nullable().optional(),
  accountSubTypeId: z.string().nullable().optional()
})


export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>
export const UpdateAccountSchema = CreateAccountSchema.omit({
  parentAccountId: true
})




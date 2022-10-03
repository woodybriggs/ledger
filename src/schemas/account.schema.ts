import { Account } from "@prisma/client";
import { toZod } from "tozod";
import { z } from "zod";
import { AccountCategory, AccountType } from "../constants/account-taxonimies";

export enum PresetAccountId {
  Root = "root",
  AccountsPayable = "accounts-payable",
  AccountsReceivable = "accounts-receivable",
  //AccumulatedReserves = "accumulated-reserves"
}


export type ListAccountsQueryDto = z.infer<typeof ListAccountsQuerySchema>

export const ListAccountsQuerySchema = z.object({
  setting: z.enum(['include', 'exclude']).optional().default('include'),
  types: z.union([z.enum(['all', ...Object.values(AccountType)]), z.array(z.nativeEnum(AccountType))]).optional().default('all')
})


export const AccountSchema = z.object({
  accountId: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),

  name: z.string(),
  number: z.number(),
  denomination: z.string().nullable(),

  category: z.string(),
  type: z.string(),
  accountSubTypeId: z.string().nullable()
})


export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>


export const UpdateAccountSchema = AccountSchema.omit({accountId: true, createdAt: true, updatedAt: true}).partial()

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>

export const CreateAccountSchema = AccountSchema.omit({accountId: true, createdAt: true, updatedAt: true, accountSubTypeId: true}).extend({
  parentAccountId: z.string().nullable().optional(),
  accountSubTypeId: z.string().nullable().optional()
})



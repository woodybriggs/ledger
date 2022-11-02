import { z } from 'zod';
import { toZod } from 'tozod'
import { AccountSubType } from '@prisma/client';
import { AccountCategory, AccountType } from '@src/constants/account-taxonimies';
import { DateSchema } from './date.schema';

export interface IAccountSubType {
  accountSubTypeId: string,
  category: string | AccountCategory,
  type: string | AccountType,
  name: string,
}

export type BaseAccountSubTypeDto = z.infer<typeof BaseAccountSubTypeSchema>
export const BaseAccountSubTypeSchema = z.object({
  accountSubTypeId: z.string(),
  category: z.nativeEnum(AccountCategory),
  type: z.nativeEnum(AccountType),
  name: z.string(),
})

export type ListAccountSubTypesDto = z.infer<typeof ListAccountSubTypesSchema>;
export const ListAccountSubTypesSchema = z.object({
  accountType: z.union([z.array(z.nativeEnum(AccountType)), z.nativeEnum(AccountType) ]).optional()
})

export type AccountSubTypeDto = z.infer<typeof AccountSubTypeSchema>
export const AccountSubTypeSchema: z.ZodType<IAccountSubType> = z.lazy(() => BaseAccountSubTypeSchema)

export type CreateAccountSubTypeDto = z.infer<typeof CreateAccountSubTypeSchema>
export const CreateAccountSubTypeSchema = BaseAccountSubTypeSchema.omit({
  accountSubTypeId: true
})


export type UpdateAccountSubTypeDto = z.infer<typeof CreateAccountSubTypeSchema>
export const UpdateAccountSubTypeSchema = CreateAccountSubTypeSchema.partial()
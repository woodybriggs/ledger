import { z } from 'zod';
import { toZod } from 'tozod'
import { AccountSubType } from '@prisma/client';
import { AccountType } from '../constants/account-taxonimies';

export type ListAccountSubTypesDto = z.infer<typeof ListAccountSubTypesSchema>;

export const ListAccountSubTypesSchema = z.object({
  accountType: z.union([z.array(z.nativeEnum(AccountType)), z.nativeEnum(AccountType) ]).optional()
})


export const AccountSubTypeSchema: toZod<AccountSubType> = z.object({
  accountSubTypeId: z.string(),
  category: z.string(),
  type: z.string(),
  name: z.string(),
})

export type CreateAccountSubTypeDto = z.infer<typeof CreateAccountSubTypeSchema>
export const CreateAccountSubTypeSchema = AccountSubTypeSchema.omit({accountSubTypeId: true})


export type UpdateAccountSubTypeDto = z.infer<typeof CreateAccountSubTypeSchema>
export const UpdateAccountSubTypeSchema = CreateAccountSubTypeSchema.partial()
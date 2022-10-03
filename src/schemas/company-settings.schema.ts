import { z } from 'zod';
import { AccountSchema } from './account.schema';

export type UpdateCompanySettingsDto = z.infer<typeof UpdateCompanySettingsSchema>

export const UpdateCompanySettingsSchema = z.object({
  reportingCurrency: z.string().nullable(),
  nominalVatInputAccount: AccountSchema,
  nominalVatOutputAccount: AccountSchema,
}).partial()
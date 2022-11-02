import { Prisma } from "@prisma/client";
import { z } from 'zod'

export type MoneyDto = z.infer<typeof MoneySchema>
export const MoneySchema = z.union([z.string(), z.number()])
  .transform(value => new Prisma.Decimal(value));
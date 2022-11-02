import { z } from 'zod'

export const DateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date()) as z.ZodEffects<z.ZodDate, Date, Date>
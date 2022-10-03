import { z } from "zod";
import { CreateTransactionSchema } from './transaction.schema'



export const CreateJournalEntrySchema = z.object({
  transactions: z.array(CreateTransactionSchema)
});

import { JournalEntry, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { TransactionType } from "../../../src/constants/transaction-types";
import { PresetAccountId } from "../../../src/schemas/account.schema";
import { CreateInstantExpenseSchema } from "../../../src/schemas/instant-expense.schema";
import { LedgerId } from "../../../src/schemas/ledger.schema";
import { CreateTransactionDto } from "../../../src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";
import AccountId from "../accounts/[accountId]";

const client = new PrismaClient();

const postHandler = async (req: NextApiRequest, res: NextApiResponse<JournalEntry | ZodError>) => {
  const { body } = req;

  const paresdResult = CreateInstantExpenseSchema.safeParse(body);
  if (!paresdResult.success) return res.status(400).json(paresdResult.error);

  const { exchangeRate, paymentDate, lineItems, supplier, paymentAccount } = paresdResult.data;

  const rootAccount = await client.account.findFirst({ where: { accountId: PresetAccountId.Root as string } })

  const debits: CreateTransactionDto[] = lineItems
    .map(({ 
      description,
      netAmount,
      nominalAccount,
    }) => ({ 
      description,
      debitAmount: netAmount / exchangeRate,
      creditAmount: 0,
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantExpense,
      denomination: rootAccount!.denomination || '',
      accountId: nominalAccount.accountId,
      supplierId: supplier.supplierId,
      customerId: null,
      ledgerId: LedgerId.Nominal
    }))

  const credits: CreateTransactionDto[] = lineItems
    .map(({
      description,
      netAmount
    }) => ({
      description,
      creditAmount: netAmount / exchangeRate,
      debitAmount: 0,
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantExpense,
      denomination: rootAccount!.denomination || '',
      accountId: paymentAccount.accountId,
      supplierId: supplier.supplierId,
      customerId: null,
      ledgerId: LedgerId.Nominal
    }))

  const supplierTransactions: CreateTransactionDto[] = lineItems
    .map(({
      description,
      netAmount,
      vatAmount
    }) => ({
      description,
      debitAmount: (netAmount + vatAmount),
      creditAmount: (netAmount + vatAmount),
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantExpense,
      denomination: supplier.denomination,
      accountId: null,
      supplierId: supplier.supplierId,
      customerId: null,
      ledgerId: LedgerId.Supplier
    }))

    const transactions: CreateTransactionDto[] = [debits, credits, supplierTransactions].flat();

    const journalEntry = await client.journalEntry.create({
      data: {
        exchangeRate,
        transactions: {
          create: transactions
        }
      },
      include: {
        transactions: true
      }
    })

    return res.status(201).json(journalEntry)
};

export default methodHandlerDispatcher({
  POST: postHandler,
});

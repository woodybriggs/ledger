import { JournalEntry, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { TransactionType } from "../../../src/constants/transaction-types";
import { PresetAccountId } from "../../../src/schemas/account.schema";
import { CreateInstantSaleSchema } from "../../../src/schemas/instant-sale.schema";
import { LedgerId } from "../../../src/schemas/ledger.schema";
import { CreateTransactionDto } from "../../../src/schemas/transaction.schema";
import { methodHandlerDispatcher } from "../../../src/utils/api-method-dispatcher";

const client = new PrismaClient();

const postHandler = async (req: NextApiRequest, res: NextApiResponse<JournalEntry | ZodError>) => {
  const { body } = req;

  const paresdResult = CreateInstantSaleSchema.safeParse(body);
  if (!paresdResult.success) return res.status(400).json(paresdResult.error);

  const { exchangeRate, paymentDate, lineItems, customer, receiptAccount } = paresdResult.data;

  const rootAccount = await client.account.findFirst({ where: { accountId: PresetAccountId.Root as string } })

  const debits: CreateTransactionDto[] = lineItems
    .map(({ 
      description,
      netAmount
    }) => ({ 
      description,
      debitAmount: netAmount / exchangeRate,
      creditAmount: 0,
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantExpense,
      denomination: rootAccount!.denomination || '',
      accountId: receiptAccount.accountId,
      customerId: customer.customerId,
      supplierId: null,
      ledgerId: LedgerId.Nominal
    }))

  const credits: CreateTransactionDto[] = lineItems
    .map(({
      description,
      netAmount,
      nominalAccount
    }) => ({
      description,
      creditAmount: netAmount / exchangeRate,
      debitAmount: 0,
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantExpense,
      denomination: rootAccount!.denomination || '',
      accountId: nominalAccount.accountId,
      customerId: customer.customerId,
      supplierId: null,
      ledgerId: LedgerId.Nominal
    }))

  const customerTransactions: CreateTransactionDto[] = lineItems
    .map(({
      description,
      netAmount,
      vatAmount
    }) => ({
      description,
      debitAmount: (netAmount + vatAmount),
      creditAmount: (netAmount + vatAmount),
      transactionDate: paymentDate as Date,
      transactionType: TransactionType.InstantSale,
      denomination: customer.denomination,
      accountId: null,
      customerId: customer.customerId,
      supplierId: null,
      ledgerId: LedgerId.Customer
    }))

    const transactions: CreateTransactionDto[] = [debits, credits, customerTransactions].flat();

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

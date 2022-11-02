import { describe, test } from '@jest/globals'
import { Prisma } from "@prisma/client";
import { JournalModel, NominalTransactionModel, SupplierTransactionModel } from './Journal.model'

describe('Journal Model', () => {
  test('Add Transactions', () => {

    const journal = new JournalModel()

    journal.addTransactions([
      new NominalTransactionModel('debit', new Prisma.Decimal(1), new Date(), { accountId: 'abc' }),
      new NominalTransactionModel('credit', new Prisma.Decimal(1), new Date(), { accountId: 'cba' }),
      new SupplierTransactionModel('debit', new Prisma.Decimal(1), new Date(), { supplierId: 'por' }),
    ])
  })
})
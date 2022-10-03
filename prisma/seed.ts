import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AccountCategory, AccountType, AccountTypeCategoryMap } from "../src/constants/account-taxonimies";
import { CreateAccountSubTypeSchema } from "../src/schemas/account-subtype.schema";
import { CreateAccountSchema, PresetAccountId } from "../src/schemas/account.schema";
import { CreateLedgerDto, LedgerId, LedgerType } from "../src/schemas/ledger.schema";
import { ClosureTableRepository } from "./closure-table.repository";

const client = new PrismaClient();
const clousreTableRepo = new ClosureTableRepository(client, 'AccountClosure', 'parentAccountId', 'childAccountId', 'depth')
const presetAccounts: (z.infer<typeof CreateAccountSchema> & { accountId: string })[] = [
  {
    accountId: PresetAccountId.Root,
    name: 'Root',
    denomination: '',
    number: 0,
    category: 'root',
    type: 'root',
    accountSubTypeId: null
  },
  {
    accountId: PresetAccountId.AccountsReceivable,
    name: 'Accounts Receivable',
    number: 1000,
    denomination: '',
    category: AccountTypeCategoryMap.get(AccountType.AccountsReceivable),
    type: AccountType.AccountsReceivable,
    accountSubTypeId: null
  },
  {
    accountId: PresetAccountId.AccountsPayable,
    name: 'Accounts Payable',
    number: 2000,
    denomination: '',
    category: AccountTypeCategoryMap.get(AccountType.AccountsPayable),
    type: AccountType.AccountsPayable,
    accountSubTypeId: null
  },
  // {
  //   accountId: PresetAccountId.AccumulatedReserves,
  //   name: "Accumulated Reserves",
  //   number: 5000,
  //   denomination: '',
  //   category: AccountTypeCategoryMap.get(AccountType.Equity)

  //   type: AccountType.CapitalAndReserves,
  // }
];


const presetLedgers: CreateLedgerDto[] = [
  {
    ledgerId: LedgerId.Nominal,
    ledgerType: LedgerType.Nominal,
    name: 'Nominal'
  },
  {
    ledgerId: LedgerId.Customer,
    ledgerType: LedgerType.Customer,
    name: 'Customer'
  },
  {
    ledgerId: LedgerId.Supplier,
    ledgerType: LedgerType.Supplier,
    name: 'Supplier'
  }
];


(async () => {

  await client.customer.deleteMany()
  await client.supplier.deleteMany()
  await client.address.deleteMany()
  await client.ledger.deleteMany()

  await client.transaction.deleteMany()
  await client.journalEntry.deleteMany()
  await client.accountClosure.deleteMany()
  await client.account.deleteMany()

  const [chartAccount, ...rest] = presetAccounts;

  await client.account.create({data: chartAccount})
  await clousreTableRepo.insertSelfRef(chartAccount.accountId)

  for (let account of rest) {
    await client.account.create({
      data: account
    })

    await clousreTableRepo.insertSelfRef(account.accountId)
    await clousreTableRepo.insertChild(chartAccount.accountId, account.accountId)
  }

  for (let ledger of presetLedgers) {
    await client.ledger.create({
      data: ledger
    })
  }
})()
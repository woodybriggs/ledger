import { z } from "zod";
import { CreateAccountSchema, PresetAccountId } from "@src/schemas/account.schema";
import { AccountType, AccountTypeCategoryMap } from "./account-taxonimies";

export const presetAccounts: (z.infer<typeof CreateAccountSchema> & { accountId: string })[] = [
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
  {
    accountId: PresetAccountId.ExchangeGainLoss,
    name: 'Exchange Gain/Loss',
    number: 4000,
    denomination: '',
    category: AccountTypeCategoryMap.get(AccountType.ExchangeGainOrLoss),
    type: AccountType.ExchangeGainOrLoss,
    accountSubTypeId: null
  }
];
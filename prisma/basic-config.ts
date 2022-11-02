import { z } from "zod";
import { AccountType, AccountTypeCategoryMap } from "@src/constants/account-taxonimies";
import { presetAccounts } from "@src/constants/accounts";
import { LedgerId, presetLedgers } from "@src/constants/ledgers";
import { CreateAccountDto, CreateAccountSchema } from "@src/schemas/account.schema";
import { CreateSupplierDto } from "@src/schemas/supplier.schema";
import { ClosureTableRepository } from "./closure-table.repository";
import { client } from "./db-client";

export const clousreTableRepo = new ClosureTableRepository(client, 'AccountClosure', 'parentAccountId', 'childAccountId', 'depth');

/**
 * Account Numbering
 * Assets 1xxx
 * Liabilities 2xxx
 * Income 3xxx
 * Expenses 4xxx
 */

export const basicAccounts: CreateAccountDto[] = [
  {
    name: "VAT Inputs",
    number: 1001,
    category: AccountTypeCategoryMap.get(AccountType.VatInputs),
    type: AccountType.VatInputs,
    denomination: 'GBP',
  },
  {
    name: "VAT Outputs",
    number: 1001,
    category: AccountTypeCategoryMap.get(AccountType.VatOutputs),
    type: AccountType.VatOutputs,
    denomination: 'GBP',
  },
  {
    name: "Director Loan",
    number: 2100,
    category: AccountTypeCategoryMap.get(AccountType.OtherCurrentLiabilities),
    type: AccountType.OtherCurrentLiabilities,
    denomination: 'GBP'
  },
  {
    name: "Web Hosting",
    number: 4100,
    category: AccountTypeCategoryMap.get(AccountType.IndirectCosts),
    type: AccountType.IndirectCosts,
    denomination: 'GBP'
  }
];

export const basicSuppliers: CreateSupplierDto[] = [
  {
    name: 'Cloudflare',
    denomination: 'USD',
    ledgerId: LedgerId.Supplier
  }
]
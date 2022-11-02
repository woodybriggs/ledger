export enum AccountCategory {
  CurrentAssets = "Current Assets",
  LongTermAssets = "Long-Term Assets",

  CurrentLiabilities = "Current Liabilities",
  LongTermLiabilities = "Long-Term Liabilities",

  Equity = "Equity",
  
  Income = "Income",
  OtherIncome = "Other Income",
  
  DirectCosts = "Direct Costs",
  IndirectCosts = "Indirect Costs",
  OtherCosts = "Other Costs",
}

export const AccountTypeRoot = 'root'
export enum AccountType {
  // Current Assets
  AccountsReceivable = "Accounts Receivable",
  Bank = "Bank",
  VatInputs = "Vat Inputs",
  OtherCurrentAssets = "Other Current Assets",

  // Long Term Assets
  FixedAssets = "Fixed Assets",
  OtherAssets = "Other Assets",

  // Current Liabilities
  AccountsPayable = "Accounts Payable",
  CreditCard = "Credit Card",
  VatOutputs = "Vat Outputs",
  OtherCurrentLiabilities = "Other Current Liabilities",

  // Long Term Liabilities
  LongTermLiabilities = "Long-Term Liabilities",

  // Equity
  Equity = "Equity",
  RetainedEarnings = "Retained Earnings",

  Income = "Income",
  OtherIncome = "Other Income",

  DirectCosts = "Direct Costs",
  IndirectCosts = "Indirect Costs",
  OtherCosts = "Other Costs",
  ExchangeGainOrLoss = "Exchange Gain/Loss"
}


type SafeEnumMap<K extends string, V> = { [key in K]: V } & { get: (key: AccountType) => AccountCategory, set: (key: AccountType, value: AccountCategory) => void }

export const AccountTypeCategoryMap: SafeEnumMap<AccountType, AccountCategory> = {
  [AccountType.AccountsReceivable]:       AccountCategory.CurrentAssets,
  [AccountType.Bank]:                     AccountCategory.CurrentAssets,
  [AccountType.VatInputs]:                AccountCategory.CurrentAssets,
  [AccountType.OtherCurrentAssets]:       AccountCategory.CurrentAssets,
  [AccountType.FixedAssets]:              AccountCategory.LongTermAssets,
  [AccountType.OtherAssets]:              AccountCategory.LongTermAssets,
  [AccountType.AccountsPayable]:          AccountCategory.CurrentLiabilities,
  [AccountType.CreditCard]:               AccountCategory.CurrentLiabilities,
  [AccountType.OtherCurrentLiabilities]:  AccountCategory.CurrentLiabilities,
  [AccountType.VatOutputs]:               AccountCategory.CurrentLiabilities,
  [AccountType.LongTermLiabilities]:      AccountCategory.LongTermLiabilities,
  [AccountType.Equity]:                   AccountCategory.Equity,
  [AccountType.RetainedEarnings]:         AccountCategory.Equity,
  [AccountType.Income]:                   AccountCategory.Income,
  [AccountType.DirectCosts]:              AccountCategory.DirectCosts,
  [AccountType.IndirectCosts]:            AccountCategory.IndirectCosts,
  [AccountType.OtherIncome]:              AccountCategory.OtherIncome,
  [AccountType.OtherCosts]:               AccountCategory.OtherCosts,
  [AccountType.ExchangeGainOrLoss]:       AccountCategory.OtherCosts,

  get(key) { return this[key] },
  set(key, value) { this[key] = value }
}
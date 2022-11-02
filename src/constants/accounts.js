"use strict";
exports.__esModule = true;
exports.presetAccounts = void 0;
var account_schema_1 = require("@src/schemas/account.schema");
var account_taxonimies_1 = require("./account-taxonimies");
exports.presetAccounts = [
    {
        accountId: account_schema_1.PresetAccountId.Root,
        name: 'Root',
        denomination: '',
        number: 0,
        category: 'root',
        type: 'root',
        accountSubTypeId: null
    },
    {
        accountId: account_schema_1.PresetAccountId.AccountsReceivable,
        name: 'Accounts Receivable',
        number: 1000,
        denomination: '',
        category: account_taxonimies_1.AccountTypeCategoryMap.get(account_taxonimies_1.AccountType.AccountsReceivable),
        type: account_taxonimies_1.AccountType.AccountsReceivable,
        accountSubTypeId: null
    },
    {
        accountId: account_schema_1.PresetAccountId.AccountsPayable,
        name: 'Accounts Payable',
        number: 2000,
        denomination: '',
        category: account_taxonimies_1.AccountTypeCategoryMap.get(account_taxonimies_1.AccountType.AccountsPayable),
        type: account_taxonimies_1.AccountType.AccountsPayable,
        accountSubTypeId: null
    },
    {
        accountId: account_schema_1.PresetAccountId.ExchangeGainLoss,
        name: 'Exchange Gain/Loss',
        number: 4000,
        denomination: '',
        category: account_taxonimies_1.AccountTypeCategoryMap.get(account_taxonimies_1.AccountType.ExchangeGainOrLoss),
        type: account_taxonimies_1.AccountType.ExchangeGainOrLoss,
        accountSubTypeId: null
    }
];

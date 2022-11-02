"use strict";
var _a;
exports.__esModule = true;
exports.AccountTypeCategoryMap = exports.AccountType = exports.AccountTypeRoot = exports.AccountCategory = void 0;
var AccountCategory;
(function (AccountCategory) {
    AccountCategory["CurrentAssets"] = "Current Assets";
    AccountCategory["LongTermAssets"] = "Long-Term Assets";
    AccountCategory["CurrentLiabilities"] = "Current Liabilities";
    AccountCategory["LongTermLiabilities"] = "Long-Term Liabilities";
    AccountCategory["Equity"] = "Equity";
    AccountCategory["Income"] = "Income";
    AccountCategory["OtherIncome"] = "Other Income";
    AccountCategory["DirectCosts"] = "Direct Costs";
    AccountCategory["IndirectCosts"] = "Indirect Costs";
    AccountCategory["OtherCosts"] = "Other Costs";
})(AccountCategory = exports.AccountCategory || (exports.AccountCategory = {}));
exports.AccountTypeRoot = 'root';
var AccountType;
(function (AccountType) {
    // Current Assets
    AccountType["AccountsReceivable"] = "Accounts Receivable";
    AccountType["Bank"] = "Bank";
    AccountType["VatInputs"] = "Vat Inputs";
    AccountType["OtherCurrentAssets"] = "Other Current Assets";
    // Long Term Assets
    AccountType["FixedAssets"] = "Fixed Assets";
    AccountType["OtherAssets"] = "Other Assets";
    // Current Liabilities
    AccountType["AccountsPayable"] = "Accounts Payable";
    AccountType["CreditCard"] = "Credit Card";
    AccountType["VatOutputs"] = "Vat Outputs";
    AccountType["OtherCurrentLiabilities"] = "Other Current Liabilities";
    // Long Term Liabilities
    AccountType["LongTermLiabilities"] = "Long-Term Liabilities";
    // Equity
    AccountType["Equity"] = "Equity";
    AccountType["RetainedEarnings"] = "Retained Earnings";
    AccountType["Income"] = "Income";
    AccountType["OtherIncome"] = "Other Income";
    AccountType["DirectCosts"] = "Direct Costs";
    AccountType["IndirectCosts"] = "Indirect Costs";
    AccountType["OtherCosts"] = "Other Costs";
    AccountType["ExchangeGainOrLoss"] = "Exchange Gain/Loss";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
exports.AccountTypeCategoryMap = (_a = {},
    _a[AccountType.AccountsReceivable] = AccountCategory.CurrentAssets,
    _a[AccountType.Bank] = AccountCategory.CurrentAssets,
    _a[AccountType.VatInputs] = AccountCategory.CurrentAssets,
    _a[AccountType.OtherCurrentAssets] = AccountCategory.CurrentAssets,
    _a[AccountType.FixedAssets] = AccountCategory.LongTermAssets,
    _a[AccountType.OtherAssets] = AccountCategory.LongTermAssets,
    _a[AccountType.AccountsPayable] = AccountCategory.CurrentLiabilities,
    _a[AccountType.CreditCard] = AccountCategory.CurrentLiabilities,
    _a[AccountType.OtherCurrentLiabilities] = AccountCategory.CurrentLiabilities,
    _a[AccountType.VatOutputs] = AccountCategory.CurrentLiabilities,
    _a[AccountType.LongTermLiabilities] = AccountCategory.LongTermLiabilities,
    _a[AccountType.Equity] = AccountCategory.Equity,
    _a[AccountType.RetainedEarnings] = AccountCategory.Equity,
    _a[AccountType.Income] = AccountCategory.Income,
    _a[AccountType.DirectCosts] = AccountCategory.DirectCosts,
    _a[AccountType.IndirectCosts] = AccountCategory.IndirectCosts,
    _a[AccountType.OtherIncome] = AccountCategory.OtherIncome,
    _a[AccountType.OtherCosts] = AccountCategory.OtherCosts,
    _a[AccountType.ExchangeGainOrLoss] = AccountCategory.OtherCosts,
    _a.get = function (key) { return this[key]; },
    _a.set = function (key, value) { this[key] = value; },
    _a);

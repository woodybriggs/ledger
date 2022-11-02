"use strict";
exports.__esModule = true;
exports.presetLedgers = exports.LedgerId = exports.LedgerType = void 0;
var LedgerType;
(function (LedgerType) {
    LedgerType["Nominal"] = "NOMINAL";
    LedgerType["Supplier"] = "SUPPLIER";
    LedgerType["Customer"] = "CUSTOMER";
    LedgerType["Currency"] = "CURRENCY";
})(LedgerType = exports.LedgerType || (exports.LedgerType = {}));
var LedgerId;
(function (LedgerId) {
    LedgerId["Nominal"] = "nominal";
    LedgerId["Supplier"] = "supplier";
    LedgerId["Customer"] = "customer";
    LedgerId["Currency"] = "currency";
})(LedgerId = exports.LedgerId || (exports.LedgerId = {}));
exports.presetLedgers = [
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
    },
    {
        ledgerId: LedgerId.Currency,
        ledgerType: LedgerType.Currency,
        name: 'Currency'
    }
];

import { CreateLedgerDto } from "@src/schemas/ledger.schema";

export enum LedgerType {
  Nominal = 'NOMINAL',
  Supplier = 'SUPPLIER',
  Customer = 'CUSTOMER',
  Currency = 'CURRENCY'
}

export enum LedgerId {
  Nominal = 'nominal',
  Supplier = 'supplier',
  Customer = 'customer',
  Currency = 'currency'
}

export const presetLedgers: CreateLedgerDto[] = [
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
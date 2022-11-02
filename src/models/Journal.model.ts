import { Account, Customer, Supplier, Prisma } from "@prisma/client";
import { LedgerId } from "@src/constants/ledgers";

export class TransactionModel {
  constructor(
    public amountType: "debit" | "credit",
    public amount: Prisma.Decimal = new Prisma.Decimal(0),
    public date: Date
  ) {}
}

export class NominalTransactionModel extends TransactionModel {
  constructor(
    public amountType: "debit" | "credit",
    public amount: Prisma.Decimal = new Prisma.Decimal(0),
    public date: Date,
    public account: Account | { accountId: string }
  ) {
    super(amountType, amount, date);
  }
}

export class CustomerTransactionModel extends TransactionModel {
  constructor(
    public amountType: "debit" | "credit",
    public amount: Prisma.Decimal = new Prisma.Decimal(0),
    public date: Date,
    public customer: Customer | { customerId: string }
  ) {
    super(amountType, amount, date);
  }
}

export class SupplierTransactionModel extends TransactionModel {
  constructor(
    public amountType: "debit" | "credit",
    public amount: Prisma.Decimal = new Prisma.Decimal(0),
    public date: Date,
    public supplier: Supplier | { supplierId: string }
  ) {
    super(amountType, amount, date);
  }
}

export type TransactionModelTypes =
  | NominalTransactionModel
  | CustomerTransactionModel
  | SupplierTransactionModel;

export class JournalModel {
  public ledgerTransactions = new Map([
    [LedgerId.Nominal, [] as TransactionModelTypes[]],
    [LedgerId.Supplier, [] as TransactionModelTypes[]],
    [LedgerId.Customer, [] as TransactionModelTypes[]],
  ]);

  public addTransactions(transactions: TransactionModelTypes[]) {
    const nominalTransactions = [
      ...transactions.filter((t) => t instanceof NominalTransactionModel),
      ...(this.ledgerTransactions.get(LedgerId.Nominal) || []),
    ];
    const supplierTransactions = [
      ...transactions.filter((t) => t instanceof SupplierTransactionModel),
      ...(this.ledgerTransactions.get(LedgerId.Supplier) || []),
    ];
    const customerTransactions = [
      ...transactions.filter((t) => t instanceof CustomerTransactionModel),
      ...(this.ledgerTransactions.get(LedgerId.Customer) || []),
    ];

    this.validateTransactions(LedgerId.Nominal, nominalTransactions);
    this.validateTransactions(LedgerId.Supplier, supplierTransactions);
    this.validateTransactions(LedgerId.Customer, customerTransactions);

    this.ledgerTransactions.set(LedgerId.Nominal, nominalTransactions);
    this.ledgerTransactions.set(LedgerId.Supplier, supplierTransactions);
    this.ledgerTransactions.set(LedgerId.Customer, customerTransactions);
  }

  public validateTransactions(
    ledger: LedgerId,
    transactions: TransactionModel[]
  ) {
    if (ledger === LedgerId.Customer || ledger === LedgerId.Supplier) return;

    const debits = transactions.filter((t) => t.amountType === "debit");
    const credits = transactions.filter((t) => t.amountType === "credit");

    const debitTotal = debits.reduce(
      (acc, n) => acc.add(n.amount),
      new Prisma.Decimal(0)
    );
    const creditTotal = credits.reduce(
      (acc, n) => acc.add(n.amount),
      new Prisma.Decimal(0)
    );

    if (!debitTotal.equals(creditTotal))
      throw new Error(
        `Debits and Credits do not match for transactions given for ${ledger} Ledger`
      );
  }

  public makeDBTransactions(): Prisma.TransactionCreateWithoutJournalEntryInput[] {
    const nominalTransactions: Prisma.TransactionCreateWithoutJournalEntryInput[] =
      [
        ...((this.ledgerTransactions.get(LedgerId.Nominal) ||
          []) as NominalTransactionModel[]),
      ].map((t) => ({
        transactionDate: t.date,
        debitAmount: t.amountType === "debit" ? t.amount : 0,
        creditAmount: t.amountType === "credit" ? t.amount : 0,
        ledger: { connect: { ledgerId: LedgerId.Nominal } },
        account: { connect: { accountId: t.account.accountId } },
      }));

    const supplierTransactions: Prisma.TransactionCreateWithoutJournalEntryInput[] =
      [
        ...((this.ledgerTransactions.get(LedgerId.Supplier) ||
          []) as SupplierTransactionModel[]),
      ].map((t) => ({
        transactionDate: t.date,
        debitAmount: t.amountType === "debit" ? t.amount : 0,
        creditAmount: t.amountType === "credit" ? t.amount : 0,
        ledger: { connect: { ledgerId: LedgerId.Supplier } },
        supplier: { connect: { supplierId: t.supplier.supplierId } },
      }));

    const customerTransactions: Prisma.TransactionCreateWithoutJournalEntryInput[] =
      [
        ...((this.ledgerTransactions.get(LedgerId.Customer) ||
          []) as CustomerTransactionModel[]),
      ].map((t) => ({
        transactionDate: t.date,
        debitAmount: t.amountType === "debit" ? t.amount : 0,
        creditAmount: t.amountType === "credit" ? t.amount : 0,
        ledger: { connect: { ledgerId: LedgerId.Customer } },
        customer: { connect: { customerId: t.customer.customerId } },
      }));

    return [
      ...nominalTransactions,
      ...supplierTransactions,
      ...customerTransactions,
    ];
  }
}

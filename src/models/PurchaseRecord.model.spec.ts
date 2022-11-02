import { describe, test, expect } from "@jest/globals";
import { Prisma } from "@prisma/client";;
import { LedgerId } from "@src/constants/ledgers";
import { InstantExpenseModel, LineItemModel, PurchaseInvoiceModel } from "./PurchaseRecord.model";

describe("Purchase Record Model", () => {
  test("Instant Expense", () => {
    const expenseDate = new Date();
    const supplier = { supplierId: "cloudflare" };
    const paymentAccount = { accountId: "director-loan" };
    const vatInputsAccount = { accountId: "vat-inputs" };
    const exchangeRate = new Prisma.Decimal(1.2);
    const expenseDenomination = 'USD';

    const instantExpense = new InstantExpenseModel(
      expenseDate,
      supplier,
      paymentAccount,
      vatInputsAccount,
      expenseDenomination,
      exchangeRate
    );

    const expenseAccount = { accountId: "web-hosting" };
    const lineItemNetAmount = new Prisma.Decimal(5);
    const lineItemVatAmount = new Prisma.Decimal(1);

    instantExpense.addLineItems([
      new LineItemModel(
        "",
        expenseAccount,
        lineItemNetAmount,
        lineItemVatAmount
      ),
    ]);

    const nominalTransactions = instantExpense.journal.ledgerTransactions.get(
      LedgerId.Nominal
    );
    const supplierTransactions = instantExpense.journal.ledgerTransactions.get(
      LedgerId.Supplier
    );
    const customerTransactions = instantExpense.journal.ledgerTransactions.get(
      LedgerId.Customer
    );

    expect(nominalTransactions).toBeDefined();
    expect(supplierTransactions).toBeDefined();
    expect(customerTransactions).toBeDefined();

    expect(nominalTransactions!.length).toStrictEqual(3);
    expect(supplierTransactions!.length).toStrictEqual(1);
    expect(customerTransactions!.length).toStrictEqual(0);

    expect(() =>
      instantExpense.journal.validateTransactions(
        LedgerId.Nominal,
        nominalTransactions!
      )
    ).not.toThrowError();
  });

  test("Purchase Invoice", () => {
    const expenseDate = new Date();
    const supplier = { supplierId: "cloudflare" };
    const vatInputsAccount = { accountId: "vat-inputs" };
    const exchangeRate = new Prisma.Decimal(1.2);
    const expenseDenomination = 'USD'

    const purchaseInvoice = new PurchaseInvoiceModel(
      expenseDate,
      supplier,
      vatInputsAccount,
      expenseDenomination,
      exchangeRate
    );

    const expenseAccount = { accountId: "web-hosting" };
    const lineItemNetAmount = new Prisma.Decimal(5);
    const lineItemVatAmount = new Prisma.Decimal(1);

    purchaseInvoice.addLineItems([
      new LineItemModel(
        "",
        expenseAccount,
        lineItemNetAmount,
        lineItemVatAmount
      ),
    ]);

    const nominalTransactions = purchaseInvoice.journal.ledgerTransactions.get(
      LedgerId.Nominal
    );
    const supplierTransactions = purchaseInvoice.journal.ledgerTransactions.get(
      LedgerId.Supplier
    );
    const customerTransactions = purchaseInvoice.journal.ledgerTransactions.get(
      LedgerId.Customer
    );

    expect(nominalTransactions).toBeDefined();
    expect(supplierTransactions).toBeDefined();
    expect(customerTransactions).toBeDefined();

    expect(nominalTransactions!.length).toStrictEqual(3);
    expect(supplierTransactions!.length).toStrictEqual(1);
    expect(customerTransactions!.length).toStrictEqual(0);

    expect(() =>
      purchaseInvoice.journal.validateTransactions(
        LedgerId.Nominal,
        nominalTransactions!
      )
    ).not.toThrowError();
  });
});

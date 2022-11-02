import { Account, PrismaClient, PurchaseRecord, Supplier } from "@prisma/client";
import { Prisma } from "@prisma/client";;
import { getRemainingBalance } from "@src/pages/api/purchase-records/[purchaseRecordId]";
import { client } from "@localprisma/db-client";
import { LedgerId } from "@src/constants/ledgers";
import { PurchaseRecordStatus } from "@src/constants/purchase-invoice-status";
import { TransactionType } from "@src/constants/transaction-types";
import { AccountDto, PresetAccountId } from "@src/schemas/account.schema";
import {
  JournalModel,
  NominalTransactionModel,
  SupplierTransactionModel,
  TransactionModelTypes,
} from "./Journal.model";
import { PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema";
import { SupplierDto } from "@src/schemas/supplier.schema";

export class LineItemModel {
  constructor(
    public description: string,
    public nominalAccount: Account | { accountId: string },
    public netAmount: Prisma.Decimal,
    public vatAmount: Prisma.Decimal
  ) {}
}

type PartiallyRequired<T, K extends keyof T> = Required<Pick<T, K>> &
  Partial<T>;

type PurchaseRecordArgs = {
  recordType: PurchaseRecordType;
  date: string | Date;
  supplier: PartiallyRequired<SupplierDto, "supplierId" | "denomination">;
  paymentAccount: PartiallyRequired<AccountDto, "accountId">;
};

type ExpenseRecordArgs = PurchaseRecordArgs & {
  vatInputsAccount: PartiallyRequired<AccountDto, "accountId">;
  exchangeRate: Prisma.Decimal;
}

type InstantExpenseArgs = Omit<ExpenseRecordArgs, "recordType">;
type PurchaseInvoiceArgs = Omit<ExpenseRecordArgs, "recordType"> & {
  dueDate: Date;
};
type PurchaseInvoicePaymentArgs = Omit<PurchaseRecordArgs, "recordType"> & {
  purchaseInvoice: PartiallyRequired<PurchaseRecordDto, 'purchaseRecordId'>
}

export class ExpenseRecordModel {
  public journal: JournalModel = new JournalModel();
  public lineItems: LineItemModel[] = [];

  constructor(public args: ExpenseRecordArgs) {}

  public getStatus() {
    switch (this.args.recordType) {
      case PurchaseRecordType.InstantExpense:
        return PurchaseRecordStatus.Paid;
      case PurchaseRecordType.PurchaseInvoice:
        return PurchaseRecordStatus.Outstanding;
    }
  }

  public addLineItem(lineItem: LineItemModel) {
    const transactions: TransactionModelTypes[] = [
      new SupplierTransactionModel(
        "credit",
        lineItem.netAmount.add(lineItem.vatAmount),
        new Date(this.args.date),
        this.args.supplier
      ),
      new NominalTransactionModel(
        "credit",
        lineItem.netAmount.add(lineItem.vatAmount).div(this.args.exchangeRate),
        new Date(this.args.date),
        this.args.paymentAccount
      ),
      new NominalTransactionModel(
        "debit",
        lineItem.netAmount.div(this.args.exchangeRate),
        new Date(this.args.date),
        lineItem.nominalAccount
      ),
    ].concat(
      lineItem.vatAmount.gt(0)
        ? [
            new NominalTransactionModel(
              "debit",
              lineItem.vatAmount.div(this.args.exchangeRate),
              new Date(this.args.date),
              this.args.vatInputsAccount
            ),
          ]
        : []
    );

    this.journal.addTransactions(transactions);

    this.lineItems.push(lineItem);
  }

  public addLineItems(lineItems: LineItemModel[]) {
    lineItems.map((li) => this.addLineItem(li));
  }

  public lineItemsGross(): Prisma.Decimal {
    return this.lineItems.reduce(
      (acc, n) => acc.add(n.netAmount.add(n.vatAmount)),
      new Prisma.Decimal(0)
    );
  }
}

export class InstantExpenseModel extends ExpenseRecordModel {
  constructor(args: InstantExpenseArgs) {
    super({
      ...args,
      recordType: PurchaseRecordType.InstantExpense,
    });
  }

  public async save(client: PrismaClient) {
    return await client.purchaseRecord.create({
      data: {
        transactionType: this.args.recordType as unknown as TransactionType,
        transactionDate: this.args.date,
        denomination: this.args.supplier.denomination,
        exchangeRate: this.args.exchangeRate,
        grossAmount: this.lineItemsGross(),
        supplier: { connect: { supplierId: this.args.supplier.supplierId } },
        status: this.getStatus(),
        lineItems: {
          create: this.lineItems.map((li) => ({
            description: "",
            netAmount: li.netAmount,
            vatAmount: li.vatAmount,
            grossAmount: li.netAmount.add(li.vatAmount),
            nominalAccount: {
              connect: { accountId: li.nominalAccount.accountId },
            },
          })),
        },
        journalEntry: {
          create: {
            transactions: {
              create: this.journal.makeDBTransactions(),
            },
          },
        },
      },
    });
  }
}

export class PurchaseInvoiceModel extends ExpenseRecordModel {
  private dueDate: Date;

  constructor(args: PurchaseInvoiceArgs) {
    super({
      ...args,
      recordType: PurchaseRecordType.PurchaseInvoice,
    });
    this.dueDate = args.dueDate;
  }

  public async save(client: PrismaClient) {
    return await client.purchaseRecord.create({
      data: {
        transactionType: this.args.recordType as unknown as TransactionType,
        transactionDate: this.args.date,
        denomination: this.args.supplier.denomination,
        exchangeRate: this.args.exchangeRate,
        grossAmount: this.lineItemsGross(),
        supplier: { connect: { supplierId: this.args.supplier.supplierId } },
        status: this.getStatus(),
        dueDate: this.dueDate,
        lineItems: {
          create: this.lineItems.map((li) => ({
            description: "",
            netAmount: li.netAmount,
            vatAmount: li.vatAmount,
            grossAmount: li.netAmount.add(li.vatAmount),
            nominalAccount: {
              connect: { accountId: li.nominalAccount.accountId },
            },
          })),
        },
        journalEntry: {
          create: {
            exchangeRate: this.args.exchangeRate,
            transactions: {
              create: this.journal.makeDBTransactions(),
            },
          },
        },
      },
    });
  }
}

export class PurchaseInvoicePaymentModel {

  public journal: JournalModel = new JournalModel();

  constructor(
    public args: PurchaseInvoicePaymentArgs
  ) {}

  public async pay(
    paymentAmount: Prisma.Decimal, 
    exchangeRate: Prisma.Decimal = new Prisma.Decimal(1), 
    exchangeGainOrLossAccount: PartiallyRequired<Account, 'accountId'>
  ) {

    const accountsPayable = await client.account.findFirst({
      where: { accountId: PresetAccountId.AccountsPayable }
    })

    const purchaseInvoice = await client.purchaseRecord.findFirst({
      where: {
        purchaseRecordId: this.args.purchaseInvoice.purchaseRecordId
      },
      include: {
        journalEntry: {
          include: {
            transactions: true
          }
        }
      }
    })

    if (!purchaseInvoice) 
      throw new Error('[PurchaseInvoicePaymentModel.pay()]: No Purchase Invoice found with given id')

    if (!purchaseInvoice.journalEntry)
      throw new Error('[PurchaseInvoicePaymentModel.pay()]: No Journal found on given Purchase Invoice')

    // const transactions = purchaseInvoice.journalEntry.transactions;
    
    const nominalPaymentAmount = paymentAmount.div(exchangeRate)

    const equivilentNominalAmount = paymentAmount.div(String(purchaseInvoice.exchangeRate));
    const gainOrLossAmount = equivilentNominalAmount.sub(nominalPaymentAmount);
    const gainOrLoss = gainOrLossAmount.gt(0) 
    ? "gain" 
    : gainOrLossAmount.lt(0) 
    ? "loss" 
    : "none";

    if (gainOrLoss === 'gain')
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsPayable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.paymentAccount),
        new NominalTransactionModel('credit', gainOrLossAmount.abs(), new Date(this.args.date), exchangeGainOrLossAccount),
        new SupplierTransactionModel('debit', paymentAmount, new Date(this.args.date), this.args.supplier)
      ])
    }
    else if (gainOrLoss === 'loss')
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsPayable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.paymentAccount),
        new NominalTransactionModel('debit', gainOrLossAmount.abs(), new Date(this.args.date), exchangeGainOrLossAccount),
        new SupplierTransactionModel('debit', paymentAmount, new Date(this.args.date), this.args.supplier)
      ])
    } 
    else
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsPayable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.paymentAccount),
        new SupplierTransactionModel('debit', paymentAmount, new Date(this.args.date), this.args.supplier)
      ])
    }

    const result = await client.purchaseRecord.create({
      data: {
        transactionDate: this.args.date,
        transactionType: TransactionType.PurchaseInvoicePayment,
        reference: this.args.purchaseInvoice.reference,
        attachmentLink: '',
        status: PurchaseRecordStatus.None,
        denomination: this.args.supplier.denomination,
        exchangeRate,
        grossAmount: paymentAmount,
        supplier: { connect: { supplierId: this.args.supplier.supplierId } },
        purchaseInvoice: { connect: { purchaseRecordId: this.args.purchaseInvoice.purchaseRecordId } },
        journalEntry: {
          create: {
            exchangeRate,
            transactions: {
              create: this.journal.makeDBTransactions()
            },
          }
        }
      }
    })

    await this.updatePurchaseInvoice()

    return result
  }

  private async updatePurchaseInvoice() {
    const purchaseInvoice = await client.purchaseRecord.findFirstOrThrow({
      where: { purchaseRecordId: this.args.purchaseInvoice.purchaseRecordId },
      include: {
        journalEntry: {
          include: {
            transactions: true
          }
        },
        payments: {
          include: {
            journalEntry: {
              include: {
                transactions: true
              }
            }
          }
        }
      }
    })

    const remainingBalance = getRemainingBalance(purchaseInvoice)

    if (remainingBalance.gt(0)) 
    {
      await client.purchaseRecord.update({
        where: { purchaseRecordId: this.args.purchaseInvoice.purchaseRecordId },
        data: {
          status: PurchaseRecordStatus.PartiallyPaid
        }
      })
    } 
    else if (remainingBalance.eq(0))
    {
      await client.purchaseRecord.update({
        where: { purchaseRecordId: this.args.purchaseInvoice.purchaseRecordId },
        data: {
          status: PurchaseRecordStatus.Paid
        }
      })
    }
  }
}
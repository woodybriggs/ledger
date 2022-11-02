import { Account, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { getRemainingBalance } from "@src/pages/api/sale-records/[saleRecordId]";
import { client } from "@localprisma/db-client";
import { PurchaseRecordStatus } from "@src/constants/purchase-invoice-status";
import { TransactionType } from "@src/constants/transaction-types";
import { AccountDto, PresetAccountId } from "@src/schemas/account.schema";
import {
  JournalModel,
  NominalTransactionModel,
  CustomerTransactionModel,
  TransactionModelTypes,
} from "./Journal.model";
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";
import { CustomerDto } from "@src/schemas/customer.schema";

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

type SaleRecordArgs = {
  recordType: SaleRecordType;
  date: string | Date;
  customer: PartiallyRequired<CustomerDto, "customerId" | "denomination">;
  receiptAccount: PartiallyRequired<AccountDto, "accountId">;
};

type ReceiptRecordArgs = SaleRecordArgs & {
  vatOutputsAccount: PartiallyRequired<AccountDto, "accountId">;
  exchangeRate: Prisma.Decimal;
}

type InstantSaleArgs = Omit<ReceiptRecordArgs, "recordType">;
type SalesInvoiceArgs = Omit<ReceiptRecordArgs, "recordType"> & {
  dueDate: Date;
};
type SalesInvoicePaymentArgs = Omit<SaleRecordArgs, "recordType"> & {
  salesInvoice: PartiallyRequired<SaleRecordDto, 'saleRecordId'>
}

export class SaleRecordModel {
  public journal: JournalModel = new JournalModel();
  public lineItems: LineItemModel[] = [];

  constructor(public args: ReceiptRecordArgs) {}

  public getStatus() {
    switch (this.args.recordType) {
      case SaleRecordType.InstantSale:
        return PurchaseRecordStatus.Paid;
      case SaleRecordType.SalesInvoice:
        return PurchaseRecordStatus.Outstanding;
    }
  }

  public addLineItem(lineItem: LineItemModel) {
    const transactions: TransactionModelTypes[] = [
      new CustomerTransactionModel(
        "credit",
        lineItem.netAmount.add(lineItem.vatAmount),
        new Date(this.args.date),
        this.args.customer
      ),
      new NominalTransactionModel(
        "debit",
        lineItem.netAmount.add(lineItem.vatAmount).div(this.args.exchangeRate),
        new Date(this.args.date),
        this.args.receiptAccount
      ),
      new NominalTransactionModel(
        "credit",
        lineItem.netAmount.div(this.args.exchangeRate),
        new Date(this.args.date),
        lineItem.nominalAccount
      ),
    ].concat(
      lineItem.vatAmount.gt(0)
        ? [
            new NominalTransactionModel(
              "credit",
              lineItem.vatAmount.div(this.args.exchangeRate),
              new Date(this.args.date),
              this.args.vatOutputsAccount
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

export class InstantSaleModel extends SaleRecordModel {
  constructor(args: InstantSaleArgs) {
    super({
      ...args,
      recordType: SaleRecordType.InstantSale,
    });
  }

  public async save(client: PrismaClient) {
    return await client.saleRecord.create({
      data: {
        transactionType: this.args.recordType as unknown as TransactionType,
        transactionDate: this.args.date,
        denomination: this.args.customer.denomination,
        exchangeRate: this.args.exchangeRate,
        grossAmount: this.lineItemsGross(),
        customer: { connect: { customerId: this.args.customer.customerId } },
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

export class SalesInvoiceModel extends SaleRecordModel {
  private dueDate: Date;

  constructor(args: SalesInvoiceArgs) {
    super({
      ...args,
      recordType: SaleRecordType.SalesInvoice,
    });
    this.dueDate = args.dueDate;
  }

  public async save(client: PrismaClient) {
    return await client.saleRecord.create({
      data: {
        transactionType: this.args.recordType as unknown as TransactionType,
        transactionDate: this.args.date,
        denomination: this.args.customer.denomination,
        exchangeRate: this.args.exchangeRate,
        grossAmount: this.lineItemsGross(),
        customer: { connect: { customerId: this.args.customer.customerId } },
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

export class SalesInvoicePaymentModel {

  public journal: JournalModel = new JournalModel();

  constructor(
    public args: SalesInvoicePaymentArgs
  ) {}

  public async receive(
    receiptAmount: Prisma.Decimal, 
    exchangeRate: Prisma.Decimal = new Prisma.Decimal(1), 
    exchangeGainOrLossAccount: PartiallyRequired<Account, 'accountId'>
  ) {

    const accountsReceivable = await client.account.findFirst({
      where: { accountId: PresetAccountId.AccountsReceivable }
    })

    const salesInvoice = await client.saleRecord.findFirst({
      where: {
        saleRecordId: this.args.salesInvoice.saleRecordId
      },
      include: {
        journalEntry: {
          include: {
            transactions: true
          }
        }
      }
    })

    if (!salesInvoice) 
      throw new Error('[PurchaseInvoicePaymentModel.pay()]: No Purchase Invoice found with given id')

    if (!salesInvoice.journalEntry)
      throw new Error('[PurchaseInvoicePaymentModel.pay()]: No Journal found on given Purchase Invoice')

    // const transactions = purchaseInvoice.journalEntry.transactions;
    
    const nominalPaymentAmount = receiptAmount.div(exchangeRate)

    const equivilentNominalAmount = receiptAmount.div(salesInvoice.exchangeRate);
    const gainOrLossAmount = equivilentNominalAmount.sub(nominalPaymentAmount);
    const gainOrLoss = gainOrLossAmount.gt(0) 
    ? "gain" 
    : gainOrLossAmount.lt(0) 
    ? "loss" 
    : "none";

    if (gainOrLoss === 'gain')
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsReceivable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.receiptAccount),
        new NominalTransactionModel('credit', gainOrLossAmount.abs(), new Date(this.args.date), exchangeGainOrLossAccount),
        new CustomerTransactionModel('debit', receiptAmount, new Date(this.args.date), this.args.customer)
      ])
    }
    else if (gainOrLoss === 'loss')
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsReceivable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.receiptAccount),
        new NominalTransactionModel('debit', gainOrLossAmount.abs(), new Date(this.args.date), exchangeGainOrLossAccount),
        new CustomerTransactionModel('debit', receiptAmount, new Date(this.args.date), this.args.customer)
      ])
    } 
    else
    {
      this.journal.addTransactions([
        new NominalTransactionModel('debit', equivilentNominalAmount, new Date(this.args.date), accountsReceivable!),
        new NominalTransactionModel('credit', nominalPaymentAmount, new Date(this.args.date), this.args.receiptAccount),
        new CustomerTransactionModel('debit', receiptAmount, new Date(this.args.date), this.args.customer)
      ])
    }

    const result = await client.saleRecord.create({
      data: {
        transactionDate: this.args.date,
        transactionType: TransactionType.PurchaseInvoicePayment,
        reference: this.args.salesInvoice.reference,
        attachmentLink: '',
        status: PurchaseRecordStatus.None,
        denomination: this.args.customer.denomination,
        exchangeRate,
        grossAmount: receiptAmount,
        customer: { connect: { customerId: this.args.customer.customerId } },
        saleInvoice: { connect: { saleRecordId: this.args.salesInvoice.saleRecordId } },
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
    const salesInvoice = await client.saleRecord.findFirstOrThrow({
      where: { saleInvoiceId: this.args.salesInvoice.saleRecordId },
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

    const remainingBalance = getRemainingBalance(salesInvoice)

    if (remainingBalance.gt(0)) 
    {
      await client.saleRecord.update({
        where: { saleRecordId: this.args.salesInvoice.saleRecordId },
        data: {
          status: PurchaseRecordStatus.PartiallyPaid
        }
      })
    } 
    else if (remainingBalance.eq(0))
    {
      await client.saleRecord.update({
        where: { saleRecordId: this.args.salesInvoice.saleRecordId },
        data: {
          status: PurchaseRecordStatus.Paid
        }
      })
    }
  }
}
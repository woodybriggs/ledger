import { PurchaseRecord } from "@prisma/client";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import { AccountType } from "@src/constants/account-taxonimies";
import { TransactionType } from "@src/constants/transaction-types";
import { ExpenseRecordModel, InstantExpenseModel, PurchaseInvoiceModel, PurchaseInvoicePaymentModel } from "@src/models/PurchaseRecord.model";
import { PresetAccountId } from "@src/schemas/account.schema";
import {
  CreateInstantExpenseSchema,
  CreatePurchaseInvoicePaymentSchema,
  CreatePurchaseInvoiceSchema,
  PurchaseRecordType,
  PurchaseRecordTypeSchema,
} from "@src/schemas/purchase-record.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";

const createInstantExpenseHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PurchaseRecord | ZodError>
) => {
  const { body } = req;

  const parsedResult = CreateInstantExpenseSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { transactionDate, paymentAccount, lineItems, exchangeRate, supplier } =
    parsedResult.data;

  const vatInputsAccount = await client.account.findFirst({
    where: { type: AccountType.VatInputs },
  });

  const instantExpenseModel = new InstantExpenseModel({
    date: transactionDate,
    supplier: { supplierId: supplier.supplierId, denomination: supplier.denomination },
    vatInputsAccount: vatInputsAccount!,
    paymentAccount,
    exchangeRate,
  });

  instantExpenseModel.addLineItems(
    lineItems.map((li) => ({
      ...li,
      nominalAccount: { accountId: li.nominalAccountId },
    }))
  );

  const result = await instantExpenseModel.save(client)

  return res.status(201).json(result)
};

const createPurchaseInvoiceHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PurchaseRecord | ZodError>
) => {
  const { body } = req;

  const parsedResult =
    CreatePurchaseInvoiceSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { transactionDate, dueDate, lineItems, exchangeRate, supplier } =
    parsedResult.data;

  const accountsPayable = await client.account.findFirst({
    where: { type: AccountType.AccountsPayable, accountId: PresetAccountId.AccountsPayable },
  });
  const vatInputsAccount = await client.account.findFirst({
    where: { type: AccountType.VatInputs },
  });

  const purchaseInvoiceModel = new PurchaseInvoiceModel({
    date: transactionDate,
    dueDate: dueDate,
    supplier: { supplierId: supplier.supplierId, denomination: supplier.denomination },
    vatInputsAccount: vatInputsAccount!,
    paymentAccount: accountsPayable!,
    exchangeRate,
  });

  purchaseInvoiceModel.addLineItems(
    lineItems.map((li) => ({
      ...li,
      nominalAccount: { accountId: li.nominalAccountId },
    }))
  );

  const result = await purchaseInvoiceModel.save(client)

  return res.status(201).json(result)
};

const createPurchaseInvoicePaymentHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PurchaseRecord | ZodError | Error>
) => {
  const { body } = req;

  const parsedResult = CreatePurchaseInvoicePaymentSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { 
    transactionDate,
    denomination,
    paymentAccount, 
    paymentAmount, 
    purchaseInvoiceId, 
    supplier,
    exchangeRate
  } = parsedResult.data;

  const purchaseInvoice = await client.purchaseRecord.findFirst({where: { purchaseRecordId: purchaseInvoiceId }})
  if (!purchaseInvoice) return res.status(400).json(new Error(`Purchase Invoice does not exist`));

  const exchangeGainOrLossAccount = await client.account.findFirst({
    where: { accountId: PresetAccountId.ExchangeGainLoss },
  });

  const purchaseInvoicePaymentModel = new PurchaseInvoicePaymentModel({
    supplier,
    paymentAccount,
    purchaseInvoice,
    date: transactionDate
  })

  const result = await purchaseInvoicePaymentModel.pay(paymentAmount, exchangeRate, exchangeGainOrLossAccount!)

  return res.status(200).json(result)
};

const createPurchaseRecordHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { body } = req;

  const parsedTransactionTypeData = PurchaseRecordTypeSchema.safeParse(body);
  if (!parsedTransactionTypeData.success)
    return res.status(400).json(parsedTransactionTypeData.error);

  const { transactionType } = parsedTransactionTypeData.data;

  const handler = createPurchaseRecordDispatcher({
    [TransactionType.InstantExpense]: createInstantExpenseHandler,
    [TransactionType.PurchaseInvoice]: createPurchaseInvoiceHandler,
    [TransactionType.PurchaseInvoicePayment]:
      createPurchaseInvoicePaymentHandler,
  })(transactionType);

  return await handler(req, res);
};

const listPurchaseRecordsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ data: PurchaseRecord[] } | ZodError>
) => {
  const { supplierId } = req.query as { supplierId: string };

  const records = await client.purchaseRecord.findMany({
    where: {
      supplierId,
    },
  });

  return res.status(200).json({ data: records });
};


export default methodHandlerDispatcher({
  GET: listPurchaseRecordsHandler,
  POST: createPurchaseRecordHandler,
});

// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------

const createPurchaseRecordDispatcher =
  (dispatch: {
    [PurchaseRecordType.InstantExpense]: NextApiHandler<PurchaseRecord | ZodError | Error>;
    [PurchaseRecordType.PurchaseInvoice]: NextApiHandler<
      PurchaseRecord | ZodError | Error
    >;
    [PurchaseRecordType.PurchaseInvoicePayment]: NextApiHandler<
      PurchaseRecord | ZodError | Error
    >;
  }) =>
  (
    transactionType:
      | PurchaseRecordType.PurchaseInvoice
      | PurchaseRecordType.PurchaseInvoicePayment
      | PurchaseRecordType.InstantExpense
  ) => {
    return dispatch[transactionType];
  };

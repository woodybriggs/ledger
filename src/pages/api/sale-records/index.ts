import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { client } from "@localprisma/db-client";
import { AccountType } from "@src/constants/account-taxonimies";
import { PresetAccountId } from "@src/schemas/account.schema";
import { methodHandlerDispatcher } from "@src/utils/api-method-dispatcher";
import { CreateInstantSaleSchema, CreateSaleInvoicePaymentSchema, CreateSaleInvoiceSchema, SaleRecordDto, SaleRecordType, SaleRecordTypeSchema } from "@src/schemas/sale-record.schema";
import { InstantSaleModel, SalesInvoiceModel, SalesInvoicePaymentModel } from "@src/models/SaleRecord.model";

const createInstantSaleHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SaleRecordDto | ZodError>
) => {
  const { body } = req;

  const parsedResult = CreateInstantSaleSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { transactionDate, receiptAccount, lineItems, exchangeRate, customer } =
    parsedResult.data;

  const vatOutputsAccount = await client.account.findFirst({
    where: { type: AccountType.VatOutputs },
  });

  const instantSaleModel = new InstantSaleModel({
    date: transactionDate,
    customer,
    vatOutputsAccount: vatOutputsAccount!,
    receiptAccount,
    exchangeRate,
  });

  instantSaleModel.addLineItems(
    lineItems.map((li) => ({
      ...li,
      nominalAccount: { accountId: li.nominalAccountId },
    }))
  );

  const result = await instantSaleModel.save(client)

  return res.status(201).json(result)
};

const createSalesInvoiceHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SaleRecordDto | ZodError>
) => {
  const { body } = req;

  const parsedResult =
    CreateSaleInvoiceSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { transactionDate, dueDate, lineItems, exchangeRate, customer } =
    parsedResult.data;

  const accountsReceivable = await client.account.findFirst({
    where: { type: AccountType.AccountsReceivable, accountId: PresetAccountId.AccountsReceivable },
  });
  const vatOutputsAccount = await client.account.findFirst({
    where: { type: AccountType.VatOutputs },
  });

  const salesInvoiceModel = new SalesInvoiceModel({
    date: transactionDate,
    dueDate: dueDate,
    customer,
    vatOutputsAccount: vatOutputsAccount!,
    receiptAccount: accountsReceivable!,
    exchangeRate,
  });

  salesInvoiceModel.addLineItems(
    lineItems.map((li) => ({
      ...li,
      nominalAccount: { accountId: li.nominalAccountId },
    }))
  );

  const result = await salesInvoiceModel.save(client)

  return res.status(201).json(result)
};

const createSalesInvoicePaymentHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SaleRecordDto | ZodError | Error>
) => {
  const { body } = req;

  const parsedResult = CreateSaleInvoicePaymentSchema.safeParse(body);
  if (!parsedResult.success) return res.status(400).json(parsedResult.error);

  const { 
    transactionDate,
    receiptAccount, 
    receiptAmount, 
    salesInvoiceId, 
    customer,
    exchangeRate
  } = parsedResult.data;

  const salesInvoice = await client.saleRecord.findFirst({where: { saleRecordId: salesInvoiceId }})
  if (!salesInvoice) return res.status(400).json(new Error(`Purchase Invoice does not exist`));

  const exchangeGainOrLossAccount = await client.account.findFirst({
    where: { accountId: PresetAccountId.ExchangeGainLoss },
  });

  const purchaseInvoicePaymentModel = new SalesInvoicePaymentModel({
    customer,
    receiptAccount,
    salesInvoice,
    date: transactionDate
  })

  const result = await purchaseInvoicePaymentModel.receive(receiptAmount, exchangeRate, exchangeGainOrLossAccount!)

  return res.status(200).json(result)
};

const createSaleRecordHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { body } = req;

  const parsedTransactionTypeData = SaleRecordTypeSchema.safeParse(body);
  if (!parsedTransactionTypeData.success)
    return res.status(400).json(parsedTransactionTypeData.error);

  const { transactionType } = parsedTransactionTypeData.data;

  const handler = createSaleRecordDispatcher({
    [SaleRecordType.InstantSale]: createInstantSaleHandler,
    [SaleRecordType.SalesInvoice]: createSalesInvoiceHandler,
    [SaleRecordType.SalesInvoicePayment]: createSalesInvoicePaymentHandler,
  })(transactionType);

  return await handler(req, res);
};

const listPurchaseRecordsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ data: SaleRecordDto[] } | ZodError>
) => {
  const { customerId } = req.query as { customerId: string };

  const records = await client.saleRecord.findMany({
    where: {
      customerId,
    },
  });

  return res.status(200).json({ data: records });
};


export default methodHandlerDispatcher({
  GET: listPurchaseRecordsHandler,
  POST: createSaleRecordHandler,
});

// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------

const createSaleRecordDispatcher =
  (dispatch: {
    [SaleRecordType.InstantSale]: NextApiHandler<SaleRecordDto | ZodError | Error>;
    [SaleRecordType.SalesInvoice]: NextApiHandler<
      SaleRecordDto | ZodError | Error
    >;
    [SaleRecordType.SalesInvoicePayment]: NextApiHandler<
      SaleRecordDto | ZodError | Error
    >;
  }) =>
  (
    transactionType:
      | SaleRecordType.InstantSale
      | SaleRecordType.SalesInvoice
      | SaleRecordType.SalesInvoicePayment
  ) => {
    return dispatch[transactionType];
  };

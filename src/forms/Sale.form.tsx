import {
  Loader
} from "@mantine/core";
import { Account, Customer, SaleRecord } from "@prisma/client";
import {
  MutationFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, queryMutationKey, QueryMutationKey } from "@src/utils/api-client";
import { TransactionType } from "@src/constants/transaction-types";
import { LineItemFormValues } from "@src/components/LineItemsTableInput";
import { useRootDenomination } from "@src/hooks/api-hooks";
import { Prisma } from "@prisma/client";;
import { CreateLineItemDto } from "@src/schemas/line-item.schema";
import { InstantSaleForm } from "./InstantSale.form";
import { SalesInvoiceForm } from "./SalesInvoice.form";
import { SalesInvoicePaymentForm } from "./SalesInvoicePayment";
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";

export type BaseSaleFormValues = {
  customer: Customer;
  reference: string;
  attachmentLink: string;
  exchangeRate: Prisma.Decimal;
};

export type SaleInvoiceFormValues = BaseSaleFormValues & {
  lineItems: LineItemFormValues[];
  invoiceDate: Date;
  dueDate: Date;
};

export type SaleInvoicePaymentFormValues = BaseSaleFormValues & {
  receiptAccount: Account;
  receiptDate: Date;
  receiptAmount: Prisma.Decimal
};

export type InstantSaleFormValues = BaseSaleFormValues & {
  lineItems: LineItemFormValues[];
  receiptAccount: Account;
  receiptDate: Date;
};

export type SaleFormData =
  | {
      formType: SaleRecordType.InstantSale;
      data: InstantSaleFormValues;
    }
  | {
      formType: SaleRecordType.SalesInvoice;
      data: SaleInvoiceFormValues;
    }
  | {
      formType: SaleRecordType.SalesInvoicePayment;
      data: SaleInvoicePaymentFormValues;
      salesInvoice: SaleRecordDto,
    };


const serializeLineItemForRequest = ({
  description,
  nominalAccount,
  netAmount,
  vatAmount
}: LineItemFormValues): CreateLineItemDto => ({
  description,
  nominalAccountId: nominalAccount.accountId,
  netAmount: netAmount,
  vatAmount: vatAmount
})

const createSaleRecord: MutationFunction<
  SaleRecordDto,
  SaleFormData
> = async (values) => {
  const { formType, data } = values;

  switch (formType) {
    case SaleRecordType.InstantSale: {
      return await api.saleRecords.createInstantSale({
        customer: data.customer,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        transactionType: formType,
        receiptAccount: data.receiptAccount,
        transactionDate: data.receiptDate,
        denomination: data.customer.denomination,
        lineItems: data.lineItems.map(serializeLineItemForRequest)
      })
    }
    case SaleRecordType.SalesInvoice: {
      return await api.saleRecords.createSalesInvoice({
        customer: data.customer,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        dueDate: data.dueDate,
        transactionType: formType,
        transactionDate: data.invoiceDate,
        denomination: data.customer.denomination,
        lineItems: data.lineItems.map(serializeLineItemForRequest),
      });
    }
    case SaleRecordType.SalesInvoicePayment: {
      return await api.saleRecords.createSalesInvoicePayment({
        customer: data.customer,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        transactionType: formType,
        receiptAccount: data.receiptAccount,
        transactionDate: data.receiptDate,
        denomination: data.customer.denomination,
        receiptAmount: data.receiptAmount,
        salesInvoiceId: values.salesInvoice.saleRecordId,
      });
    }
  }
};


type SaleFormProps = ({
  formType: SaleRecordType.InstantSale | SaleRecordType.SalesInvoice,
} | {
  formType: SaleRecordType.SalesInvoicePayment
  saleInvoiceId: string
}) & {
  onSuccessfulSubmission: () => void;
}


export const SaleForm: React.FC<SaleFormProps> = (props) => {

  const { formType, onSuccessfulSubmission } = props

  const queryClient = useQueryClient();

  const { data: rootDenomination, isLoading } = useRootDenomination()

  const { mutate, isLoading: isSubmitting } = useMutation(
    [queryMutationKey(QueryMutationKey.SALE_RECORDS_CREATE, formType)],
    (data: SaleFormData) => createSaleRecord(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.TRANSACTIONS_LIST]);
        queryClient.invalidateQueries([QueryMutationKey.SALE_RECORDS_LIST]);
        onSuccessfulSubmission();
      },
    }
  );

  const { data: salesInvoiceRefRecord, isLoading: salesInvoiceRefLoading } = useQuery(
    [queryMutationKey(
      QueryMutationKey.SALE_RECORDS_GET, 
      formType === SaleRecordType.SalesInvoicePayment ? props.saleInvoiceId : ''
    )],
    () => api.saleRecords.get(formType === SaleRecordType.SalesInvoicePayment ? props.saleInvoiceId : ''),
    {
      enabled: formType === SaleRecordType.SalesInvoicePayment
    }
  )

  if (!rootDenomination || isLoading) return <Loader />;

  switch (formType) {
    case SaleRecordType.InstantSale:
      return <InstantSaleForm 
        mutate={mutate} 
        rootDenomination={rootDenomination}
      />;

    case SaleRecordType.SalesInvoice:
      return <SalesInvoiceForm 
        mutate={mutate} 
        rootDenomination={rootDenomination}
      />;

    case SaleRecordType.SalesInvoicePayment:
      return (
        <>
          { salesInvoiceRefRecord && <SalesInvoicePaymentForm 
            mutate={mutate} 
            rootDenomination={rootDenomination}
            salesInvoiceRef={salesInvoiceRefRecord}
          />}
        </>
      )
  }
};

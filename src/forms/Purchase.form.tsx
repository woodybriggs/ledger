import {
  Group,
  Loader,
  NumberInput,
  Text,
} from "@mantine/core";
import { Account, PurchaseRecord, Supplier } from "@prisma/client";
import {
  MutationFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Controller,
  useFormContext,
} from "react-hook-form";
import { AccountTypeRoot } from "@src/constants/account-taxonimies";
import { api, queryMutationKey, QueryMutationKey } from "@src/utils/api-client";
import { getCurrencyPrecision } from "@src/components/CurrencySelect";
import { TransactionType } from "@src/constants/transaction-types";
import { LineItemFormValues } from "@src/components/LineItemsTableInput";
import { InstantExpenseForm } from "./InstantExpense.form";
import { PurchaseInvoiceForm } from "./PurchaseInvoice.form";
import { PurchaseInvoicePaymentForm } from "./PurchaseInvoicePayment";
import { useRootDenomination } from "@src/hooks/api-hooks";
import { Prisma } from "@prisma/client";;
import { CreateLineItemDto } from "@src/schemas/line-item.schema";
import { BasePurchaseRecordDto, PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema";

export type BasePurchaseFormValues = {
  supplier: Supplier;
  reference: string;
  attachmentLink: string;
  exchangeRate: Prisma.Decimal;
  lineItems: LineItemFormValues[];
};

export type PurchaseInvoiceFormValues = BasePurchaseFormValues & {
  invoiceDate: Date;
  dueDate: Date;
};

export type PurchaseInvoicePaymentFormValues = {
  supplier: Supplier;
  reference: string;
  attachmentLink: string;
  exchangeRate: Prisma.Decimal;
  paymentAccount: Account;
  paymentDate: Date;
  paymentAmount: Prisma.Decimal
};

export type InstantExpenseFormValues = BasePurchaseFormValues & {
  paymentAccount: Account;
  paymentDate: Date;
};

export type PurchaseFormData =
  | {
      formType: PurchaseRecordType.InstantExpense;
      data: InstantExpenseFormValues;
    }
  | {
      formType: PurchaseRecordType.PurchaseInvoice;
      data: PurchaseInvoiceFormValues;
    }
  | {
      formType: PurchaseRecordType.PurchaseInvoicePayment;
      data: PurchaseInvoicePaymentFormValues;
      purchaseInvoice: PurchaseRecordDto
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

const createPurchaseRecord: MutationFunction<
  PurchaseRecordDto,
  PurchaseFormData
> = async (values) => {
  const { formType, data } = values;

  switch (formType) {
    case PurchaseRecordType.InstantExpense: {
      return await api.purchaseRecords.createInstantExpense({
        supplier: data.supplier,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        transactionType: formType,
        paymentAccount: data.paymentAccount,
        transactionDate: data.paymentDate,
        denomination: data.supplier.denomination,
        lineItems: data.lineItems.map(serializeLineItemForRequest)
      })
    }
    case PurchaseRecordType.PurchaseInvoice: {
      return await api.purchaseRecords.createPurchaseInvoice({
        supplier: data.supplier,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        dueDate: data.dueDate,
        transactionType: formType,
        transactionDate: data.invoiceDate,
        denomination: data.supplier.denomination,
        lineItems: data.lineItems.map(serializeLineItemForRequest)
      });
    }
    case PurchaseRecordType.PurchaseInvoicePayment: {
      return await api.purchaseRecords.createPurchaseInvoicePayment({
        supplier: data.supplier,
        attachmentLink: data.attachmentLink,
        reference: data.reference,
        exchangeRate: data.exchangeRate,
        transactionType: formType,
        paymentAccount: data.paymentAccount,
        transactionDate: data.paymentDate,
        denomination: data.supplier.denomination,
        paymentAmount: data.paymentAmount,
        purchaseInvoiceId: values.purchaseInvoice.purchaseRecordId,
      });
    }
  }
};


type PurchaseFormProps = ({
  formType: TransactionType.InstantExpense | TransactionType.PurchaseInvoice,
} | {
  formType: TransactionType.PurchaseInvoicePayment
  purchaseInvoiceId: string
}) & {
  onSuccessfulSubmission: () => void;
}


export const PurchaseForm: React.FC<PurchaseFormProps> = (props) => {

  const { formType, onSuccessfulSubmission } = props

  const queryClient = useQueryClient();

  const { data: rootDenomination, isLoading } = useRootDenomination()

  const { mutate, isLoading: isSubmitting } = useMutation(
    [queryMutationKey(QueryMutationKey.PURCHASE_RECORDS_CREATE, formType)],
    (data: PurchaseFormData) => createPurchaseRecord(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.TRANSACTIONS_LIST]);
        queryClient.invalidateQueries([QueryMutationKey.PURCHASE_RECORDS_LIST]);
        onSuccessfulSubmission();
      },
    }
  );

  const { data: purchaseInvoiceRefRecord, isLoading: purchaseInvoiceRefLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.PURCHASE_RECORDS_GET, formType === TransactionType.PurchaseInvoicePayment ? props.purchaseInvoiceId : '')],
    () => api.purchaseRecords.get(formType === TransactionType.PurchaseInvoicePayment ? props.purchaseInvoiceId : ''),
    {
      enabled: formType === TransactionType.PurchaseInvoicePayment
    }
  )

  if (!rootDenomination || isLoading) return <Loader />;

  switch (formType) {
    case TransactionType.InstantExpense:
      return <InstantExpenseForm 
        mutate={mutate} 
        rootDenomination={rootDenomination}
      />;

    case TransactionType.PurchaseInvoice:
      return <PurchaseInvoiceForm 
        mutate={mutate} 
        rootDenomination={rootDenomination}
      />;

    case TransactionType.PurchaseInvoicePayment:
      return (
        <>
          { purchaseInvoiceRefRecord && <PurchaseInvoicePaymentForm 
            mutate={mutate} 
            rootDenomination={rootDenomination}
            purchaseInvoiceRef={purchaseInvoiceRefRecord}
          />}
        </>
      )
  }
};

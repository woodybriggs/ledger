import {
  Button,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  TextInput,
  Text,
  Table,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Account, PurchaseRecord } from "@prisma/client";
import { UseMutateFunction } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";;
import {
  Controller,
  FormProvider,
  useForm,
  useWatch,
} from "react-hook-form";
import { AccountSelect } from "@src/components/AccountSelect";
import { getCurrencyPrecision } from "@src/components/CurrencySelect";
import {
  ExchangeRateInputNew,
} from "@src/components/ExchangeRateInput";
import { MoneyInput } from "@src/components/MoneyInput";
import { AccountType } from "@src/constants/account-taxonimies";
import { TransactionType } from "@src/constants/transaction-types";
import { Denomination } from "@src/hooks/api-hooks";
import {
  PurchaseFormData,
  PurchaseInvoicePaymentFormValues,
} from "./Purchase.form";
import { PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema";

export const PurchaseInvoicePaymentForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<PurchaseRecordDto, unknown, PurchaseFormData, unknown>;
  purchaseInvoiceRef: PurchaseRecordDto;
}> = ({ rootDenomination, mutate, purchaseInvoiceRef }) => {
  const form = useForm<PurchaseInvoicePaymentFormValues>({
    defaultValues: {
      supplier: purchaseInvoiceRef.supplier!,
      reference: purchaseInvoiceRef.reference || "",
      paymentAmount: new Prisma.Decimal(purchaseInvoiceRef.totalDue || 0),
      exchangeRate: new Prisma.Decimal(1),
    },
  });
  const { control, handleSubmit } = form;

  const onSubmit = (data: PurchaseInvoicePaymentFormValues) => {
    mutate({
      formType: PurchaseRecordType.PurchaseInvoicePayment,
      data: { ...data },
      purchaseInvoice: purchaseInvoiceRef
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="paymentAccount"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <AccountSelect
                  label="Payment Account"
                  setting="include"
                  types={[
                    AccountType.Bank,
                    AccountType.OtherCurrentAssets,
                    AccountType.OtherCurrentLiabilities,
                  ]}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value as Account}
                />
              )}
            />
            <Controller
              control={control}
              name="paymentDate"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <DatePicker
                  label="Payment Date"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value as Date}
                />
              )}
            />
            <Controller
              control={control}
              name="exchangeRate"
              render={({ field: { onChange, onBlur, value } }) => (
                <ExchangeRateInputNew
                  label="Exchange Rate"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  sourceDenomination={purchaseInvoiceRef.denomination}
                  destinationDenomination={rootDenomination.tick}
                />
              )}
            />
          </SimpleGrid>
          <Table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Purchase Invoice Ref.</th>
                <th align="right">Amt. Due</th>
                <th align="right">Pay Amt.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{purchaseInvoiceRef.supplier?.name}</td>
                <td>{purchaseInvoiceRef.reference}</td>
                <td align="right">
                  {`${purchaseInvoiceRef.totalDue} ${purchaseInvoiceRef.denomination}`}
                </td>
                <td align="right">
                  <Controller
                    control={control}
                    name="paymentAmount"
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                     <MoneyInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        denomination={{
                          tick: purchaseInvoiceRef.denomination,
                          decimalPlaces: getCurrencyPrecision(purchaseInvoiceRef.denomination)
                        }}
                     />
                    )}
                  />
                </td>
              </tr>
            </tbody>
          </Table>

          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="attachmentLink"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Attachment"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
          </SimpleGrid>

          <Group position="right">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    </FormProvider>
  );
};

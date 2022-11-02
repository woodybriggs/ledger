import {
  Button,
  Group,
  SimpleGrid,
  Stack,
  TextInput,
  Table,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Account } from "@prisma/client";
import { UseMutateFunction } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";;
import {
  Controller,
  FormProvider,
  useForm,
} from "react-hook-form";
import { AccountSelect } from "@src/components/AccountSelect";
import { getCurrencyPrecision } from "@src/components/CurrencySelect";
import {
  ExchangeRateInputNew,
} from "@src/components/ExchangeRateInput";
import { MoneyInput } from "@src/components/MoneyInput";
import { AccountType } from "@src/constants/account-taxonimies";
import { Denomination } from "@src/hooks/api-hooks";
import {
  SaleFormData,
  SaleInvoicePaymentFormValues,
} from "./Sale.form";
import { SaleRecordType, SaleRecordDto } from "@src/schemas/sale-record.schema";

export const SalesInvoicePaymentForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<SaleRecordDto, unknown, SaleFormData, unknown>;
  salesInvoiceRef: SaleRecordDto;
}> = ({ rootDenomination, mutate, salesInvoiceRef }) => {
  const form = useForm<SaleInvoicePaymentFormValues>({
    defaultValues: {
      customer: salesInvoiceRef.customer!,
      reference: salesInvoiceRef.reference || "",
      receiptAmount: new Prisma.Decimal(salesInvoiceRef.totalDue || 0),
      exchangeRate: new Prisma.Decimal(1),
    },
  });
  const { control, handleSubmit } = form;

  const onSubmit = (data: SaleInvoicePaymentFormValues) => {
    mutate({
      formType: SaleRecordType.SalesInvoicePayment,
      data,
      salesInvoice: salesInvoiceRef
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="receiptAccount"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <AccountSelect
                  label="Receipt Account"
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
              name="receiptDate"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <DatePicker
                  label="Receipt Date"
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
                  sourceDenomination={salesInvoiceRef.denomination}
                  destinationDenomination={rootDenomination.tick}
                />
              )}
            />
          </SimpleGrid>
          <Table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Sale Invoice Ref.</th>
                <th align="right">Amt. Due</th>
                <th align="right">Pay Amt.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{salesInvoiceRef.customer?.name}</td>
                <td>{salesInvoiceRef.reference}</td>
                <td align="right">
                  {`${salesInvoiceRef.totalDue} ${salesInvoiceRef.denomination}`}
                </td>
                <td align="right">
                  <Controller
                    control={control}
                    name="receiptAmount"
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                     <MoneyInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        denomination={{
                          tick: salesInvoiceRef.denomination,
                          decimalPlaces: getCurrencyPrecision(salesInvoiceRef.denomination)
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

import { Button, Group, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Account, PurchaseRecord, SaleRecord } from "@prisma/client";
import { UseMutateFunction } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";;
import {
  Control,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { AccountSelect } from "@src/components/AccountSelect";
import { ExchangeRateInputNew } from "@src/components/ExchangeRateInput";
import {
  LineItemFormValues,
  LineItemsTableInput,
} from "@src/components/LineItemsTableInput";
import { CustomerSelect } from "@src/components/CustomerSelect";
import { TotalsTable } from "@src/components/TotalsTable";
import { AccountType } from "@src/constants/account-taxonimies";
import { Denomination } from "@src/hooks/api-hooks";
import { InstantSaleFormValues, SaleFormData } from "./Sale.form";
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";

export const InstantSaleForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<SaleRecordDto, unknown, SaleFormData, unknown>;
}> = ({ rootDenomination, mutate }) => {
  const form = useForm<InstantSaleFormValues>({
    defaultValues: {
      exchangeRate: new Prisma.Decimal(1),
      lineItems: [
        {
          description: "",
          netAmount: new Prisma.Decimal(0),
          vatAmount: new Prisma.Decimal(0),
        },
      ],
    },
  });
  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray<InstantSaleFormValues>({
    control: control,
    name: "lineItems",
  });

  const onSubmit = (data: InstantSaleFormValues) => {
    mutate({ formType: SaleRecordType.InstantSale, data: data });
  };

  const customerDenomination = useWatch({
    control,
    name: "customer.denomination",
    defaultValue: rootDenomination.tick,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="customer"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomerSelect
                  withAsterisk
                  label="Customer"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value?.customerId || ""}
                />
              )}
            />
            {customerDenomination &&
              customerDenomination !== rootDenomination.tick && (
                <Controller
                  control={control}
                  name="exchangeRate"
                  render={({field: { onChange, onBlur, value }}) => (
                    <ExchangeRateInputNew
                      sourceDenomination={customerDenomination}
                      destinationDenomination={rootDenomination.tick}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                />
              )}
          </SimpleGrid>
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
                  name="receiptAccount"
                  label="Receipt Account"
                  setting="include"
                  types={[
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
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="reference"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Reference"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
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

          <LineItemsTableInput
            fields={fields as unknown as LineItemFormValues[]}
            append={append}
            remove={remove}
            denomination={customerDenomination || ""}
            destinationDenomination={rootDenomination.tick}
          />

          <Group position="right">
            <TotalsTable
              sourceDenomination={customerDenomination || ""}
              nominalDenomination={rootDenomination.tick}
            />
          </Group>

          <Group position="right">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    </FormProvider>
  );
};

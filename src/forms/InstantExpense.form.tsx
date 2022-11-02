import { Button, Group, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Account, PurchaseRecord } from "@prisma/client";
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
import { SupplierSelect } from "@src/components/SupplierSelect";
import { TotalsTable } from "@src/components/TotalsTable";
import { AccountType } from "@src/constants/account-taxonimies";
import { Denomination } from "@src/hooks/api-hooks";
import { InstantExpenseFormValues, PurchaseFormData } from "./Purchase.form";
import { PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema";

export const InstantExpenseForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<PurchaseRecordDto, unknown, PurchaseFormData, unknown>;
}> = ({ rootDenomination, mutate }) => {
  const form = useForm<InstantExpenseFormValues>({
    defaultValues: {
      exchangeRate: new Prisma.Decimal(1),
      lineItems: [
        {
          description: "",
          netAmount: new Prisma.Decimal(0),
          vatAmount: new Prisma.Decimal(0)
        },
      ],
    },
  });
  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray<InstantExpenseFormValues>({
    control: control,
    name: "lineItems",
  });

  const onSubmit = (data: InstantExpenseFormValues) => {
    mutate({ formType: PurchaseRecordType.InstantExpense, data: data });
  };

  const supplierDenomination = useWatch({
    control,
    name: "supplier.denomination",
    defaultValue: rootDenomination.tick,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="supplier"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <SupplierSelect
                  withAsterisk
                  label="Supplier"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value?.supplierId || ""}
                />
              )}
            />
            {supplierDenomination &&
              supplierDenomination !== rootDenomination.tick && (
                <Controller
                  control={control}
                  name="exchangeRate"
                  render={({field: { onChange, onBlur, value }}) => (
                    <ExchangeRateInputNew
                      sourceDenomination={supplierDenomination}
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
              name="paymentAccount"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <AccountSelect
                  name="paymentAccount"
                  label="Payment Account"
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
            denomination={supplierDenomination || ""}
            destinationDenomination={rootDenomination.tick}
          />

          <Group position="right">
            <TotalsTable
              sourceDenomination={supplierDenomination || ""}
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

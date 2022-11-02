import { Button, Group, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { UseMutateFunction } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";;
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { ExchangeRateInputNew } from "@src/components/ExchangeRateInput";
import { emptyLineItemRow, LineItemsTableInput } from "@src/components/LineItemsTableInput";
import { SupplierSelect } from "@src/components/SupplierSelect";
import { TotalsTable } from "@src/components/TotalsTable";
import { TransactionType } from "@src/constants/transaction-types";
import { Denomination } from "@src/hooks/api-hooks";
import { PurchaseFormData, PurchaseInvoiceFormValues } from "./Purchase.form";
import { PurchaseRecordDto, PurchaseRecordType } from "@src/schemas/purchase-record.schema";

export const PurchaseInvoiceForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<PurchaseRecordDto, unknown, PurchaseFormData, unknown>;
}> = ({ rootDenomination, mutate }) => {
  const form = useForm<PurchaseInvoiceFormValues>({
    defaultValues: {
      exchangeRate: new Prisma.Decimal(1),
      lineItems: [emptyLineItemRow],
    },
  });
  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray<PurchaseInvoiceFormValues>({
    control: form.control,
    name: "lineItems",
  });

  const onSubmit = (data: PurchaseInvoiceFormValues) => {
    mutate({ formType: PurchaseRecordType.PurchaseInvoice, data: data });
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
              name="invoiceDate"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <DatePicker
                  label="Invoice Date"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value as Date}
                />
              )}
            />
            <Controller
              control={control}
              name="dueDate"
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <DatePicker
                  label="Due Date"
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
            fields={fields}
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

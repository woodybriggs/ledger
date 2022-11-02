import { Button, Group, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { SaleRecord } from "@prisma/client";
import { UseMutateFunction } from "@tanstack/react-query";
import { Prisma } from "@prisma/client";;
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { CustomerSelect } from "@src/components/CustomerSelect";
import { ExchangeRateInputNew } from "@src/components/ExchangeRateInput";
import { emptyLineItemRow, LineItemsTableInput } from "@src/components/LineItemsTableInput";
import { TotalsTable } from "@src/components/TotalsTable";
import { Denomination } from "@src/hooks/api-hooks";
import { SaleFormData, SaleInvoiceFormValues } from "./Sale.form";
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";

export const SalesInvoiceForm: React.FC<{
  rootDenomination: Denomination;
  mutate: UseMutateFunction<SaleRecordDto, unknown, SaleFormData, unknown>;
}> = ({ rootDenomination, mutate }) => {
  const form = useForm<SaleInvoiceFormValues>({
    defaultValues: {
      exchangeRate: new Prisma.Decimal(1),
      lineItems: [emptyLineItemRow],
    },
  });
  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray<SaleInvoiceFormValues>({
    control: form.control,
    name: "lineItems",
  });

  const onSubmit = (data: SaleInvoiceFormValues) => {
    mutate({ formType: SaleRecordType.SalesInvoice, data: data });
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

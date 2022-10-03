import {
  ActionIcon,
  Button,
  Group,
  Loader,
  NumberInput,
  Text,
  Stack,
  Table,
  TextInput,
  SimpleGrid,
} from "@mantine/core";
import { IconArrowsSplit2, IconTrash } from "@tabler/icons";
import { DatePicker } from "@mantine/dates";
import { Account, Customer } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Control,
  Controller,
  FormProvider,
  Path,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { AccountType, AccountTypeRoot } from "../constants/account-taxonimies";
import { api, QueryMutationKey } from "../utils/api-client";
import { CustomerSelect } from "../components/CustomerSelect";
import { getCurrencyPrecision } from "../components/CurrencySelect";
import { AccountSelect } from "../components/AccountSelect";
import { useEffect } from "react";

type LineItemFormValues = {
  description: string;
  netAmount: number;
  vatAmount: number;
  nominalAccount: Account;
};

type InstantSaleFormValues = {
  customer: Customer;
  receiptAccount: Account;
  exchangeRate: number;
  paymentDate: Date;
  lineItems: LineItemFormValues[];
  totalNominalAmount: number
};

const emptyLineItemRow: LineItemFormValues = {
  description: "",
  netAmount: 0,
  vatAmount: 0,
  nominalAccount: {
    accountId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: '',
    denomination: '',
    number: 0,
    category: '',
    type: '',
    accountSubTypeId: ''
  },
};

const LineItemsInput: React.FC<{
  fields: LineItemFormValues[];
  append: UseFieldArrayAppend<InstantSaleFormValues, "lineItems">;
  denomination: string | null;
  remove: UseFieldArrayRemove;
}> = ({ fields, append, remove, denomination }) => {
  const { control, watch } = useFormContext<InstantSaleFormValues>();

  const columnHelper = createColumnHelper<LineItemFormValues>();
  const columns: ColumnDef<LineItemFormValues, any>[] = [
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ row: { index } }) => (
        <Controller
          control={control}
          name={`lineItems.${index}.description`}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput onChange={onChange} onBlur={onBlur} value={value} />
          )}
        />
      ),
    }),
    columnHelper.accessor("nominalAccount", {
      header: "Nominal Account",
      cell: ({ row: { index } }) => (
        <Controller
          control={control}
          name={`lineItems.${index}.nominalAccount`}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <AccountSelect
              onChange={onChange}
              onBlur={onBlur}
              value={value as Account}
              setting='exclude'
              types={[
                AccountType.AccountsReceivable,
                AccountType.AccountsPayable,
                AccountType.RetainedEarnings,
                AccountType.LongTermLiabilities,
                AccountType.Bank
              ]}
              error={error && "Nominal Account is required"}
            />
          )}
        />
        
      ),
    }),
    columnHelper.accessor("netAmount", {
      header: "Net Amount",
      cell: ({ row: { index } }) => (
        <Controller
          control={control}
          name={`lineItems.${index}.netAmount`}
          render={({ field: { onChange, onBlur, value } }) => (
            <NumberInput
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              precision={getCurrencyPrecision(denomination || "") || 2}
              icon={
                <Text size={10} color="gray">
                  {denomination}
                </Text>
              }
            />
          )}
        />
      ),
    }),
    columnHelper.accessor("vatAmount", {
      header: "VAT Amount",
      cell: ({ row: { index } }) => (
        <Controller
          control={control}
          name={`lineItems.${index}.vatAmount`}
          render={({ field: { onChange, onBlur, value } }) => (
            <NumberInput
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              precision={getCurrencyPrecision(denomination || "") || 2}
              icon={
                <Text size={10} color="gray">
                  {denomination}
                </Text>
              }
            />
          )}
        />
      ),
    }),
    columnHelper.display({
      id: "removeRow",
      cell: ({ row: { index } }) => (
        <>
          {index > 0 ? (
            <ActionIcon onClick={() => remove(index)}>
              <IconTrash />
            </ActionIcon>
          ) : (
            <ActionIcon onClick={() => append(emptyLineItemRow)}>
              <IconArrowsSplit2 />
            </ActionIcon>
          )}
        </>
      ),
    }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: fields,
    filterFns: {
      fuzzy: () => true,
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Stack>
      <Table>
        <thead>
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Stack>
  );
};

const ExchangeRateInput: React.FC<{
  customerDenomination: string;
  destinationDenomination: string;
}> = ({ customerDenomination, destinationDenomination }) => {
  const { control, setValue } = useFormContext<InstantSaleFormValues>();

  const totalNominalAmount = useWatch({control, name: 'totalNominalAmount'})
  const lineItems: LineItemFormValues[] = useWatch({control, name: "lineItems"});

  const totalGross = lineItems.map(li => li.netAmount + li.vatAmount).reduce((acc, n) => acc + n, 0)

  useEffect(() => {
    if (isNaN(totalGross) || isNaN(totalNominalAmount)) setValue('exchangeRate', 1) 
    else setValue('exchangeRate', totalGross / totalNominalAmount)
  }, [totalNominalAmount, totalGross, setValue])

  const precision = getCurrencyPrecision(customerDenomination);

  return (
    <Group align="flex-end">
      <Controller
        control={control}
        name="exchangeRate"
        render={({ field: { onChange, onBlur, value } }) => (
          <NumberInput
            label="Exchange Rate"
            onBlur={onBlur}
            onChange={(v) => { onChange(v); setValue('totalNominalAmount', 0)}}
            value={value}
            precision={precision || 2}
            icon={
              <Text size={10} color="gray">
                {customerDenomination}
              </Text>
            }
          />
        )}
      />
      <Text style={{ marginBottom: "8px" }} color="gray" size="sm">
        = 1.00 {destinationDenomination}
      </Text>
    </Group>
  );
};

const Totals: React.FC<{
  control: Control<InstantSaleFormValues>;
  customerDenomination: string;
  destinationDenomination: string;
}> = ({ control, customerDenomination, destinationDenomination }) => {
  const lineItems: LineItemFormValues[] = useWatch({
    control,
    name: "lineItems",
  });

  const exchangeRate: number = useWatch({
    control,
    name: "exchangeRate",
    defaultValue: 1,
  });

  const totalNet = lineItems
    .map((li) => li.netAmount)
    .reduce((acc, n) => acc + n, 0);
  const totalVat = lineItems
    .map((li) => li.vatAmount)
    .reduce((acc, n) => acc + n, 0);
  const totalGross = totalNet + totalVat;


  return (
    <table cellSpacing={8}>
      <thead>
        <tr>
          <th></th>
          <th>
            <Text size="sm">{customerDenomination}</Text>
          </th>
          <th>
            <Text size="sm">{destinationDenomination}</Text>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Text size="sm">Total Net</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {totalNet.toFixed(
                getCurrencyPrecision(
                  customerDenomination || destinationDenomination
                )!
              )}
            </Text>
          </td>
          <td align="right">
            <Text size="sm">
              {(totalNet / exchangeRate).toFixed(
                getCurrencyPrecision(destinationDenomination)!
              )}
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Text size="sm">Total VAT</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {totalVat.toFixed(
                getCurrencyPrecision(
                  customerDenomination || destinationDenomination
                )!
              )}
            </Text>
          </td>
          <td align="right">
            <Text size="sm">
              {(totalVat / exchangeRate).toFixed(
                getCurrencyPrecision(destinationDenomination)!
              )}
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Text size="sm">Total Gross</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {totalGross.toFixed(
                getCurrencyPrecision(
                  customerDenomination || destinationDenomination
                )!
              )}
            </Text>
          </td>
          <td align="right">
            <Controller
                control={control}
                name="totalNominalAmount"
                render={({field: { onChange, onBlur, value }}) => (
                <NumberInput
                  sx={(theme) => ({
                    maxWidth: '90px',
                    '.mantine-Input-input': {
                      textAlign: 'right'
                    }
                  })}
                  size="xs"
                  hideControls
                  onChange={onChange} 
                  onBlur={onBlur}
                  precision={getCurrencyPrecision(destinationDenomination)!}
                  value={value || (totalGross / exchangeRate)}/>
                )}
              />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export const InstantSaleForm: React.FC<{
  onSucessfulSave: () => void
}> = ({
  onSucessfulSave
}) => {
  const queryClient = useQueryClient()

  const { data: rootAccount, isLoading } = useQuery(
    [QueryMutationKey.ACCOUNTS_GET, AccountTypeRoot],
    () => api.accounts.get(AccountTypeRoot)
  );

  const { mutate, isLoading: isMutating } = useMutation(
    ['transactions.create'],
    async (data: InstantSaleFormValues) => {
      await api.instantSales.create(data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.TRANSACTIONS_LIST])
        onSucessfulSave()
      }
    }
  )

  const form = useForm<InstantSaleFormValues>({
    defaultValues: {
      exchangeRate: 1,
      lineItems: [{ description: "", netAmount: 0, vatAmount: 0 }],
    },
  });
  const { control, handleSubmit, watch } = form;
  const { fields, append, remove } = useFieldArray<InstantSaleFormValues>({
    control: form.control,
    name: "lineItems",
  });

  const onSubmit = (data: InstantSaleFormValues) => {
    mutate(data)
  };

  if (isLoading || !rootAccount) return <Loader />;

  const customer = watch("customer");

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

            {customer &&
              customer.denomination &&
              customer.denomination !== rootAccount.denomination && (
                <ExchangeRateInput
                  customerDenomination={customer.denomination}
                  destinationDenomination={rootAccount.denomination!}
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
                    AccountType.Bank
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
                  label="Receipt Date"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value as Date}
                />
              )}
            />
          </SimpleGrid>

          <LineItemsInput
            fields={fields}
            append={append}
            remove={remove}
            denomination={customer?.denomination || ""}
          />

          <Group position="right">
            <Totals
              control={control}
              customerDenomination={
                (customer
                  ? customer.denomination
                  : rootAccount.denomination
                  ? rootAccount.denomination
                  : "") || ""
              }
              destinationDenomination={rootAccount.denomination || ""}
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

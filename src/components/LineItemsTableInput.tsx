import { TextInput, ActionIcon, Stack, Table } from "@mantine/core";
import { Account } from "@prisma/client";
import { IconArrowsSplit2, IconTrash } from "@tabler/icons";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";;
import { useEffect, useState } from "react";
import { UseFieldArrayRemove, useFormContext, Controller, FieldArrayMethodProps, useWatch, ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form";
import { AccountType } from "@src/constants/account-taxonimies";
import { Denomination } from "@src/hooks/api-hooks";
import { AccountSelect } from "./AccountSelect";
import { getCurrencyPrecision } from "./CurrencySelect";
import { MoneyInput } from "./MoneyInput";

export type LineItemFormValues = {
  description: string;
  netAmount: Prisma.Decimal;
  vatAmount: Prisma.Decimal;
  nominalAccount: Account;
};

export const emptyLineItemRow: LineItemFormValues = {
  description: "",
  netAmount: new Prisma.Decimal(0),
  vatAmount: new Prisma.Decimal(0),
  nominalAccount: {
    accountId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: '',
    denomination: '',
    number: 0,
    category: '',
    type: '',
    accountSubTypeId: '',
    bankId: ''
  }
};


type LineItemsTableInputProps = {
  fields: LineItemFormValues[];
  append: (value: LineItemFormValues, options?: FieldArrayMethodProps) => void
  denomination: string | null;
  destinationDenomination: string,
  remove: UseFieldArrayRemove;
}



export const LineItemsTableInput: React.FC<LineItemsTableInputProps> = ({
  fields,
  append,
  denomination,
  destinationDenomination,
  remove
}) => {
  const { control, setValue, getValues } = useFormContext<{lineItems: LineItemFormValues[], exchangeRate: Prisma.Decimal}>();

  const denominationPrecision = getCurrencyPrecision(denomination)
  const destinationPrecision = getCurrencyPrecision(destinationDenomination)

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
                AccountType.Income,
                AccountType.OtherIncome,
                AccountType.RetainedEarnings,
                AccountType.LongTermLiabilities
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
          render={({ field: { onChange, onBlur, value }  }) => (
            <MoneyInput
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              denomination={{
                tick: denomination || destinationDenomination,
                decimalPlaces: getCurrencyPrecision(denomination)
              }}
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
          render={({ field: { onChange, onBlur, value }  }) => (
            <MoneyInput
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              denomination={{
                tick: denomination || destinationDenomination,
                decimalPlaces: getCurrencyPrecision(denomination)
              }}
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
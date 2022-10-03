import { Group, Loader, Table, Text } from "@mantine/core";
import { Account, Customer, Supplier, Transaction } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/router";
import { getCurrencyPrecision } from "../../src/components/CurrencySelect";
import { api, QueryMutationKey, queryMutationKey } from "../../src/utils/api-client";

type RowData = (Transaction & { account: Account | null; supplier: Supplier | null; customer: Customer | null;})

const TransactionsTable: React.FC<{
  data: RowData[];
}> = ({ data }) => {

  const columnHelper = createColumnHelper<RowData>();

  const columns: ColumnDef<RowData, any>[] = [
    columnHelper.accessor("transactionDate", {
      header: "Transaction Date",
      cell: (props) => (
        <span>{new Date(props.getValue()).toLocaleDateString()}</span>
      )
    }),
    columnHelper.accessor("description", {
      header: "Description",
    }),
    {
      accessorFn: (og) => og.account ? og.account.name : '-',
      header: "Account",
    },
    {
      accessorFn: (og) => og.supplier ? og.supplier.name : '-',
      header: "Supplier",
    },
    {
      accessorFn: (og) => og.customer ? og.customer.name : '-',
      header: "Customer",
    },
    {
      header: "Debit",
      accessorFn: (og) => `${og.debitAmount.toFixed(getCurrencyPrecision(og.denomination)!)} ${og.denomination}`
    },
    {
      header: "Credit",
      accessorFn: (og) => `${og.creditAmount.toFixed(getCurrencyPrecision(og.denomination)!)} ${og.denomination}`
    }
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: data,
    filterFns: {
      fuzzy: () => true
    },
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

function JournalEntryDetails () {

  const router = useRouter()
  const { journalEntryId } = router.query;

  const { isLoading, data } = useQuery(
    [queryMutationKey(QueryMutationKey.JOURNAL_ENTRIES_GET, journalEntryId as string)],
    () => api.journalEntries.get(journalEntryId as string),
    {
      enabled: Boolean(journalEntryId)
    }
  )

  if (isLoading || !data) return <Loader/>

  return (
    <>
      <Group position="apart">
        <h1>Journal Entry {data.journalEntryId}</h1>
      </Group>

      <TransactionsTable data={data.transactions}/>
    </>
  )
}

export default JournalEntryDetails;
import { ActionIcon, Loader, Table, Text } from "@mantine/core";
import { Supplier, Transaction } from "@prisma/client";
import { IconEye } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/router";
import { getCurrencyPrecision } from "../../src/components/CurrencySelect";
import { TransactionType } from "../../src/constants/transaction-types";
import { LedgerId } from "../../src/schemas/ledger.schema";
import { api, QueryMutationKey, queryMutationKey } from "../../src/utils/api-client";
import { formatTransactions } from "../../src/utils/format-transactions";

type RowData = {
  journalEntryId: string,
  transactionDate: Date,
  transactionType: TransactionType
  description: string,
  denomination: string,
  amount: number
}

const TransactionsTable: React.FC<{
  data: (Transaction & { supplier: Supplier | null })[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<RowData>();

  const columns: ColumnDef<RowData, any>[] = [
    columnHelper.accessor("transactionType", {
      header: "Type"
    }),
    columnHelper.accessor("transactionDate", {
      header: "Date",
      cell: (props) => (
        <span>{new Date(props.getValue()).toLocaleDateString()}</span>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
    }),
    {
      header: "Amount",
      accessorFn: (og) => `${og.amount.toFixed(getCurrencyPrecision(og.denomination)!)} ${og.denomination}`
    },
    columnHelper.display({
      id: 'journalEntry',
      cell: ({ row: { original } }) => (
        <Link passHref href={`/journal-entries/${original.journalEntryId}`}>
          <ActionIcon component="a">
            <IconEye/>
          </ActionIcon>
        </Link>
      ),
    }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: formatTransactions(data),
    filterFns: {
      fuzzy: () => true,
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

function SupplierDetail() {
  const { query } = useRouter()
  const { supplierId } = query as { supplierId: string }

  const { data: supplier, isLoading: supplierLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.SUPPLIERS_GET, supplierId)],
    () => api.suppliers.get(supplierId),
    {
      enabled: Boolean(supplierId)
    }
  )

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.TRANSACTIONS_LIST, supplierId, LedgerId.Supplier)],
    () => api.transactions.list({ledgerId: LedgerId.Supplier, supplierId}),
    {
      enabled: Boolean(supplierId)
    }
  )

  if (supplierLoading || !supplier) return <Loader/>
  if (transactionsLoading || !transactions) return <Loader/>

  return (
    <>
      <h1>Supplier: {supplier.name}</h1>
      <TransactionsTable data={transactions.data}/>
    </>
  )
}

export default SupplierDetail;
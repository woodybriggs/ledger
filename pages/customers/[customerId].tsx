import {
  ActionIcon,
  Anchor,
  Breadcrumbs,
  Loader,
  Table,
  Text,
} from "@mantine/core";
import { Customer, Transaction } from "@prisma/client";
import { IconEye } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/router";
import { getCurrencyPrecision } from "../../src/components/CurrencySelect";
import { TransactionType } from "../../src/constants/transaction-types";
import { LedgerId } from "../../src/schemas/ledger.schema";
import {
  api,
  QueryMutationKey,
  queryMutationKey,
} from "../../src/utils/api-client";
import { formatTransactions } from "../../src/utils/format-transactions";

type RowData = {
  journalEntryId: string;
  transactionDate: Date;
  transactionType: TransactionType;
  description: string;
  denomination: string;
  amount: number;
};

const TransactionsTable: React.FC<{
  data: (Transaction & { customer: Customer | null })[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<RowData>();

  const columns: ColumnDef<RowData, any>[] = [
    columnHelper.accessor("transactionType", {
      header: "Type",
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
      accessorFn: (og) =>
        `${og.amount.toFixed(getCurrencyPrecision(og.denomination)!)} ${
          og.denomination
        }`,
    },
    columnHelper.display({
      id: "journalEntry",
      cell: ({ row: { original } }) => (
        <Link passHref href={`/journal-entries/${original.journalEntryId}`}>
          <ActionIcon component="a">
            <IconEye />
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

function CustomerDetail() {
  const { query } = useRouter();
  const { customerId } = query as { customerId: string };

  const { data: customer, isLoading: customerLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.SUPPLIERS_GET, customerId)],
    () => api.customers.get(customerId),
    {
      enabled: Boolean(customerId),
    }
  );

  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    [
      queryMutationKey(
        QueryMutationKey.TRANSACTIONS_LIST,
        customerId,
        LedgerId.Customer
      ),
    ],
    () => api.transactions.list({ ledgerId: LedgerId.Customer, customerId }),
    {
      enabled: Boolean(customerId),
    }
  );

  if (customerLoading || !customer) return <Loader />;
  if (transactionsLoading || !transactions) return <Loader />;

  return (
    <>
      <Breadcrumbs>
        {[{ title: "Customers", href: "." }].map((item, index) => (
          <Anchor href={item.href} key={index}>
            {item.title}
          </Anchor>
        ))}
      </Breadcrumbs>
      <h1>Customer: {customer.name}</h1>
      <TransactionsTable data={transactions.data} />
    </>
  );
}

export default CustomerDetail;

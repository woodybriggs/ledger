import { Anchor, Breadcrumbs, Button, Loader, Modal, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import {
  api,
  QueryMutationKey,
  queryMutationKey,
} from "@src/utils/api-client";
import { SaleRecordDto, SaleRecordType } from "@src/schemas/sale-record.schema";
import { PurchaseRecordStatus } from "@src/constants/purchase-invoice-status";
import { useState } from "react";
import { SaleForm } from "@src/forms/Sale.form";

const RowActionCell = ({ saleRecord }: { saleRecord: SaleRecordDto }) => {

  const [opened, setOpened] = useState(false)

  switch(saleRecord.status) {
    case PurchaseRecordStatus.PartiallyPaid:
    case PurchaseRecordStatus.Outstanding: return (
      <>
        <Button onClick={() => setOpened(true)}>Pay</Button>
        <Modal
          title="Sales Invoice Payment"
          opened={opened}
          onClose={() => setOpened(false)}
          size="auto"
        >
          <SaleForm 
            formType={SaleRecordType.SalesInvoicePayment} 
            onSuccessfulSubmission={() => setOpened(false)}
            saleInvoiceId={saleRecord.saleRecordId}
          />
        </Modal>
      </>
      
    )
    default: return <></>
  }
}

const TransactionsTable: React.FC<{
  data: SaleRecordDto[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<SaleRecordDto>();

  const columns: ColumnDef<SaleRecordDto, any>[] = [
    columnHelper.accessor("transactionType", {
      header: "Type"
    }),
    columnHelper.accessor("transactionDate", {
      header: "Date",
      cell: (props) => (
        <span>{new Date(props.getValue()).toLocaleDateString()}</span>
      ),
    }),
    columnHelper.accessor("reference", {
      header: "Ref.",
    }),
    {
      header: "Amount",
      accessorFn: (og) => `${og.grossAmount}`
    },
    columnHelper.accessor("status", {
      header: "Status"
    }),
    {
      id: 'actions',
      cell: ({row: { original }}) => <RowActionCell saleRecord={original}/>
    }
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: data,
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

  const { data: saleRecords, isLoading: saleRecordsLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.PURCHASE_RECORDS_LIST, customerId)],
    () => api.saleRecords.list({ customerId }),
    {
      enabled: Boolean(customerId)
    }
  )

  if (customerLoading || !customer) return <Loader />;
  if (saleRecordsLoading || !saleRecords) return <Loader />;

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
      <TransactionsTable data={saleRecords.data} />
    </>
  );
}

export default CustomerDetail;

import { Button, Loader, Modal, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { useState } from "react";
import { PurchaseRecordStatus } from "@src/constants/purchase-invoice-status";
import { TransactionType } from "@src/constants/transaction-types";
import { PurchaseForm } from "@src/forms/Purchase.form";
import { api, QueryMutationKey, queryMutationKey } from "@src/utils/api-client";
import { PurchaseRecordDto } from "@src/schemas/purchase-record.schema";


const RowActionCell = ({ purchaseRecord }: { purchaseRecord: PurchaseRecordDto }) => {

  const [opened, setOpened] = useState(false)

  switch(purchaseRecord.status) {
    case PurchaseRecordStatus.PartiallyPaid:
    case PurchaseRecordStatus.Outstanding: return (
      <>
        <Button onClick={() => setOpened(true)}>Pay</Button>
        <Modal
          title="Purchase Invoice Payment"
          opened={opened}
          onClose={() => setOpened(false)}
          size="auto"
        >
          <PurchaseForm 
            formType={TransactionType.PurchaseInvoicePayment} 
            onSuccessfulSubmission={() => setOpened(false)}
            purchaseInvoiceId={purchaseRecord.purchaseRecordId}
          />
        </Modal>
      </>
      
    )
    default: return <></>
  }
}

const TransactionsTable: React.FC<{
  data: PurchaseRecordDto[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<PurchaseRecordDto>();

  const columns: ColumnDef<PurchaseRecordDto, any>[] = [
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
      cell: ({row: { original }}) => <RowActionCell purchaseRecord={original}/>
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

  const { data: purchaseRecords, isLoading: purchaseRecordsLoading } = useQuery(
    [queryMutationKey(QueryMutationKey.PURCHASE_RECORDS_LIST, supplierId)],
    () => api.purchaseRecords.list({ supplierId }),
    {
      enabled: Boolean(supplierId)
    }
  )

  if (supplierLoading || !supplier) return <Loader/>
  if (purchaseRecordsLoading || !purchaseRecords) return <Loader/>

  return (
    <>
      <h1>Supplier: {supplier.name}</h1>
      <TransactionsTable data={purchaseRecords.data}/>
    </>
  )
}

export default SupplierDetail;
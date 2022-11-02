import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Menu,
  Modal,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { api, QueryMutationKey } from "@src/utils/api-client";

import { IconDots, IconPlus } from "@tabler/icons";
import { DebouncedSearchInput } from "@src/components/DebouncedSearchInput";

import { rankItem } from "@tanstack/match-sorter-utils";
import { SupplierForm } from "@src/forms/Supplier.form";
import { AddressDto, AddressType } from "@src/schemas/address.schema";
import { PurchaseForm } from "@src/forms/Purchase.form";
import { TransactionType } from "@src/constants/transaction-types";
import { SupplierDto } from "@src/schemas/supplier.schema";
import { AddressModel } from "@src/models/Address.model";

const composeAddress = (address: AddressDto | null): string => {
  if (address === null) return "";

  const { addressId, createdAt, updatedAt, ...rest } = address;
  return Object.values(rest).filter(Boolean).join(", ");
};

const SupplierActionsMenu: React.FC<{
  supplier: SupplierDto;
}> = ({ supplier }) => {
  const [editSupplierModalOpen, setEditSupplierModalOpen] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Target>
          <ActionIcon variant="light">
            <IconDots />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>
          <Menu.Item onClick={() => setEditSupplierModalOpen(true)}>
            Edit Supplier
          </Menu.Item>
          <Menu.Item>Add Invoice</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        title="Edit Supplier"
        opened={editSupplierModalOpen}
        onClose={() => setEditSupplierModalOpen(false)}
      >
        <SupplierForm
          mode="edit"
          onSuccessfulSave={() => setEditSupplierModalOpen(false)}
          supplier={supplier}
          defaultValues={{
            supplier: {
              ...supplier,
              defaultNominalAccount: supplier.defaultNominalAccount!
            },
            shippingAddressSameAsBilling: false,
            billingAddress: supplier.billingAddress && {
              ...supplier.billingAddress,
              addressType: AddressType.Billing,
            },
            shippingAddress: supplier.shippingAddress && {
              ...supplier.shippingAddress,
              addressType: AddressType.Shipping,
            },
          }}
        />
      </Modal>
    </>
  );
};


const fuzzyFilter: FilterFn<SupplierDto> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const SupplierTable: React.FC<{
  suppliers: SupplierDto[];
}> = ({ suppliers }) => {
  const columnHelper = createColumnHelper<SupplierDto>();

  const columns: ColumnDef<SupplierDto, any>[] = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({
        row: {
          original: { supplierId, name },
        },
      }) => (
        <Link href={`/app/suppliers/${supplierId}`}>
          <Text variant="link"> {name} </Text>
        </Link>
      ),
    }),
    columnHelper.accessor("denomination", {
      header: "Denomination",
    }),
    columnHelper.accessor("defaultNominalAccount", {
      header: "Default Nominal Account",
      cell: ({
        row: {
          original: { defaultNominalAccount },
        },
      }) => (
        <>
          {defaultNominalAccount ? (
            <Link href={`/app/accounts/${defaultNominalAccount?.accountId}`}>
              <Text variant="link">
                {defaultNominalAccount?.number} - {defaultNominalAccount?.name}
              </Text>
            </Link>
          ) : (
            "-"
          )}
        </>
      ),
    }),
    columnHelper.accessor("billingAddress", {
      header: "Billing Address",
      cell: (context) => (
        <span>{new AddressModel(context.row.original.billingAddress).toString()}</span>
      ),
    }),
    columnHelper.accessor("shippingAddress", {
      header: "Shipping Address",
      cell: (context) => (
        <span>{new AddressModel(context.row.original.shippingAddress).toString()}</span>
      ),
    }),
    columnHelper.display({
      header: "Actions",
      cell: ({ row: { original } }) => (
        <SupplierActionsMenu supplier={original} />
      ),
    }),
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const { getRowModel, getHeaderGroups } = useReactTable<SupplierDto>({
    data: suppliers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
    globalFilterFn: fuzzyFilter,
  });

  return (
    <Stack>
      <DebouncedSearchInput
        onChange={(value) => setSearchTerm(value)}
        value={searchTerm}
        debounce={100}
      />
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
    </Stack>
  );
};

function Suppliers() {
  const [createSupplierModalOpen, setCreateSupplierModalOpen] = useState(false);
  const [createInstantExpenseFormOpen, setCreateInstantExpenseFormOpen] =
    useState(false);
  const [createPurchaseInvoiceFormOpen, setCreatePurchaseInvoiceFormOpen] =
    useState(false);

  const { data, isLoading } = useQuery([QueryMutationKey.SUPPLIERS_LIST], () =>
    api.suppliers.list()
  );

  if (isLoading || !data) return <Loader />;

  return (
    <>
      <Group position="apart">
        <h1>Suppliers</h1>
        <Group position="right">
          <Button
            onClick={() => setCreateSupplierModalOpen(true)}
            variant="outline"
          >
            Create Supplier
          </Button>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <Button leftIcon={<IconPlus />} variant="light">
                New Transaction
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setCreateInstantExpenseFormOpen(true)}>
                Instant Expense
              </Menu.Item>
              <Menu.Item onClick={() => setCreatePurchaseInvoiceFormOpen(true)}>
                Purchase Invoice
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {data && <SupplierTable suppliers={data.data} />}

      <Modal
        title="Create Supplier"
        opened={createSupplierModalOpen}
        onClose={() => setCreateSupplierModalOpen(false)}
      >
        <SupplierForm
          mode="create"
          onSuccessfulSave={() => setCreateSupplierModalOpen(false)}
        />
      </Modal>

      <Modal
        title="Instant Expense"
        opened={createInstantExpenseFormOpen}
        onClose={() => setCreateInstantExpenseFormOpen(false)}
        size="auto"
        closeOnClickOutside={false}
      >
        <PurchaseForm
          formType={TransactionType.InstantExpense}
          onSuccessfulSubmission={() => setCreateInstantExpenseFormOpen(false)}
        />
      </Modal>

      <Modal
        title="Purchase Invoice"
        opened={createPurchaseInvoiceFormOpen}
        onClose={() => setCreatePurchaseInvoiceFormOpen(false)}
        size="auto"
        closeOnClickOutside={false}
      >
        <PurchaseForm
          formType={TransactionType.PurchaseInvoice}
          onSuccessfulSubmission={() => setCreatePurchaseInvoiceFormOpen(false)}
        />
      </Modal>
    </>
  );
}

export default Suppliers;

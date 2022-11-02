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
import { CustomerForm } from "@src/forms/Customer.form";
import { AddressDto, AddressType } from "@src/schemas/address.schema";
import { SaleForm } from "@src/forms/Sale.form";
import { CustomerDto } from "@src/schemas/customer.schema";
import { SaleRecordType } from "@src/schemas/sale-record.schema";

const composeAddress = (address: AddressDto | null): string => {
  if (address === null) return "";

  const { addressId, createdAt, updatedAt, ...rest } = address;
  return Object.values(rest).filter(Boolean).join(", ");
};

const CustomerActionsMenu: React.FC<{
  customer: CustomerDto
}> = ({
  customer
}) => {

  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false)

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
          <Menu.Item onClick={() => setEditCustomerModalOpen(true)}>Edit Customer</Menu.Item>
          <Menu.Item>Add Invoice</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        title="Edit Supplier"
        opened={editCustomerModalOpen}
        onClose={() => setEditCustomerModalOpen(false)}
      >
        <CustomerForm
          mode="edit"
          onSuccessfulSave={() => setEditCustomerModalOpen(false)}
          customer={customer}
          defaultValues={{
            customer: {
              ...customer,
              defaultNominalAccount: customer.defaultNominalAccount!
            },
            shippingAddressSameAsBilling: false,
            billingAddress: customer.billingAddress && {
              ...customer.billingAddress,
              addressType: AddressType.Billing,
            },
            shippingAddress: customer.shippingAddress && {
              ...customer.shippingAddress,
              addressType: AddressType.Shipping,
            },
          }}
        />
      </Modal>
    </>
  );
};

const fuzzyFilter: FilterFn<CustomerDto> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const CustomerTable: React.FC<{
  customers: CustomerDto[];
}> = ({ customers }) => {
  const columnHelper = createColumnHelper<CustomerDto>();

  const columns: ColumnDef<CustomerDto, any>[] = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({
        row: {
          original: { customerId, name },
        },
      }) => (
        <Link href={`/customers/${customerId}`}>
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
        <Link href={`/app/accounts/${defaultNominalAccount?.accountId}`}>
          <Text variant="link">
            {defaultNominalAccount?.number} - {defaultNominalAccount?.name}
          </Text>
        </Link>
      ),
    }),
    columnHelper.accessor("billingAddress", {
      header: "Billing Address",
      cell: (context) => (
        <span>{composeAddress(context.row.original.billingAddress!)}</span>
      ),
    }),
    columnHelper.accessor("shippingAddress", {
      header: "Shipping Address",
      cell: (context) => (
        <span>{composeAddress(context.row.original.shippingAddress!)}</span>
      ),
    }),
    columnHelper.display({
      header: "Actions",
      cell: ({ row: { original } }) => <CustomerActionsMenu customer={original}/>,
    }),
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const { getRowModel, getHeaderGroups } = useReactTable<CustomerDto>({
    data: customers,
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

function Customers() {
  const [createCustomerModalOpen, setCreateCustomerModalOpen] = useState(false);
  const [createInstantSaleFormOpen, setCreateInstantSaleFormOpen] =
    useState(false);
  const [createSalesInvoiceFormOpen, setCreateSalesInvoiceFormOpen] =
    useState(false);

  const { data, isLoading } = useQuery([QueryMutationKey.SUPPLIERS_LIST], () =>
    api.customers.list()
  );

  if (isLoading || !data) return <Loader />;

  return (
    <>
      <Group position="apart">
        <h1>Customers</h1>
        <Group position="right">
          <Button
            onClick={() => setCreateCustomerModalOpen(true)}
            variant="outline"
          >
            Create Customer
          </Button>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <Button leftIcon={<IconPlus />} variant="light">
                New Transaction
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setCreateInstantSaleFormOpen(true)}>
                Instant Sale
              </Menu.Item>
              <Menu.Item onClick={() => setCreateSalesInvoiceFormOpen(true)}>
                Sales Invoice
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {data && <CustomerTable customers={data.data} />}

      <Modal
        title="Create Customer"
        opened={createCustomerModalOpen}
        onClose={() => setCreateCustomerModalOpen(false)}
      >
        <CustomerForm
          mode="create"
          onSuccessfulSave={() => setCreateCustomerModalOpen(false)}
        />
      </Modal>

      <Modal
        title="Instant Sale"
        opened={createInstantSaleFormOpen}
        onClose={() => setCreateInstantSaleFormOpen(false)}
        size="auto"
        closeOnClickOutside={false}
      >
        <SaleForm
          formType={SaleRecordType.InstantSale}
          onSuccessfulSubmission={() => setCreateInstantSaleFormOpen(false)}
        />
      </Modal>

      <Modal
        title="Sales Invoice"
        opened={createSalesInvoiceFormOpen}
        onClose={() => setCreateSalesInvoiceFormOpen(false)}
        size="auto"
        closeOnClickOutside={false}
      >
        <SaleForm
          formType={SaleRecordType.SalesInvoice}
          onSuccessfulSubmission={() => setCreateSalesInvoiceFormOpen(false)}
        />
      </Modal>
    </>
  );
}

export default Customers;

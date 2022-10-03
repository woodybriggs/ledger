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
import { Address } from "@prisma/client";
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
import { api, QueryMutationKey } from "../../src/utils/api-client";
import { SupplierDto } from "../api/suppliers";

import { IconDots } from '@tabler/icons'
import { DebouncedSearchInput } from "../../src/components/DebouncedSearchInput";

import {
  RankingInfo,
  rankItem,
} from '@tanstack/match-sorter-utils'
import { SupplierForm } from "../../src/forms/Supplier.form";
import { AddressType } from "../../src/schemas/address.schema";


const composeAddress = (address: Address | null): string => {
  if (address === null) return "";

  const { addressId, createdAt, updatedAt, ...rest } = address;
  return Object.values(rest).filter(Boolean).join(", ");
};

const SupplierActionsMenu: React.FC<{
  supplier: SupplierDto
}> = ({
  supplier
}) => {

  const [editSupplierModalOpen, setEditSupplierModalOpen] = useState(false)

  return (
    <>
      <Menu>
        <Menu.Target>
          <ActionIcon variant="light"><IconDots/></ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label >Actions</Menu.Label>
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
            supplier: supplier,
            shippingAddressSameAsBilling: false,
            billingAddress: supplier.billingAddress && { ...supplier.billingAddress, addressType: AddressType.Billing },
            shippingAddress: supplier.shippingAddress && { ...supplier.shippingAddress, addressType: AddressType.Shipping },
          }}
        />
      </Modal>
    </>
  )
}



declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}


const fuzzyFilter: FilterFn<SupplierDto> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank,
  })

  return itemRank.passed
}


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
        <Link href={`/suppliers/${supplierId}`} passHref>
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
        <Link href={`/accounts/${defaultNominalAccount.accountId}`}>
          <Text variant="link">
            {defaultNominalAccount.number} - {defaultNominalAccount.name}
          </Text>
        </Link>
      ),
    }),
    columnHelper.accessor("billingAddress", {
      header: "Billing Address",
      cell: (context) => (
        <span>{composeAddress(context.row.original.billingAddress)}</span>
      ),
    }),
    columnHelper.accessor("shippingAddress", {
      header: "Shipping Address",
      cell: (context) => (
        <span>{composeAddress(context.row.original.shippingAddress)}</span>
      ),
    }),
    columnHelper.display({
      header: "Actions",
      cell: ({row: { original }}) => <SupplierActionsMenu supplier={original}/>
    })
  ];
  
  const [searchTerm, setSearchTerm] = useState('')
  
  const { getRowModel, getHeaderGroups } = useReactTable<SupplierDto>({
    data: suppliers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter
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

  const { data, isLoading } = useQuery([QueryMutationKey.SUPPLIERS_LIST], () =>
    api.suppliers.list()
  );

  if (isLoading || !data) return <Loader />;

  return (
    <>
      <Group position="apart">
        <h1>Suppliers</h1>
        <Button onClick={() => setCreateSupplierModalOpen(true)}>
          Create Supplier
        </Button>
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
      </Group>

      {data && <SupplierTable suppliers={data.data} />}
    </>
  );
}

export default Suppliers;

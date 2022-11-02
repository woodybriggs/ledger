import {
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Overlay,
  Stack,
  TextInput,
  Text,
  Table
} from "@mantine/core";
import { Account, Transaction } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { CurrencySelect } from "@src/components/CurrencySelect";
import { AccountDto, UpdateAccountSchema } from "@src/schemas/account.schema";
import { api, queryMutationKey, QueryMutationKey } from "@src/utils/api-client";
import { TransactionDto } from "@src/schemas/transaction.schema";

type EditAccountFormValues = z.infer<typeof UpdateAccountSchema>;

const EditAccountForm: React.FC<{
  account: AccountDto;
  onSucessfulSave: () => void
}> = ({ account, onSucessfulSave }) => {

  const queryClient = useQueryClient()

  const { mutate, isLoading } = useMutation(
    [QueryMutationKey.ACCOUNTS_UPDATE],
    (data: EditAccountFormValues) =>
      api.accounts.update(account.accountId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryMutationKey(QueryMutationKey.ACCOUNTS_GET, account.accountId), QueryMutationKey.ACCOUNTS_LIST])
        onSucessfulSave()
      }
    }
  );

  const form = useForm<EditAccountFormValues>({
    defaultValues: {
      name: account.name,
      denomination: account.denomination,
      number: account.number,
    },
  });
  const { control, handleSubmit } = form;

  const onSubmit = (data: EditAccountFormValues) => {
    mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        { isLoading && <Overlay/>}
        <Stack>
          <Controller
            rules={{ required: true }}
            control={control}
            name="name"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextInput
                withAsterisk
                label="Name"
                placeholder="Director Loan"
                onChange={onChange}
                onBlur={onBlur}
                value={value !== null ? value : ""}
                error={error && "Name is required"}
              />
            )}
          />

          <Controller
            rules={{ required: true }}
            control={control}
            name="number"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <NumberInput
                withAsterisk
                label="Number"
                placeholder="10000"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                error={error && "Number is requried"}
              />
            )}
          />

          <Controller
            control={control}
            name="denomination"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <CurrencySelect
                label="Denomination"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </FormProvider>
  );
};

const TransactionsTable: React.FC<{
  data: TransactionDto[];
}> = ({ data }) => {

  const columnHelper = createColumnHelper<TransactionDto>();

  const columns = [
    columnHelper.accessor("journalEntryId", {
      header: "Journal Entry",
      cell: (props) => (
        <Link href={`/journal-entries/${props.getValue()}`}>
          <Text variant="link">Entry</Text>
        </Link>
      ),
    }),
    columnHelper.accessor("transactionDate", {
      header: "Transaction Date",
      cell: (props) => (
        <span>{new Date(props.getValue()).toLocaleDateString()}</span>
      )
    }),
    columnHelper.accessor("debitAmount", {
      header: "Debit",
    }),
    columnHelper.accessor("creditAmount", {
      header: "Credit",
    }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: data,
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

function AccountDetail() {
  const router = useRouter();
  const { accountId } = router.query;

  const { isLoading: accountIsLoading, data: account } = useQuery(
    [queryMutationKey(QueryMutationKey.ACCOUNTS_GET, accountId as string)],
    () => api.accounts.get(accountId as string),
    {
      enabled: Boolean(accountId),
    }
  );

  const { isLoading: transactionsIsLoading, data: transactions } = useQuery(
    [queryMutationKey(QueryMutationKey.TRANSACTIONS_LIST, accountId as string)],
    () => api.transactions.list({accountId: accountId as string}),
    {
      enabled: Boolean(accountId)
    }
  )

  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!account || accountIsLoading) return <Loader />;
  if (!transactions || transactionsIsLoading) return <Loader />;

  const { name } = account;

  return (
    <>
      <Group position="apart">
        <h1>{name}</h1>
        <Button onClick={() => setEditModalOpen(true)}>Edit</Button>
      </Group>
      <Modal
        opened={editModalOpen}
        title={`Edit ${account.name}`}
        onClose={() => setEditModalOpen(false)}
      >
        <EditAccountForm account={account} onSucessfulSave={() => setEditModalOpen(false)}/>
      </Modal>

      <TransactionsTable data={transactions.data}/>
    </>
  );
}

export default AccountDetail;

import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  TextInput,
  Text,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { Account, Transaction } from "@prisma/client";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import Head from "next/head";
import { useState, useMemo, useEffect } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api, QueryMutationKey } from "../../src/utils/api-client";
import { CreateTransactionDto } from "../../src/schemas/transaction.schema";
import { InstantExpenseForm } from "../../src/forms/InstantExpense.form";
import { LedgerId } from "../../src/schemas/ledger.schema";
import { getCurrencyPrecision } from "../../src/components/CurrencySelect";
import { TransactionType } from "../../src/constants/transaction-types";
import { InstantSaleForm } from "../../src/forms/InstantSale.form";


const DescriptionField: React.FC<{
  index: number;
}> = ({ index }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      rules={{ required: true }}
      name={`transactions.${index}.description`}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextInput
          withAsterisk
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          error={error && `Description is required`}
        />
      )}
    />
  );
};

const TransactionDateCell: React.FC<{
  index: number;
}> = ({ index }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      rules={{ required: true }}
      name={`transactions.${index}.transactionDate`}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <DatePicker
          allowFreeInput
          inputFormat="YYYY-MM-DD"
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          withinPortal
          error={error && "Transaction date is required"}
        />
      )}
    />
  );
};

const AccountSelectCell: React.FC<{
  index: number;
}> = ({ index }) => {
  const { control } = useFormContext();

  const { isLoading, data } = useQuery<{ data: Account[] }>(
    [QueryMutationKey.ACCOUNTS_LIST],
    () => api.accounts.list()
  );

  if (isLoading || !data) return <Loader />;

  return (
    <Controller
      control={control}
      rules={{ required: true }}
      name={`transactions.${index}.account`}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Select
          data={data.data.map((a) => ({
            value: a.accountId,
            label: a.name,
          }))}
          onChange={(item) => {
            const account = data.data.find((a) => a.accountId === item);
            onChange(account);
          }}
          onBlur={onBlur}
          value={value.accountId}
          error={error && "Account is required"}
        ></Select>
      )}
    />
  );
};

const DebitCell: React.FC<{
  index: number;
}> = ({ index }) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={`transactions.${index}.debitAmount`}
      render={({ field: { onChange, onBlur, value }, formState }) => (
        <NumberInput
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          precision={2}
        />
      )}
    />
  );
};

const CreditCell: React.FC<{
  index: number;
}> = ({ index }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={`transactions.${index}.creditAmount`}
      render={({ field: { onChange, onBlur, value }, formState }) => (
        <NumberInput
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          precision={2}
        />
      )}
    />
  );
};

type TransactionFormValue = {
  transactionDate: Date | string;
  description: string;
  account: Account;
  debitAmount: number;
  creditAmount: number;
};

type ExchangeRateFormValue = {
  from: string;
  to: string;
  rate: number;
};

type EntryFormValues = {
  transactions: TransactionFormValue[];
  exchangeRates: ExchangeRateFormValue[];
};

const emptyRow: TransactionFormValue = {
  transactionDate: new Date(),
  description: "",
  account: {
    accountId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    number: 0,
    name: "",
    denomination: "",
    accountSubTypeId: "",
    type: "",
    category: "",
  },
  debitAmount: 0,
  creditAmount: 0,
};

const CreateEntryForm: React.FC<{
  onSuccessfulSave: () => void;
}> = ({ onSuccessfulSave }) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    ["journal-entries.create"],
    async (transactions: TransactionFormValue[]) => {
      const ts: CreateTransactionDto[] = transactions.map((t) => ({
        ...t,
        accountId: t.account.accountId,
        ledgerId: LedgerId.Nominal,
        customerId: null,
        supplierId: null,
        transactionDate: t.transactionDate as Date,
        transactionType: TransactionType.Journal
      }));
      await api.journalEntries.create(ts);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["journal-entries.list"]);
        onSuccessfulSave();
      },
    }
  );

  const form = useForm<EntryFormValues>({
    defaultValues: {
      transactions: [emptyRow, emptyRow],
      exchangeRates: [],
    },
  });

  const [alertMessage, setAlertMessage] = useState<string | undefined>(
    undefined
  );

  const { control, handleSubmit } = form;

  const {
    fields: transactionFields,
    append: appendEmptyTransactionField,
    remove: removeTransactionField,
  } = useFieldArray({
    control,
    name: "transactions",
  });

  const columnHelper = createColumnHelper<TransactionFormValue>();

  const columns: ColumnDef<TransactionFormValue, any>[] = [
    columnHelper.accessor("transactionDate", {
      header: "Transaction Date",
      cell: ({ row: { index } }) => <TransactionDateCell index={index} />,
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ row: { index } }) => <DescriptionField index={index} />,
    }),
    columnHelper.accessor("account", {
      header: "Account",
      cell: ({ row: { index } }) => <AccountSelectCell index={index} />,
    }),
    columnHelper.accessor("debitAmount", {
      header: "Debit",
      cell: ({ row: { index } }) => <DebitCell index={index} />,
    }),
    columnHelper.accessor("creditAmount", {
      header: "Credit",
      cell: ({ row: { index } }) => <CreditCell index={index} />,
    }),
    columnHelper.accessor(() => {}, {
      header: "Action",
      cell: ({ row: { index } }) => (
        <Button variant="subtle" onClick={() => removeTransactionField(index)}>
          Remove
        </Button>
      ),
    }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    data: transactionFields,
    filterFns: {
      fuzzy: () => true,
    },
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onSubmit = ({
    transactions,
  }: {
    transactions: TransactionFormValue[];
  }) => {
    setAlertMessage(undefined);

    const totalCredits = transactions
      .map((t) => t.creditAmount)
      .reduce((total, next) => total + next, 0);
    const totalDebits = transactions
      .map((t) => t.debitAmount)
      .reduce((total, next) => total + next, 0);

    if (totalCredits - totalDebits !== 0)
      setAlertMessage(
        `Total debits and Credits do not sum to 0: inbalance of ${
          totalCredits - totalDebits
        }`
      );

    mutate(transactions);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          {alertMessage && (
            <Alert title="Double entry violation" color={"red"}>
              {alertMessage}
            </Alert>
          )}
          <Group position="apart">
            <Button
              variant="outline"
              onClick={() => appendEmptyTransactionField(emptyRow)}
            >
              Add Row
            </Button>
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    </FormProvider>
  );
};

const TransactionsTable: React.FC<{
  data: (Transaction & { account: Account })[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<Transaction & { account: Account }>();

  const columns: ColumnDef<Transaction & { account: Account }, any>[] = [
    columnHelper.accessor("journalEntryId", {
      header: "Journal Entry",
      cell: (props) => (
        <Link passHref href={`/journal-entries/${props.getValue()}`}>
          <a>
            <Text variant="link">Entry</Text>
          </a>
        </Link>
      ),
    }),
    columnHelper.accessor("transactionDate", {
      header: "Transaction Date",
      cell: (props) => (
        <span>{new Date(props.getValue()).toLocaleDateString()}</span>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
    }),
    columnHelper.accessor("account.name", {
      header: "Account",
    }),
    {
      accessorFn: (og) => og.debitAmount.toFixed(getCurrencyPrecision(og.denomination)!),
      header: "Debit",
    },
    {
      accessorFn: (og) => og.creditAmount.toFixed(getCurrencyPrecision(og.denomination)!),
      header: "Credit",
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

function Transactions() {
  const [modalOpen, setModalOpen] = useState(false);

  const [instantExpenseModalOpen, setInstantExpenseModalOpen] = useState(false);
  const [instantSaleModalOpen, setInstantSaleModalOpen] = useState(false);

  const { isLoading, data } = useQuery(
    [QueryMutationKey.TRANSACTIONS_LIST],
    () => api.transactions.list({ ledgerId: LedgerId.Nominal })
  );

  if (isLoading || !data) return <Loader />;

  return (
    <>
      <Head>
        <title>Transactions | Ledger</title>
      </Head>
      <Group position="apart">
        <h1>Transactions</h1>
        <Group>
          <Button onClick={() => setInstantExpenseModalOpen(true)}>
            Add Instant Expense
          </Button>
          <Button onClick={() => setInstantSaleModalOpen(true)}>
            Add Instant Sales Reciept
          </Button>
          <Button onClick={() => setModalOpen(true)} variant="outline">
            Add Entry
          </Button>
        </Group>
      </Group>
      <TransactionsTable data={data.data} />

      <Modal
        title="Add Entry"
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        size="70%"
      >
        <CreateEntryForm onSuccessfulSave={() => {}} />
      </Modal>

      <Modal
        title="Instant Expense"
        opened={instantExpenseModalOpen}
        closeOnClickOutside={false}
        onClose={() => setInstantExpenseModalOpen(false)}
        size="auto"
      >
        <InstantExpenseForm onSucessfulSave={() => setInstantExpenseModalOpen(false)}/>
      </Modal>

      <Modal
        title="Instant Sales Receipt"
        opened={instantSaleModalOpen}
        closeOnClickOutside={false}
        onClose={() => setInstantSaleModalOpen(false)}
        size="auto"
      >
        <InstantSaleForm onSucessfulSave={() => setInstantSaleModalOpen(false)}/>
      </Modal>
    </>
  );
}

export default Transactions;

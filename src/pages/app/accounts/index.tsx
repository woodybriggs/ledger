import Head from "next/head";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Overlay,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  UseFormWatch,
  useWatch,
} from "react-hook-form";
import { AccountDto, CreateAccountDto } from "@src/schemas/account.schema";
import Link from "next/link";
import { api, QueryMutationKey } from "@src/utils/api-client";
import { CreateAccountSubTypeDto } from "@src/schemas/account-subtype.schema";
import { CurrencySelect } from "@src/components/CurrencySelect";
import {
  AccountType,
  AccountTypeCategoryMap,
} from "@src/constants/account-taxonimies";
import { AccountTypeSelect } from "@src/components/AccountTypeSelect";
import { AccountSelect } from "@src/components/AccountSelect";
import { Account } from "@prisma/client";

const CreateAccountSubTypeForm: React.FC<{
  onSuccesfulSave: () => void;
}> = ({ onSuccesfulSave }) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(
    [QueryMutationKey.ACCOUNT_SUBTYPES_CREATE],
    (data: CreateAccountSubTypeDto) => api.accountSubTypes.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.ACCOUNT_SUBTYPES_LIST]);
        onSuccesfulSave();
      },
    }
  );

  const { control, handleSubmit } = useForm<CreateAccountSubTypeDto>();

  const onSubmit = (data: CreateAccountSubTypeDto) => {
    data.category = AccountTypeCategoryMap.get(data.type as AccountType);
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Controller
          rules={{ required: true }}
          control={control}
          name="type"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <AccountTypeSelect
              label="Type"
              withAsterisk
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={error && "Type is required"}
              setting="exclude"
              types={[
                AccountType.AccountsReceivable,
                AccountType.AccountsPayable,
              ]}
            />
          )}
        />
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
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={error && "Name is required"}
            />
          )}
        />

        <Button type="submit">Create</Button>
      </Stack>
    </form>
  );
};

const AccountTypeInput: React.FC<{
  control: Control<CreateAccountFormValues>;
}> = ({ control }) => {
  const [hasParent, setHasParent] = useState(false);
  const { setValue } = useFormContext<CreateAccountFormValues>();
  const parentAccount = useWatch({ control, name: "parentAccount" });

  useEffect(() => {
    if (parentAccount) {
      setValue("type", parentAccount.type as AccountType);
      setHasParent(true);
    } else {
      setHasParent(false);
    }
  }, [parentAccount, setValue]);

  return (
    <Controller
      rules={{ required: true }}
      control={control}
      name="type"
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <AccountTypeSelect
          label="Account Type"
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          error={error && "Account type is requried"}
          disabled={hasParent}
          setting="exclude"
          types={[AccountType.AccountsPayable, AccountType.AccountsReceivable]}
        />
      )}
    />
  );
};

const AccountSubTypeInput: React.FC<{
  control: Control<CreateAccountFormValues>;
  watch: UseFormWatch<CreateAccountFormValues>;
}> = ({ control, watch }) => {
  const type = watch("type");

  const { isLoading, data } = useQuery(
    [QueryMutationKey.ACCOUNT_SUBTYPES_LIST, type],
    () => api.accountSubTypes.list({ accountType: type as AccountType })
  );

  return (
    <>
      {!isLoading && data && (
        <Controller
          control={control}
          name="accountSubTypeId"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Select
              label="Account Sub Type"
              data={data?.data.map((s) => ({
                label: s.name,
                value: s.accountSubTypeId,
              }))}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      )}
    </>
  );
};

type CreateAccountFormValues = {
  parentAccount: Account | undefined;
} & CreateAccountDto;

const CreateAccountForm: React.FC<{
  onSuccessfulSave: () => void;
}> = ({ onSuccessfulSave }) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading: isSaving } = useMutation(
    [QueryMutationKey.ACCOUNTS_CREATE],
    (data: CreateAccountDto) => api.accounts.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.ACCOUNTS_LIST]);
        onSuccessfulSave();
      },
    }
  );

  const form = useForm<CreateAccountFormValues>();
  const { handleSubmit, control, watch } = form;

  const _onSubmit = (data: CreateAccountFormValues) => {
    data.category = AccountTypeCategoryMap.get(data.type as AccountType);
    data.parentAccountId = data.parentAccount?.accountId;
    mutate(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(_onSubmit)}>
        <Stack spacing="md">
          <Controller
            control={control}
            name="parentAccount"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <AccountSelect
                label="Parent Account"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                setting="exclude"
                types={[
                  AccountType.AccountsPayable,
                  AccountType.AccountsReceivable,
                ]}
              />
            )}
          />
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
                value={value}
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
            render={({ field: { onChange, onBlur, value } }) => (
              <CurrencySelect
                label="Denomination"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <AccountTypeInput control={control} />

          <AccountSubTypeInput control={control} watch={watch} />

          <Button type="submit">Create</Button>
          {isSaving && <Overlay />}
        </Stack>
      </form>
    </FormProvider>
  );
};

const AccountsTable: React.FC<{
  data: AccountDto[];
}> = ({ data }) => {
  const columnHelper = createColumnHelper<AccountDto>();

  const columns: ColumnDef<AccountDto, any>[] = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <Link href={`/app/accounts/${row.original.accountId}`}>
          <Text variant="link">{row.original.name}</Text>
        </Link>
      ),
    }),
    columnHelper.accessor("number", {
      header: "Number",
    }),
    columnHelper.accessor("denomination", {
      header: "Denomination",
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <Badge>{info.getValue()}</Badge>,
    }),
    {
      header: "Sub type",
      accessorFn: (row: AccountDto) =>
        row.accountSubType ? row.accountSubType.name : "-",
    },
    // columnHelper.accessor("totalDebit", {
    //   header: "Debits",
    // }),
    // columnHelper.accessor("totalCredit", {
    //   header: "Credits",
    // }),
    // columnHelper.accessor("balance", {
    //   header: "Balance",
    // }),
  ];

  const accountsTable = useReactTable<AccountDto>({
    data,
    columns,
    filterFns: {
      fuzzy: () => true,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Table>
        <thead>
          {accountsTable.getHeaderGroups().map((headerGroup) => (
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
          {accountsTable.getRowModel().rows.map((row) => (
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
    </>
  );
};

function Accounts() {
  const [caModalOpen, setCaModalOpen] = useState(false);
  const [castModalOpen, setCastModalOpen] = useState(false);
  const { isLoading, data } = useQuery([QueryMutationKey.ACCOUNTS_LIST], () =>
    api.accounts.list()
  );

  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );
  return (
    <>
      <Head>
        <title>Chart of Accounts | Ledger</title>
      </Head>

      <Group position="apart">
        <h1>Chart of Accounts</h1>
        <Group>
          <Button onClick={() => setCaModalOpen(true)}>Create Account</Button>
          <Modal
            title="Create Account"
            centered
            opened={caModalOpen}
            onClose={() => setCaModalOpen(false)}
          >
            <CreateAccountForm onSuccessfulSave={() => setCaModalOpen(false)} />
          </Modal>

          <Button onClick={() => setCastModalOpen(true)} variant="outline">
            Create Account Sub Type
          </Button>
          <Modal
            title="Create Account Sub Types"
            centered
            opened={castModalOpen}
            onClose={() => setCastModalOpen(false)}
          >
            <CreateAccountSubTypeForm
              onSuccesfulSave={() => setCastModalOpen(false)}
            />
          </Modal>
        </Group>
      </Group>

      {data && <AccountsTable data={data.data} />}
    </>
  );
}

export default Accounts;

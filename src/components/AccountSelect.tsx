import { Group, Loader, Select, SelectItem, SelectProps, Text } from "@mantine/core";
import { Account } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { forwardRef } from "react";
import { AccountType } from "../constants/account-taxonimies";
import { api, QueryMutationKey, queryMutationKey } from "../utils/api-client";

type AccountSelectProps = Omit<SelectProps, "data" | "onChange" | "value"> & {
  onChange: (value: Account | undefined) => void,
  value: Account | undefined
} & ({ setting: 'include', types: 'all' | AccountType | (AccountType)[] } | {setting: 'exclude', types: 'all' | AccountType | (AccountType)[]});

type AccountSelectItemData = SelectItem & { accountSubTypeName?: string,
  parentAccountName?: string }


interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string,
  accountSubTypeName?: string,
  parentAccountName?: string
}


const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ parentAccountName, label, accountSubTypeName, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" color="dimmed">
            {[parentAccountName].filter(Boolean).join(' - ')}
          </Text>
        </div>
      </Group>
    </div>
  )
);


export const AccountSelect: React.FC<AccountSelectProps> = ({
  onChange,
  value,
  setting = 'include',
  types = 'all',
  ...rest
}) => {
  const { data, isLoading } = useQuery(
    Array.isArray(types) 
    ? [queryMutationKey(QueryMutationKey.ACCOUNTS_LIST, setting, ...types)] 
    : [queryMutationKey(QueryMutationKey.ACCOUNTS_LIST, setting, types)],
    () =>
      api.accounts.list({
        setting,
        types
      })
  );

  if (isLoading || !data) return <Loader />;

  const options: AccountSelectItemData[] = data.data.map(({name, number, accountId, type, accountSubType, parentAccount}) => ({
    label: `${number} - ${name}`,
    value: accountId,
    group: type,
    accountSubTypeName: accountSubType ? accountSubType.name : undefined,
    parentAccountName: parentAccount && `Sub account of ${parentAccount.number} ${parentAccount.name}` || undefined
  }))

  return (
    <Select
      {...rest}
      itemComponent={SelectItem}
      searchable
      data={options}
      onChange={(item) => onChange(data.data.find((a) => a.accountId === item))}
      value={value?.accountId}
    />
  );
};
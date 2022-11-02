import { Select, SelectProps } from "@mantine/core";
import {
  AccountType,
  AccountTypeCategoryMap,
} from "@src/constants/account-taxonimies";

type AccountTypeSelectProps = Omit<SelectProps, "data"> & ({ types?: AccountType[], setting?: 'include' } | { setting?: 'exclude', types?: AccountType[] });

export const AccountTypeSelect: React.FC<AccountTypeSelectProps> = ({
  onChange,
  onBlur,
  value,
  setting,
  types,
  ...rest
}) => {

  const values = Object.values(AccountType)

  const data = setting === 'include' 
    ? values.filter(a => types?.includes(a)) 
    : setting === 'exclude' 
      ? values.filter(a => !types?.includes(a))
      : values

  return <Select
    {...rest}
    data={data.map((at) => ({
      value: at,
      label: at,
      group: AccountTypeCategoryMap.get(at),
    }))}
    onChange={onChange}
    onBlur={onBlur}
    value={value}
  />
};

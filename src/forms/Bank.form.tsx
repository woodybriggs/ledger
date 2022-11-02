import { Button, Stack, TextInput } from "@mantine/core";
import { AccountSelect } from "@src/components/AccountSelect";
import { AccountType } from "@src/constants/account-taxonimies";
import { AccountDto } from "@src/schemas/account.schema";
import { BankDto, CreateBankDto } from "@src/schemas/bank.schema";
import { Controller, useForm } from "react-hook-form";

type BankFormProps = {
  onSuccessfulSave: () => void;
} & ({
  mode: 'edit',
  bank: BankDto
} | {
  mode: 'create'
});

type BankFormValues = CreateBankDto & { nominalAssetAccount: AccountDto | undefined }

const createBankDefaultValues = (mode: 'create' | 'edit', data?: { bank?: BankDto }): BankFormValues => {
  if (data && data.bank) 
    return ({
      name: data.bank.name,
      denomination: data.bank.denomination,
      nominalAssetAccountId: data.bank.nominalAssetAccountId || '',
      nominalAssetAccount: undefined,
    })
  return ({
    name: "",
    denomination: "",
    nominalAssetAccountId: "",
    nominalAssetAccount: undefined,
  })
}

export const BankForm: React.FC<BankFormProps> = ({ onSuccessfulSave, mode, ...rest }) => {

  const form = useForm<BankFormValues>({
    defaultValues: createBankDefaultValues(mode, rest)
  });

  const onSubmit = (data: BankFormValues) => {
    const nominalAssetAccount = data.nominalAssetAccount!
    data.denomination = nominalAssetAccount.denomination!
  };

  const { control, handleSubmit } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Controller
          control={control}
          name="name"
          rules={{ required: true }}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <TextInput
              label="Bank name"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={error && "Bank name is required"}
            />
          )}
        />
        <Controller
          control={control}
          name="nominalAssetAccount"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <AccountSelect
              label="Nominal Bank Account"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={error && "Nominal Asset Account is required"}
              setting='include'
              types={[AccountType.Bank]}
            />
          )}
        />
        <Button type="submit">Submit</Button>
      </Stack>
    </form>
  );
};

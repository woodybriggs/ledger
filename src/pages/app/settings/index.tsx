import { Button, Loader, Overlay, SimpleGrid, Stack, Tabs } from "@mantine/core";
import { Account } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { AccountSelect } from "@src/components/AccountSelect";
import { CurrencySelect } from "@src/components/CurrencySelect";
import { AccountType } from "@src/constants/account-taxonimies";
import { api, QueryMutationKey } from "@src/utils/api-client";
import { CompanySettingsDto } from "@src/pages/api/settings/company";

enum TabValue {
  CompanySettings = 'company-settings',
  ForeignDenominations = 'foreign-denominations'
}

type CompanySettingsFormValues = {
  denomination: string | null,
  nominalVatInputAccount: Account,
  nominalVatOutputAccount: Account
}
const CompanySettingsForm: React.FC<{
  companySettings: CompanySettingsDto
}> = ({
  companySettings: { reportingCurrency }
}) => {

  const form = useForm<CompanySettingsFormValues>({
    defaultValues: {
      denomination: reportingCurrency
    }
  })
  const { control, handleSubmit } = form;

  const { mutate, isLoading } = useMutation(
    [QueryMutationKey.ACCOUNTS_UPDATE],
    (data: CompanySettingsFormValues) => api.companySettings.update({
      reportingCurrency: data.denomination,
      nominalVatInputAccount: data.nominalVatInputAccount,
      nominalVatOutputAccount: data.nominalVatOutputAccount
    })
  )

  const onSubmit = (data: CompanySettingsFormValues) => {
    mutate(data)
  }

  return (
    <SimpleGrid cols={3} py="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoading && <Overlay/>}
        <Stack align="flex-start">
        <Controller
          control={control}
          name="denomination"
          render={({field: { onChange, onBlur, value }}) => (
            <CurrencySelect
              label="Reporting Currency"
              clearable
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="nominalVatInputAccount"
          render={({ field: { onChange, onBlur, value } }) => (
            <AccountSelect
              label="VAT Inputs Account"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              setting='include'
              types={[
                AccountType.OtherCurrentAssets
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="nominalVatOutputAccount"
          render={({ field: { onChange, onBlur, value } }) => (
            <AccountSelect
              label="VAT Output Account"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              setting='include'
              types={[
                AccountType.OtherCurrentLiabilities
              ]}
            />
          )}
        />
        <Button type="submit">Save</Button>
        </Stack>
      </form>
    </SimpleGrid>
  )
}

const CompanySettings: React.FC<{}> = ({}) => {
  const { data, isLoading } = useQuery(
    [QueryMutationKey.COMPANY_SETTINGS_GET],
    () => api.companySettings.get()
  )

  if (isLoading || !data) return <Loader/>

  return <CompanySettingsForm companySettings={data}/>
}

function Settings() {
  return (
    <>
      <h1>Settings</h1>
      <Tabs defaultValue={TabValue.CompanySettings}>
        <Tabs.List>
          <Tabs.Tab value={TabValue.CompanySettings}>Company</Tabs.Tab>
          <Tabs.Tab value={TabValue.ForeignDenominations}>Foreign Denominations</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={TabValue.CompanySettings}>
          <CompanySettings/>
        </Tabs.Panel>

        {/* <Tabs.Panel value={TabValue.ForeignDenominations}>
          <ForeignDenominations/>
        </Tabs.Panel> */}
      </Tabs>
    </>
  )
}

export default Settings;
import { Loader, Select, SelectProps } from "@mantine/core"
import { Customer } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { api, QueryMutationKey } from "../utils/api-client"

type CustomerSelectProps = Omit<SelectProps, 'data' | 'onChange'> & { onChange: (item?: Customer) => void }

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  onChange,
  ...rest
}) => {

  const { data, isLoading } = useQuery(
    [QueryMutationKey.CUSTOMERS_LIST],
    () => api.customers.list()
  )

  if (isLoading || !data) return <Loader/>

  return (
    <Select
      {...rest}
      searchable
      data={data.data.map(s => ({ label: s.name, value: s.customerId}))}
      onChange={(item) => { onChange && onChange(data.data.find(s => s.customerId === item)) }}
    />
  )
}
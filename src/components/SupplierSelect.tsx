import { Loader, Select, SelectProps } from "@mantine/core"
import { Supplier } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { api, QueryMutationKey } from "../utils/api-client"

type SupplierSelectProps = Omit<SelectProps, 'data' | 'onChange'> & { onChange: (item?: Supplier) => void }

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
  onChange,
  ...rest
}) => {

  const { data, isLoading } = useQuery(
    [QueryMutationKey.SUPPLIERS_LIST],
    () => api.suppliers.list()
  )

  if (isLoading || !data) return <Loader/>

  return (
    <Select
      {...rest}
      searchable
      data={data.data.map(s => ({ label: s.name, value: s.supplierId}))}
      onChange={(item) => { onChange && onChange(data.data.find(s => s.supplierId === item)) }}
    />
  )
}
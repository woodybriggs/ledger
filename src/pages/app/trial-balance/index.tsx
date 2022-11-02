import { Button, Group, Loader, Table, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { PresetAccountId } from "@src/schemas/account.schema";
import {
  TrialBalanceDto,
  TrialBalanceLineDto,
  TrialBalanceQueryDto,
} from "@src/schemas/trial-balance.schema";
import { api, QueryMutationKey } from "@src/utils/api-client";

const TrialBalanceTable: React.FC<TrialBalanceDto> = ({ data }) => {
  const columnHelper = createColumnHelper<TrialBalanceLineDto>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Account",
      cell: ({ row: { original: { name, number, accountId }} }) => {
        return accountId === PresetAccountId.Root 
        ? <Text> Balance </Text>
        : <Text> {number} - {name} </Text>
      }
    }),
    columnHelper.accessor("totalDebit", {
      header: () => <div style={{textAlign: 'right'}}>Debit</div>,
      cell: ({ row }) => <div style={{textAlign: 'right'}}>{row.original.totalDebit.toDP(2).toFixed(2)}</div>
    }),
    columnHelper.accessor("totalCredit", {
      header: () => <div style={{textAlign: 'right'}}>Credit</div>,
      cell: ({ row }) => <div style={{textAlign: 'right'}}>{row.original.totalCredit.toDP(2).toFixed(2)}</div>,
    }),
  ];

  const { getHeaderGroups, getRowModel } = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <thead>
        {getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
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
            { row.getAllCells().map(cell => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            )) }
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const useTrialBalance = (query: TrialBalanceQueryDto) => useQuery(
  [QueryMutationKey.TRIAL_BALANCE_GET, query.fromDate, query.toDate],
  () => api.reports.trialBalance(query)
);

const TrialBalance: React.FC<{}> = ({}) => {

  const [fromDate, setFromDate] = useState(new Date("2022-01-01"))
  const [toDate, setToDate] = useState(new Date("2023-01-01"))

  const { data: response, isLoading } = useTrialBalance({ 
    fromDate: fromDate,
    toDate: toDate
  })

  if (isLoading || !response) return <Loader />;

  return (
    <>
      <Group position="apart">
        <Group>
          <DatePicker
            label="From"
            onChange={(v) => v && setFromDate(v)}
            value={fromDate}
          />
          <DatePicker
            label="To"
            onChange={(v) => v && setToDate(v)}
            value={toDate}
          />
        </Group>

        <Button component="a" download="trial-balance.csv" href={api.reports.exportTrialBalance({fromDate, toDate})}>Export</Button>
      </Group>
      <TrialBalanceTable data={response.data} />
    </>
  );
};

export default TrialBalance;

import { LineItemFormValues } from "./LineItemsTableInput";
import { Text } from '@mantine/core'
import { getCurrencyPrecision } from "./CurrencySelect";
import { Control, useFormContext, useWatch } from "react-hook-form";
import { Prisma } from "@prisma/client";;

type Total = {
  net: Prisma.Decimal
  vat: Prisma.Decimal
  gross: Prisma.Decimal

  nominalNet: Prisma.Decimal
  nominalVat: Prisma.Decimal
  nominalGross: Prisma.Decimal
}

// TODO Pass Denomination Type into here.
export const TotalsTable: React.FC<{
  nominalDenomination: string,
  sourceDenomination: string
}> = ({ nominalDenomination, sourceDenomination }) => {

  const { control } = useFormContext<{lineItems: LineItemFormValues[], exchangeRate: Prisma.Decimal}>()
  const lineItems = useWatch({control, name: 'lineItems'});
  const exchangeRate = useWatch({ control, name: 'exchangeRate' })

  const nominalDenomPrecision = getCurrencyPrecision(nominalDenomination)
  const sourceDenomPrecision = getCurrencyPrecision(sourceDenomination)


  const total: Total = lineItems.map(li => ({
    net: li.netAmount,
    vat: li.vatAmount,
    gross: li.netAmount.add(li.vatAmount),
    nominalNet: li.netAmount.div(exchangeRate),
    nominalVat: li.vatAmount.div(exchangeRate),
    nominalGross: li.netAmount.add(li.vatAmount).div(exchangeRate)
  }) as Total)
  .reduce((acc, n) => ({
    net: acc.net.add(n.net),
    vat: acc.vat.add(n.vat),
    gross: acc.gross.add(n.gross),
    nominalNet: acc.nominalNet.add(n.nominalNet),
    nominalVat: acc.nominalVat.add(n.nominalVat),
    nominalGross: acc.nominalGross.add(n.nominalGross),
  }), {
    net: new Prisma.Decimal(0),
    vat: new Prisma.Decimal(0),
    gross: new Prisma.Decimal(0),
    nominalNet: new Prisma.Decimal(0),
    nominalVat: new Prisma.Decimal(0),
    nominalGross: new Prisma.Decimal(0),
  })

  return (
    <table cellSpacing={8}>
      <thead>
        <tr>
          <th></th>
          <th>
            <Text size="sm">{sourceDenomination}</Text>
          </th>
          <th>
            <Text size="sm">{nominalDenomination}</Text>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Text size="sm">Total Net</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.net.toFixed(sourceDenomPrecision).toString()}
            </Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.nominalNet.toFixed(nominalDenomPrecision).toString()}
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Text size="sm">Total VAT</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.vat.toFixed(sourceDenomPrecision).toString()}
            </Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.nominalVat.toFixed(nominalDenomPrecision).toString()}
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Text size="sm">Total Gross</Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.gross.toFixed(sourceDenomPrecision).toString()}
            </Text>
          </td>
          <td align="right">
            <Text size="sm">
              {total.nominalGross.toFixed(nominalDenomPrecision).toString()}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
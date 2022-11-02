import { Group, NumberInput, NumberInputProps, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { BasePurchaseFormValues } from "@src/forms/Purchase.form";
import { getCurrencyPrecision } from "./CurrencySelect";
import { MoneyInput, MoneyInputProps } from "./MoneyInput";


export const ExchangeRateInputNew: React.FC<
  {
    sourceDenomination: string;
    destinationDenomination: string;
    value?: Prisma.Decimal
  } & Omit<MoneyInputProps, 'value' | 'denomination'>
> = ({ sourceDenomination, destinationDenomination, value, ...rest }) => {
  const precision = getCurrencyPrecision(sourceDenomination) || 2;

  return (
    <Group align="flex-end">
      <MoneyInput
        {...rest}
        value={value || new Prisma.Decimal(0)}
        step={precision / (precision * Math.pow(10, precision))}
        denomination={{
          tick: sourceDenomination,
          decimalPlaces: 8
        }}
      />
      <Text style={{ marginBottom: "8px" }} color="gray" size="sm">
        = 1.00 {destinationDenomination}
      </Text>
    </Group>
  );
};
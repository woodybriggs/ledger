import { NumberInput, NumberInputProps, Text } from "@mantine/core";
import { Denomination } from "@src/hooks/api-hooks";
import { Prisma } from "@prisma/client";

export type MoneyInputProps = Omit<NumberInputProps, "onChange" | "value"> & {
  denomination: Denomination;
  onChange: ((value: Prisma.Decimal | undefined) => void) | undefined;
  value: Prisma.Decimal | undefined
};

export const MoneyInput: React.FC<MoneyInputProps> = ({
  denomination,
  onChange,
  value,
  ...rest
}) => {
  const _onChange = (value?: number) => {
    if (!onChange) return;
    if (!value) {
      onChange(undefined);
      return;
    }

    onChange(new Prisma.Decimal(value.toString()))
  };

  return (
    <NumberInput
      {...rest}
      value={value?.toNumber()}
      onChange={_onChange}
      precision={denomination.decimalPlaces}
      step={denomination.decimalPlaces / (denomination.decimalPlaces * Math.pow(10, denomination.decimalPlaces))}
      icon={<Text>
        {denomination.tick}
      </Text>}
    />
  );
};

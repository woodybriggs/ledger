import { TextInput, TextInputProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons"

type DebouncedSearchProps = Omit<TextInputProps, "onChange"> & {
  debounce?: number;
  onChange: (value: any) => void;
};

export const DebouncedSearchInput: React.FC<DebouncedSearchProps> = ({
  value: initialValue,
  onChange,
  debounce,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange && onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <TextInput 
    value={value} 
    onChange={(e) => setValue(e.target.value)}
    icon={<IconSearch/>}
    placeholder="Search"
  />;
};

import {
  Accordion,
  Button,
  Checkbox,
  Overlay,
  Stack,
  TextInput,
} from "@mantine/core";
import { Account } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { SupplierDto } from "../../pages/api/suppliers";
import { AccountSelect } from "../components/AccountSelect";
import { CurrencySelect } from "../components/CurrencySelect";
import { AccountType } from "../constants/account-taxonimies";
import { AddressType, CreateAddressDto } from "../schemas/address.schema";
import { CreateSupplierDto } from "../schemas/supplier.schema";
import { api, QueryMutationKey } from "../utils/api-client";

type SupplierFormValues = {
  supplier: CreateSupplierDto & { defaultNominalAccount: Account };
  shippingAddress?: CreateAddressDto | null;
  shippingAddressSameAsBilling: boolean;
  billingAddress?: CreateAddressDto | null;
};

const objectIsFilledWithNulls = <T extends Record<string, any> | undefined,>(o: T): boolean => {
  if (!o) return true
  return Object.values(o).reduce((acc, n) => acc === true && n === null, true)
}

const createSupplier = async (data: SupplierFormValues) => {
  data.supplier.defaultNominalAccountId = data.supplier.defaultNominalAccount.accountId;
  const supplier = await api.suppliers.create(data.supplier);

  if (data.shippingAddressSameAsBilling) data.shippingAddress = data.billingAddress;

  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress)) {
    data.billingAddress.supplierId = supplier.supplierId;
    data.billingAddress.addressType = AddressType.Billing;
    await api.addresses.create(data.billingAddress);
  }

  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress)) {
    data.shippingAddress.supplierId = supplier.supplierId;
    data.shippingAddress.addressType = AddressType.Shipping;
    await api.addresses.create(data.shippingAddress);
  }
}

const updateSupplier = async (supplier: SupplierDto, data: SupplierFormValues) => {
  data.supplier.defaultNominalAccountId = data.supplier.defaultNominalAccount.accountId;
  await api.suppliers.update(supplier.supplierId, data.supplier);

  if (data.shippingAddressSameAsBilling) data.shippingAddress = data.billingAddress;

  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress) && supplier.billingAddressId) 
  {
    await api.addresses.update(supplier.billingAddressId, data.billingAddress)
  } 
  
  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress) && !supplier.billingAddressId)
  {
    data.billingAddress.supplierId = supplier.supplierId;
    data.billingAddress.addressType = AddressType.Billing;
    await api.addresses.create(data.billingAddress)
  } 

  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress) && supplier.shippingAddressId)
  {
    await api.addresses.update(supplier.shippingAddressId, data.shippingAddress)
  }
  
  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress) && !supplier.shippingAddressId)
  {
    data.shippingAddress.supplierId = supplier.supplierId;
    data.shippingAddress.addressType = AddressType.Shipping;
    await api.addresses.create(data.shippingAddress);
  }
}

type SupplierFormProps = {
  onSuccessfulSave: () => void;
} & (
  { mode: 'edit', defaultValues: SupplierFormValues, supplier: SupplierDto } |
  { mode: 'create' }
)

export const SupplierForm: React.FC<SupplierFormProps> = (props) => {
  const { mode, onSuccessfulSave } = props;

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    [QueryMutationKey.SUPPLIERS_CREATE],
    async (data: SupplierFormValues) => {
      mode === 'create' ? await createSupplier(data) : await updateSupplier(props.supplier, data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.SUPPLIERS_LIST]);
        onSuccessfulSave();
      },
    }
  );

  const form = useForm<SupplierFormValues>({
    defaultValues: mode === 'edit' ? props.defaultValues : {},
  });
  const { control, handleSubmit, watch } = form;

  const shippingAddressSameAsBilling = watch("shippingAddressSameAsBilling");

  const onSubmit = (data: SupplierFormValues) => {
   mutate(data);
  };

  const [value, setValue] = useState<string | null>("supplier");

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoading && <Overlay />}
        <Stack>
          <Accordion value={value} onChange={setValue} variant="contained">
            <Accordion.Item value="supplier">
              <Accordion.Control>Supplier</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Controller
                    name={"supplier.name"}
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        label="Supplier Name"
                        withAsterisk
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="supplier.denomination"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CurrencySelect
                        label="Denomination"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"supplier.defaultNominalAccount"}
                    rules={{ required: true }}
                    render={({ field, fieldState: { error } }) => (
                      <AccountSelect
                        withAsterisk
                        label={"Default Nominal Account"}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        value={field.value}
                        error={error && "Default account is required"}
                        setting="include"
                        searchable
                        types={[
                          AccountType.DirectCosts,
                          AccountType.IndirectCosts,
                          AccountType.OtherCosts,
                        ]}
                      />
                    )}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="billingAddress">
              <Accordion.Control>Billing Address</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Controller
                    control={control}
                    name={"billingAddress.addressLine1"}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        withAsterisk
                        label="Address Line 1"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.addressLine2"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 2"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.addressLine3"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 3"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={"billingAddress.addressLine4"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 4"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.city"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="City"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.provinceStateCounty"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Province / State / County"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.zipPostalCode"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Zip / Postal Code"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"billingAddress.country"}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <TextInput
                        label="Country"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="shippingAddress">
              <Accordion.Control>Shipping Address</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Controller
                    control={control}
                    name={"shippingAddressSameAsBilling"}
                    render={({ field }) => (
                      <Checkbox
                        label="Same as billing"
                        onChange={field.onChange}
                        checked={field.value}
                        onBlur={field.onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.addressLine1"}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <TextInput
                        withAsterisk
                        label="Address Line 1"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.addressLine2"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 2"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.addressLine3"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 3"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={"shippingAddress.addressLine4"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Address Line 4"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.city"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="City"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.provinceStateCounty"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Province / State / County"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.zipPostalCode"}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label="Zip / Postal Code"
                        disabled={shippingAddressSameAsBilling}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={"shippingAddress.country"}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <TextInput
                        label="Country"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || ""}
                        disabled={shippingAddressSameAsBilling}
                      />
                    )}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </FormProvider>
  );
};

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
import { CustomerDto } from "../../pages/api/customers";
import { AccountSelect } from "../components/AccountSelect";
import { CurrencySelect } from "../components/CurrencySelect";
import { AccountType } from "../constants/account-taxonimies";
import { AddressType, CreateAddressDto } from "../schemas/address.schema";
import { CreateCustomerDto } from "../schemas/customer.schema";
import { api, QueryMutationKey } from "../utils/api-client";

type CustomerFormValues = {
  customer: CreateCustomerDto & { defaultNominalAccount: Account };
  shippingAddress?: CreateAddressDto | null;
  shippingAddressSameAsBilling: boolean;
  billingAddress?: CreateAddressDto | null;
};

const objectIsFilledWithNulls = <T extends Record<string, any> | undefined,>(o: T): boolean => {
  if (!o) return true
  return Object.values(o).reduce((acc, n) => acc === true && n === null, true)
}

const createCustomer = async (data: CustomerFormValues) => {
  data.customer.defaultNominalAccountId = data.customer.defaultNominalAccount.accountId;
  const customer = await api.customers.create(data.customer);

  if (data.shippingAddressSameAsBilling) data.shippingAddress = data.billingAddress;

  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress)) {
    data.billingAddress.customerId = customer.customerId;
    data.billingAddress.addressType = AddressType.Billing;
    await api.addresses.create(data.billingAddress);
  }

  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress)) {
    data.shippingAddress.customerId = customer.customerId;
    data.shippingAddress.addressType = AddressType.Shipping;
    await api.addresses.create(data.shippingAddress);
  }
}

const updateCustomer = async (customer: CustomerDto, data: CustomerFormValues) => {
  data.customer.defaultNominalAccountId = data.customer.defaultNominalAccount.accountId;
  await api.customers.update(customer.customerId, data.customer);

  if (data.shippingAddressSameAsBilling) data.shippingAddress = data.billingAddress;

  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress) && customer.billingAddressId) 
  {
    await api.addresses.update(customer.billingAddressId, data.billingAddress)
  } 
  
  if (data.billingAddress && !objectIsFilledWithNulls(data.billingAddress) && !customer.billingAddressId)
  {
    data.billingAddress.customerId = customer.customerId;
    data.billingAddress.addressType = AddressType.Billing;
    await api.addresses.create(data.billingAddress)
  } 

  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress) && customer.shippingAddressId)
  {
    await api.addresses.update(customer.shippingAddressId, data.shippingAddress)
  }
  
  if (data.shippingAddress && !objectIsFilledWithNulls(data.shippingAddress) && !customer.shippingAddressId)
  {
    data.shippingAddress.customerId = customer.customerId;
    data.shippingAddress.addressType = AddressType.Shipping;
    await api.addresses.create(data.shippingAddress);
  }
}

type CustomerFormProps = {
  onSuccessfulSave: () => void;
} & (
  { mode: 'edit', defaultValues: CustomerFormValues, customer: CustomerDto } |
  { mode: 'create' }
)

export const CustomerForm: React.FC<CustomerFormProps> = (props) => {
  const { mode, onSuccessfulSave } = props;

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    [QueryMutationKey.SUPPLIERS_CREATE],
    async (data: CustomerFormValues) => {
      mode === 'create' ? await createCustomer(data) : await updateCustomer(props.customer, data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryMutationKey.SUPPLIERS_LIST]);
        onSuccessfulSave();
      },
    }
  );

  const form = useForm<CustomerFormValues>({
    defaultValues: mode === 'edit' ? props.defaultValues : {},
  });
  const { control, handleSubmit, watch } = form;

  const shippingAddressSameAsBilling = watch("shippingAddressSameAsBilling");

  const onSubmit = (data: CustomerFormValues) => {
   mutate(data);
  };

  const [value, setValue] = useState<string | null>("customer");

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoading && <Overlay />}
        <Stack>
          <Accordion value={value} onChange={setValue} variant="contained">
            <Accordion.Item value="customer">
              <Accordion.Control>Customer</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Controller
                    name={"customer.name"}
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { onChange, onBlur, value },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        label="Customer Name"
                        withAsterisk
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="customer.denomination"
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
                    name={"customer.defaultNominalAccount"}
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

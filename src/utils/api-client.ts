import {
  Account,
  AccountSubType,
  Address,
  Customer,
  JournalEntry,
  Supplier,
  Transaction,
} from "@prisma/client";
import {
  CreateAccountSubTypeDto,
  ListAccountSubTypesDto,
  UpdateAccountSubTypeDto,
} from "../schemas/account-subtype.schema";
import {
  CreateAccountDto,
  ListAccountsQueryDto,
  UpdateAccountDto,
} from "../schemas/account.schema";
import qs from "query-string";
import { AccountDto } from "../../pages/api/accounts";
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
} from "../schemas/transaction.schema";
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from "../schemas/supplier.schema";
import { CreateCustomerDto, UpdateCustomerDto } from "../schemas/customer.schema";
import { CreateAddressDto, UpdateAddressDto } from "../schemas/address.schema";
import { SupplierDto } from "../../pages/api/suppliers";
import { CustomerDto } from "../../pages/api/customers";
import { CreateInstantExpenseDto } from "../schemas/instant-expense.schema";
import { TransactionDto } from "../../pages/api/transactions";
import { CompanySettingsDto } from "../../pages/api/settings/company";
import { UpdateCompanySettingsDto } from "../schemas/company-settings.schema";
import { AddressDto } from "../../pages/api/addresses";
import { CreateInstantSaleDto } from "../schemas/instant-sale.schema";

const mergeRequestInits = (
  ...args: (RequestInit | undefined)[]
): RequestInit => {
  const _args = args.filter(Boolean) as RequestInit[];
  const result: RequestInit = _args.reduce((acc, next) => ({
    ...acc,
    ...next,
  }));
  return result;
};

class ApiClient {
  constructor(private init?: RequestInit) {}

  public accounts = new AccountsApi(this.init);
  public accountSubTypes = new AccountSubTypesApi(this.init);
  public transactions = new TransactionsApi(this.init);
  public journalEntries = new JournalEntriesApi(this.init);
  public suppliers = new SuppliersApi(this.init);
  public customers = new CustomersApi(this.init);
  public addresses = new AddressApi(this.init);
  public instantExpenses = new InstantExpenseApi(this.init);
  public instantSales = new InstantSaleApi(this.init)
  public companySettings = new CompanySettingsApi(this.init);
}

class AccountsApi {
  constructor(private init?: RequestInit) {}

  public async list(
    query?: ListAccountsQueryDto
  ): Promise<{ data: AccountDto[] }> {
    const url = qs.stringifyUrl({ url: "/api/accounts", query });
    const response = await fetch(
      url,
      mergeRequestInits(this.init, { method: "GET" })
    );
    return response.json();
  }

  public async get(accountId: string): Promise<Account> {
    const response = await fetch(
      `/api/accounts/${accountId}`,
      mergeRequestInits(this.init, { method: "GET" })
    );
    return response.json();
  }

  public async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const init: RequestInit = {
      method: "POST",
      body: JSON.stringify(createAccountDto),
    };
    const response = await fetch(
      "/api/accounts",
      mergeRequestInits(this.init, init)
    );
    return response.json();
  }

  public async update(
    accountId: string,
    updateAccountDto: UpdateAccountDto
  ): Promise<Account> {
    const init: RequestInit = {
      method: "PATCH",
      body: JSON.stringify(updateAccountDto),
    };
    const response = await fetch(
      `/api/accounts/${accountId}`,
      mergeRequestInits(this.init, init)
    );
    return response.json();
  }
}

class AccountSubTypesApi {
  constructor(private init?: RequestInit) {}

  public async list(
    query?: ListAccountSubTypesDto
  ): Promise<{ data: AccountSubType[] }> {
    const url = qs.stringifyUrl({ url: "/api/account-subtypes", query });
    const response = await fetch(
      url,
      mergeRequestInits(this.init, { method: "GET" })
    );
    return response.json();
  }

  public async get(accountId: string): Promise<AccountSubType> {
    const response = await fetch(
      `/api/account-subtypes/${accountId}`,
      mergeRequestInits(this.init, { method: "GET" })
    );
    return response.json();
  }

  public async create(
    createAccountSubTypeDto: CreateAccountSubTypeDto
  ): Promise<AccountSubType> {
    const init: RequestInit = {
      method: "POST",
      body: JSON.stringify(createAccountSubTypeDto),
    };
    const response = await fetch(
      "/api/account-subtypes",
      mergeRequestInits(this.init, init)
    );
    return response.json();
  }

  public async update(
    accountSubTypeId: string,
    updateAccountSubTypeDto: UpdateAccountSubTypeDto
  ): Promise<AccountSubType> {
    const init: RequestInit = {
      method: "PATCH",
      body: JSON.stringify(updateAccountSubTypeDto),
    };
    const response = await fetch(
      `/api/account-subtypes/${accountSubTypeId}`,
      mergeRequestInits(this.init, init)
    );
    return response.json();
  }
}

class TransactionsApi {
  constructor(private init?: RequestInit) {}

  public async list(
    query?: ListTransactionsQueryDto
  ): Promise<{ data: TransactionDto[] }> {
    const url = qs.stringifyUrl({ url: "/api/transactions", query });
    const response = await fetch(
      url,
      mergeRequestInits(this.init, { method: "GET" })
    );
    return response.json();
  }
}

class JournalEntriesApi {
  constructor(private init?: RequestInit) {}

  public async get(
    journalEntryId: string
  ): Promise<JournalEntry & { transactions: TransactionDto[] }> {
    const response = await fetch(`/api/journal-entries/${journalEntryId}`);
    return response.json();
  }

  public async create(
    transactions: CreateTransactionDto[]
  ): Promise<JournalEntry> {
    const response = await fetch(
      "/api/journal-entries",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify({ transactions }),
      })
    );
    return response.json();
  }
}

class SuppliersApi {
  constructor(private init?: RequestInit) {}

  public async list(): Promise<{ data: SupplierDto[] }> {
    const response = await fetch(
      "/api/suppliers",
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async create(
    createSupplierDto: CreateSupplierDto
  ): Promise<SupplierDto> {
    const response = await fetch(
      "/api/suppliers",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify(createSupplierDto),
      })
    );
    return response.json();
  }

  public async get(supplierId: string): Promise<SupplierDto> {
    const response = await fetch(
      `/api/suppliers/${supplierId}`,
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async update(
    supplierId: string,
    updateSupplierDto: UpdateSupplierDto
  ): Promise<SupplierDto> {
    const response = await fetch(
      `/api/suppliers/${supplierId}`,
      mergeRequestInits(this.init, {
        method: "PATCH",
        body: JSON.stringify(updateSupplierDto),
      })
    );
    return response.json();
  }
}

class CustomersApi {
  constructor(private init?: RequestInit) {}

  public async list(): Promise<{ data: CustomerDto[] }> {
    const response = await fetch(
      "/api/customers",
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async create(createSupplierDto: CreateCustomerDto): Promise<Customer> {
    const response = await fetch(
      "/api/customers",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify(createSupplierDto),
      })
    );
    return response.json();
  }

  public async get(customerId: string): Promise<CustomerDto> {
    const response = await fetch(
      `/api/customers/${customerId}`,
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async update(
    customerId: string,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<CustomerDto> {
    const response = await fetch(
      `/api/customers/${customerId}`,
      mergeRequestInits(this.init, {
        method: "PATCH",
        body: JSON.stringify(updateCustomerDto),
      })
    );
    return response.json();
  }
}

class AddressApi {
  constructor(private init?: RequestInit) {}

  public async list(): Promise<{ data: AddressDto[] }> {
    const response = await fetch(
      "/api/addresses",
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async create(createAddressDto: CreateAddressDto): Promise<AddressDto> {
    const response = await fetch(
      "/api/addresses",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify(createAddressDto),
      })
    );
    return response.json();
  }

  public async update(addressId: string, updateAddressDto: UpdateAddressDto): Promise<AddressDto> {
    const response = await fetch(
      `/api/addresses/${addressId}`,
      mergeRequestInits(this.init, {
        method: "PATCH",
        body: JSON.stringify(updateAddressDto),
      })
    );
    return response.json();
  }
}

class InstantExpenseApi {
  constructor(private init?: RequestInit) {}

  public async create(data: CreateInstantExpenseDto): Promise<JournalEntry> {
    const response = await fetch(
      "/api/instant-expense",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify(data),
      })
    );
    return response.json();
  }
}

class InstantSaleApi {
  constructor(private init?: RequestInit) {}

  public async create(data: CreateInstantSaleDto): Promise<JournalEntry> {
    const response = await fetch(
      "/api/instant-sale",
      mergeRequestInits(this.init, {
        method: "POST",
        body: JSON.stringify(data),
      })
    );
    return response.json();
  }
}

class CompanySettingsApi {
  constructor(private init?: RequestInit) {}

  public async get(): Promise<CompanySettingsDto> {
    const response = await fetch(
      "/api/settings/company",
      mergeRequestInits(this.init)
    );
    return response.json();
  }

  public async update(
    updateCompanySettingsDto: UpdateCompanySettingsDto
  ): Promise<CompanySettingsDto> {
    const response = await fetch(
      "/api/settings/company",
      mergeRequestInits(this.init, {
        method: "PATCH",
        body: JSON.stringify(updateCompanySettingsDto),
      })
    );
    return response.json();
  }
}

export enum QueryMutationKey {
  ACCOUNTS_LIST = "accounts.list",
  ACCOUNTS_CREATE = "accounts.create",
  ACCOUNTS_GET = "accounts.get",
  ACCOUNTS_UPDATE = "accounts.update",
  ACCOUNTS_DELETE = "accounts.delete",

  ACCOUNT_SUBTYPES_LIST = "accountSubTypes.list",
  ACCOUNT_SUBTYPES_CREATE = "accountSubTypes.create",

  TRANSACTIONS_LIST = "transactions.list",

  JOURNAL_ENTRIES_GET = "journal-entries.get",

  CUSTOMERS_LIST = "customers.list",
  CUSTOMERS_GET = "customers.get",
  CUSTOMERS_CREATE = "customers.create",
  CUSTOMERS_UPDATE = "customers.update",
  CUSTOMERS_DELETE = "customers.delete",

  SUPPLIERS_LIST = "suppliers.list",
  SUPPLIERS_GET = "suppliers.get",
  SUPPLIERS_CREATE = "suppliers.create",
  SUPPLIERS_UPDATE = "suppliers.update",
  SUPPLIERS_DELETE = "suppliers.delete",

  COMPANY_SETTINGS_GET = "settings.company.get",
}

export const queryMutationKey = (
  key: QueryMutationKey,
  ...args: string[]
): string => {
  const end = args.join(".");
  return `${key}.${end}`;
};

export const api = new ApiClient({
  headers: {
    "Content-Type": "application/json",
  },
});

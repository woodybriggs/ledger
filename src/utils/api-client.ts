import {
  AccountSubTypeDto,
  CreateAccountSubTypeDto,
  ListAccountSubTypesDto,
  UpdateAccountSubTypeDto,
} from "@src/schemas/account-subtype.schema";
import {
  AccountDto,
  CreateAccountDto,
  ListAccountsQueryDto,
  UpdateAccountDto,
} from "@src/schemas/account.schema";
import qs from "query-string";
import {
  ListTransactionsQueryDto,
  TransactionDto,
} from "@src/schemas/transaction.schema";
import {
  CreateSupplierDto,
  SupplierDto,
  UpdateSupplierDto,
} from "@src/schemas/supplier.schema";
import {
  CreateCustomerDto,
  CustomerDto,
  UpdateCustomerDto,
} from "@src/schemas/customer.schema";
import {
  AddressDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "@src/schemas/address.schema";
import { CompanySettingsDto } from "@src/pages/api/settings/company";
import { UpdateCompanySettingsDto } from "@src/schemas/company-settings.schema";
import {
  CreateJournalEntryDto,
  JournalEntryDto,
} from "@src/schemas/journal-entry.schema";
import {
  CreateInstantExpenseDto,
  CreatePurchaseInvoiceDto,
  CreatePurchaseInvoicePaymentDto,
  PurchaseRecordDto,
} from "@src/schemas/purchase-record.schema";
import {
  TrialBalanceLineDto,
  TrialBalanceQueryDto,
  TrialBalanceSchema
} from "@src/schemas/trial-balance.schema";
import {
  CreateInstantSaleDto,
  CreateSaleInvoiceDto,
  CreateSaleInvoicePaymentDto,
  SaleRecordDto,
} from "@src/schemas/sale-record.schema";

class BaseApi {
  constructor(public init?: RequestInit) {}

  public async _get<TResponse>(
    url: string,
    query?: qs.StringifiableRecord
  ): Promise<TResponse> {
    const _url = qs.stringifyUrl({ url, query });
    const response = await fetch(_url, this.makeReq());
    return (await response.json()) as TResponse;
  }

  public async _post<TResponse, TDto = unknown>(
    url: string,
    dto: TDto
  ): Promise<TResponse> {
    const response = await fetch(
      url,
      this.makeReq({ method: "POST", body: JSON.stringify(dto) })
    );
    return (await response.json()) as TResponse;
  }

  public async _patch<TResponse, TDto = unknown>(
    url: string,
    dto: TDto
  ): Promise<TResponse> {
    const response = await fetch(
      url,
      this.makeReq({ method: "PATCH", body: JSON.stringify(dto) })
    );
    return (await response.json()) as TResponse;
  }

  public async _delete<TResponse, TDto = unknown>(
    url: string
  ): Promise<TResponse> {
    const response = await fetch(url, this.makeReq({ method: "DELETE" }));
    return (await response.json()) as TResponse;
  }

  private makeReq(...inits: RequestInit[]): RequestInit {
    return inits.reduce((acc, next) => ({ ...acc, ...next }), this.init || {});
  }
}


class ApiClient {
  constructor(private init?: RequestInit) {}

  public accounts = new AccountsApi(this.init);
  public accountSubTypes = new AccountSubTypesApi(this.init);

  public journalEntries = new JournalEntriesApi(this.init);
  public transactions = new TransactionsApi(this.init);

  public addresses = new AddressApi(this.init);

  public suppliers = new SuppliersApi(this.init);
  public purchaseRecords = new PurchaseRecordApi(this.init);

  public customers = new CustomersApi(this.init);
  public saleRecords = new SaleRecordApi(this.init);

  public companySettings = new CompanySettingsApi(this.init);
  public reports = new ReportsApi(this.init);
}

class AccountsApi extends BaseApi {
  public async list(query?: ListAccountsQueryDto) {
    return await this._get<{ data: AccountDto[] }>("/api/accounts", query);
  }

  public async get(accountId: string) {
    return await this._get<AccountDto>(`/api/accounts/${accountId}`);
  }

  public async create(createAccountDto: CreateAccountDto) {
    return await this._post<AccountDto>("/api/accounts", createAccountDto);
  }

  public async update(accountId: string, updateAccountDto: UpdateAccountDto) {
    return await this._patch<AccountDto>(
      `/api/accounts/${accountId}`,
      updateAccountDto
    );
  }
}

class AccountSubTypesApi extends BaseApi {
  public async list(query?: ListAccountSubTypesDto) {
    return await this._get<{ data: AccountSubTypeDto[] }>(
      "/api/account-subtypes",
      query
    );
  }

  public async get(accountId: string){
    return await this._get<AccountSubTypeDto>(
      `/api/account-subtypes/${accountId}`
    );
  }

  public async create(createAccountSubTypeDto: CreateAccountSubTypeDto) {
    return await this._post<AccountSubTypeDto>(
      "/api/account-subtypes",
      createAccountSubTypeDto
    );
  }

  public async update(
    accountSubTypeId: string,
    updateAccountSubTypeDto: UpdateAccountSubTypeDto
  ) {
    return await this._patch<AccountSubTypeDto>(
      `/api/account-subtypes/${accountSubTypeId}`,
      updateAccountSubTypeDto
    );
  }
}

class TransactionsApi extends BaseApi {
  public async list(query?: ListTransactionsQueryDto) {
    return await this._get<{ data: TransactionDto[] }>(
      "/api/transactions",
      query
    );
  }
}

class JournalEntriesApi extends BaseApi {
  public async list(query?: never) {
    return await this._get<{ data: JournalEntryDto }>(
      "/api/journal-entries/",
      query
    );
  }

  public async create(createJournalEntryDto: CreateJournalEntryDto) {
    return await this._post<JournalEntryDto>(
      "/api/journal-entries/",
      createJournalEntryDto
    );
  }

  public async get(journalEntryId: string) {
    return await this._get<JournalEntryDto>(
      `/api/journal-entries/${journalEntryId}`
    );
  }
}

class SuppliersApi extends BaseApi {
  public async list() {
    return await this._get<{ data: SupplierDto[] }>("/api/suppliers");
  }

  public async create(dto: CreateSupplierDto) {
    return await this._post<SupplierDto>("/api/suppliers", dto);
  }

  public async get(supplierId: string) {
    return await this._get<SupplierDto>(`/api/suppliers/${supplierId}`);
  }

  public async update(supplierId: string, dto: UpdateSupplierDto) {
    return await this._patch<SupplierDto>(`/api/suppliers/${supplierId}`, dto);
  }
}

class CustomersApi extends BaseApi {
  public async list() {
    return await this._get<{ data: CustomerDto[] }>("/api/customers");
  }

  public async create(dto: CreateCustomerDto) {
    return await this._post<CustomerDto>("/api/customers", dto);
  }

  public async get(customerId: string) {
    return await this._get<CustomerDto>(`/api/customers/${customerId}`);
  }

  public async update(customerId: string, dto: UpdateCustomerDto) {
    return await this._patch<CustomerDto>(`/api/customers/${customerId}`, dto);
  }
}

class AddressApi extends BaseApi {
  public async list() {
    return await this._get<{ data: AddressDto[] }>("/api/addresses");
  }

  public async create(dto: CreateAddressDto) {
    return await this._post<AddressDto>("/api/addresses", dto);
  }

  public async get(addressId: string) {
    return await this._get<AddressDto>(`/api/addresses/${addressId}`);
  }

  public async update(addressId: string, dto: UpdateAddressDto) {
    return await this._patch<AddressDto>(`/api/addresses/${addressId}`, dto);
  }
}

class PurchaseRecordApi extends BaseApi {
  public async list(query: { supplierId?: string }) {
    return await this._get<{ data: PurchaseRecordDto[] }>(
      "/api/purchase-records",
      query
    );
  }

  public async get(purchaseRecordId: string) {
    return this._get<PurchaseRecordDto>(
      `/api/purchase-records/${purchaseRecordId}`
    );
  }

  public async createInstantExpense(dto: CreateInstantExpenseDto) {
    return await this._post<PurchaseRecordDto>("/api/purchase-records", dto);
  }

  public async createPurchaseInvoice(dto: CreatePurchaseInvoiceDto) {
    return await this._post<PurchaseRecordDto>("/api/purchase-records", dto);
  }

  public async createPurchaseInvoicePayment(
    dto: CreatePurchaseInvoicePaymentDto
  ) {
    return await this._post<PurchaseRecordDto>("/api/purchase-records", dto);
  }
}

class SaleRecordApi extends BaseApi {
  public async list(query: { customerId?: string }) {
    return await this._get<{ data: SaleRecordDto[] }>(
      "/api/sale-records",
      query
    );
  }

  public async get(saleRecordId: string) {
    return await this._get<SaleRecordDto>(`/api/sale-records/${saleRecordId}`);
  }

  public async createInstantSale(dto: CreateInstantSaleDto) {
    return await this._post<SaleRecordDto>("/api/sale-records", dto);
  }

  public async createSalesInvoice(dto: CreateSaleInvoiceDto) {
    return await this._post<SaleRecordDto>("/api/sale-records", dto);
  }

  public async createSalesInvoicePayment(dto: CreateSaleInvoicePaymentDto) {
    return await this._post<SaleRecordDto>("/api/sale-records", dto);
  }
}

class CompanySettingsApi extends BaseApi {
  public async get() {
    return await this._get<CompanySettingsDto>("/api/settings/company");
  }

  public async update(updateCompanySettingsDto: UpdateCompanySettingsDto) {
    return await this._patch<CompanySettingsDto>(
      "/api/settings/company",
      updateCompanySettingsDto
    );
  }
}

class ReportsApi extends BaseApi {
  public async trialBalance(query: TrialBalanceQueryDto) {
    const trialBalance = await this._get<{ data: TrialBalanceLineDto[] }>(
      "/api/reports/trial-balance",
      {
        fromDate: query.fromDate.toISOString(),
        toDate: query.toDate.toISOString(),
      }
    );

    const result = TrialBalanceSchema.parse(trialBalance)
    return result
  }

  public exportTrialBalance(query: TrialBalanceQueryDto): string {
    const url = qs.stringifyUrl({
      url: "/api/reports/trial-balance/export",
      query: {
        fromDate: query.fromDate.toISOString(),
        toDate: query.toDate.toISOString(),
      },
    });
    return url;
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

  PURCHASE_RECORDS_LIST = "purchase-records.list",
  PURCHASE_RECORDS_GET = "purchase-records.get",
  PURCHASE_RECORDS_CREATE = "purchase-records.create",

  SALE_RECORDS_LIST = "sale-records.list",
  SALE_RECORDS_GET = "sale-records.get",
  SALE_RECORDS_CREATE = "sale-records.create",

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

  TRIAL_BALANCE_GET = "reports.trial-balance.get",
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

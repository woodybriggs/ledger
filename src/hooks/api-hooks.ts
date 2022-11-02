import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCurrencyPrecision } from "@src/components/CurrencySelect";
import { api, QueryMutationKey } from "@src/utils/api-client";

export type Denomination = {
  tick: string;
  decimalPlaces: number;
};

export const useRootDenomination = (): UseQueryResult<Denomination, unknown> =>
  useQuery(
    [QueryMutationKey.ACCOUNTS_GET, "root", "denomination"],
    async () => {
      const a = await api.accounts.get("root");
      return {
        tick: a.denomination,
        decimalPlaces: getCurrencyPrecision(a.denomination),
      };
    }
  );

export const useRootAccount = () =>
  useQuery([QueryMutationKey.ACCOUNTS_GET, "root"], () =>
    api.accounts.get("root")
  );

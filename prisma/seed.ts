import { presetAccounts } from "@src/constants/accounts";
import { presetLedgers } from "@src/constants/ledgers";
import { clousreTableRepo } from "./basic-config";
import { client } from "./db-client";


(async () => {
  const [chartAccount, ...rest] = presetAccounts;

  await client.account.create({
    data: {
      accountId: chartAccount.accountId,
      name: chartAccount.name,
      number: chartAccount.number,
      category: chartAccount.category,
      type: chartAccount.type
    }
  })
  await clousreTableRepo.insertSelfRef(chartAccount.accountId)

  for (let account of rest) {
    await client.account.create({
      data: {
        accountId: account.accountId,
        name: account.name,
        number: account.number,
        category: account.category,
        type: account.type
      }
    })

    await clousreTableRepo.insertSelfRef(account.accountId)
    await clousreTableRepo.insertChild(chartAccount.accountId, account.accountId)
  }

  for (const ledger of presetLedgers) {
    await client.ledger.create({
      data: {
        name: ledger.name,
        ledgerId: ledger.ledgerId,
        ledgerType: ledger.ledgerType
      }
    })
  }
})()
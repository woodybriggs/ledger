import { presetAccounts } from "../src/constants/accounts";
import { presetLedgers } from "../src/constants/ledgers";
import { basicAccounts, basicSuppliers, clousreTableRepo } from "./basic-config";
import { client } from "./db-client";

(async () => {

  for (let ledger of presetLedgers) {
    await client.ledger.create({
      data: ledger
    })
  }

  const [rootAccount, ...rest] = presetAccounts;

  await client.account.create({data: { 
    accountId: rootAccount.accountId,
    name: rootAccount.name,
    number: rootAccount.number,
    category: rootAccount.category,
    type: rootAccount.type,
    denomination: 'GBP' 
  }})
  await clousreTableRepo.insertSelfRef(rootAccount.accountId)

  for (let account of rest) {
    await client.account.create({
      data: {
        accountId: account.accountId,
        name: account.name,
        number: account.number,
        category: account.category,
        type: account.type,
        denomination: 'GBP'
      }
    })

    await clousreTableRepo.insertSelfRef(account.accountId)
    await clousreTableRepo.insertChild(rootAccount.accountId, account.accountId)
  }

  for (let account of basicAccounts) {
    const createdAccount = await client.account.create({
      data: {
        name: account.name,
        number: account.number,
        category: account.category,
        type: account.type,
        denomination: 'GBP'
      }
    })

    await clousreTableRepo.insertSelfRef(createdAccount.accountId)
    await clousreTableRepo.insertChild(rootAccount.accountId, createdAccount.accountId)
  }

  for (let supplier of basicSuppliers) {
    await client.supplier.create({
      data: {...supplier}
    })
  }
})()
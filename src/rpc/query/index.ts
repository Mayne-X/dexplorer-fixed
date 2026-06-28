import {
  Account,
  Block,
  Coin,
  IndexedTx,
  StargateClient,
} from '@cosmjs/stargate'
import { Tendermint37Client, ValidatorsResponse } from '@cosmjs/tendermint-rpc'

const clientCache = new WeakMap<Tendermint37Client, Promise<StargateClient>>()

async function getClient(
  tmClient: Tendermint37Client
): Promise<StargateClient> {
  if (!clientCache.has(tmClient)) {
    clientCache.set(tmClient, StargateClient.create(tmClient))
  }
  return clientCache.get(tmClient)!
}

export async function getChainId(
  tmClient: Tendermint37Client
): Promise<string> {
  const client = await getClient(tmClient)
  return client.getChainId()
}

export async function getValidators(
  tmClient: Tendermint37Client
): Promise<ValidatorsResponse> {
  return tmClient.validatorsAll()
}

export async function getBlock(
  tmClient: Tendermint37Client,
  height: number
): Promise<Block> {
  const client = await getClient(tmClient)
  return client.getBlock(height)
}

export async function getTx(
  tmClient: Tendermint37Client,
  hash: string
): Promise<IndexedTx | null> {
  const client = await getClient(tmClient)
  return client.getTx(hash)
}

export async function getAccount(
  tmClient: Tendermint37Client,
  address: string
): Promise<Account | null> {
  const client = await getClient(tmClient)
  return client.getAccount(address)
}

export async function getAllBalances(
  tmClient: Tendermint37Client,
  address: string
): Promise<readonly Coin[]> {
  const client = await getClient(tmClient)
  return client.getAllBalances(address)
}

export async function getBalanceStaked(
  tmClient: Tendermint37Client,
  address: string
): Promise<Coin | null> {
  const client = await getClient(tmClient)
  return client.getBalanceStaked(address)
}

export async function getTxsBySender(
  tmClient: Tendermint37Client,
  address: string,
  page: number,
  perPage: number
) {
  // Validate address format before using it in query to prevent injection attacks
  // The regex checks for valid bech32 format ( Cosmos addresses )
  const validAddressRegex = /^[a-z\d]+1[a-z\d]{38,58}$/
  if (!validAddressRegex.test(address)) {
    throw new Error('Invalid address format for transaction search')
  }

  // Use the validated address directly - it's already confirmed to be safe bech32 format
  return tmClient.txSearch({
    query: `message.sender='${address}'`,
    prove: true,
    order_by: 'desc',
    page: page,
    per_page: perPage,
  })
}

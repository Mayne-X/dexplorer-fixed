import { replaceHTTPtoWebsocket, isValidUrl } from '@/utils/helper'
import { Tendermint37Client, WebsocketClient } from '@cosmjs/tendermint-rpc'
import { StreamingSocket } from '@cosmjs/socket'

export async function validateConnection(rpcAddress: string): Promise<boolean> {
  // Check if URL is valid format first
  if (!isValidUrl(rpcAddress)) {
    console.error('Invalid URL format:', rpcAddress)
    return false
  }

  return new Promise((resolve) => {
    const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
    const path = wsUrl.endsWith('/') ? 'websocket' : '/websocket'
    const socket = new StreamingSocket(wsUrl + path, 3000)

    // Keep track of whether we've already resolved to prevent multiple callbacks
    let resolved = false
    const safeResolve = (value: boolean) => {
      if (!resolved) {
        resolved = true
        resolve(value)
      }
    }

    socket.events.subscribe({
      error: () => {
        // Socket error occurred - clean up the socket and resolve false
        socket.disconnect()
        safeResolve(false)
      },
    })

    socket.connect()
    socket.connected
      .then(() => {
        // Connection successful but we only needed to verify connectivity
        // Disconnect immediately to avoid keeping the socket open (memory leak)
        socket.disconnect()
        safeResolve(true)
      })
      .catch((err) => {
        console.error('Connection validation failed:', err)
        socket.disconnect()
        safeResolve(false)
      })
  })
}

export async function connectWebsocketClient(
  rpcAddress: string
): Promise<Tendermint37Client> {
  // Check if URL is valid format first
  if (!isValidUrl(rpcAddress)) {
    throw new Error('Invalid RPC URL format')
  }

  return new Promise((resolve, reject) => {
    try {
      const wsUrl = replaceHTTPtoWebsocket(rpcAddress)
      const wsClient = new WebsocketClient(wsUrl, (err) => {
        reject(err)
      })
      Tendermint37Client.create(wsClient)
        .then(async (tmClient) => {
          if (!tmClient) {
            reject(new Error('cannot create tendermint client'))
            return
          }

          try {
            const status = await tmClient.status()
            if (!status) {
              reject(new Error('cannot get client status'))
              return
            }
            resolve(tmClient)
          } catch (err) {
            reject(err)
          }
        })
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

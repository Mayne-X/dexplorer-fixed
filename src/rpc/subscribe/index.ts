import { NewBlockEvent, Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { TxEvent } from '@cosmjs/tendermint-rpc/build/tendermint37'
import { Subscription } from 'xstream'

// Error handler type for subscription errors - allows callers to handle errors their own way
type ErrorHandler = (err: Error) => void

export function subscribeNewBlock(
  tmClient: Tendermint37Client,
  callback: (event: NewBlockEvent) => void,
  onError?: ErrorHandler
): Subscription {
  const stream = tmClient.subscribeNewBlock()
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event)
    },
    error: (err) => {
      // Log the error for debugging purposes
      console.error('Block subscription error:', err)
      // Call the error handler if provided, so the app can show user-friendly error messages
      if (onError) {
        onError(err as Error)
      }
      // Clean up the subscription to prevent zombie subscriptions
      subscription.unsubscribe()
    },
  })

  return subscription
}

export function subscribeTx(
  tmClient: Tendermint37Client,
  callback: (event: TxEvent) => void,
  onError?: ErrorHandler
): Subscription {
  const stream = tmClient.subscribeTx()
  const subscription = stream.subscribe({
    next: (event) => {
      callback(event)
    },
    error: (err) => {
      // Log the error for debugging purposes
      console.error('Transaction subscription error:', err)
      // Call the error handler if provided, so the app can show user-friendly error messages
      if (onError) {
        onError(err as Error)
      }
      // Clean up the subscription to prevent zombie subscriptions
      subscription.unsubscribe()
    },
  })

  return subscription
}

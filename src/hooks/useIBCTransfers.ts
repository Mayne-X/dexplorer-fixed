import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTransactions } from '@/store/streamSlice'
import { useClientStore } from '@/store/clientStore'

export interface IBCTransfer {
  hash: string
  height: string
  timestamp: string
  sender: string
  receiver: string
  sourceChannel: string
  sourcePort: string
  destinationChannel: string
  destinationPort: string
  amount: string
  denom: string
  memo: string
  status: 'success' | 'failed'
}

export const useIBCTransfers = () => {
  const transactions = useSelector(selectTransactions)
  const tmClient = useClientStore((state) => state.tmClient)

  const [ibcTransfers, setIbcTransfers] = useState<IBCTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!tmClient) return

    setIsLoading(true)

    // Defer processing so isLoading renders before blocking
    const timer = setTimeout(() => {
      // Filter transactions that contain IBC transfers
      const transfers: IBCTransfer[] = []

      for (const tx of transactions) {
        try {
          // Check for failed status
          const isSuccess = tx.result.code === 0

          // Look for IBC transfer events
          const events = tx.result.events || []
          let sender = ''
          let receiver = ''
          let sourceChannel = ''
          let sourcePort = ''
          let destinationChannel = ''
          let destinationPort = ''
          let amount = ''
          let denom = ''
          let memo = ''

          // Extract IBC-related attributes from events
          for (const event of events) {
            for (const attr of event.attributes) {
              const key = attr.key
              const value = attr.value

              if (key === 'sender') sender = value
              if (key === 'receiver') receiver = value
              if (key === 'source_channel') sourceChannel = value
              if (key === 'source_port') sourcePort = value
              if (key === 'destination_channel') destinationChannel = value
              if (key === 'destination_port') destinationPort = value
              if (key === 'amount') amount = value
              if (key === 'denom') denom = value
              if (key === 'memo') memo = value
            }
          }

          // If we have IBC transfer data, this is an IBC transaction
          if (sourceChannel || sourcePort || sender || receiver) {
            transfers.push({
              hash: tx.hash,
              height: tx.height,
              timestamp: tx.timestamp,
              sender,
              receiver,
              sourceChannel,
              sourcePort,
              destinationChannel,
              destinationPort,
              amount,
              denom,
              memo,
              status: isSuccess ? 'success' : 'failed',
            })
          }
        } catch (error) {
          console.warn('Error parsing IBC transfer:', error)
        }
      }

      // Sort by height descending
      transfers.sort((a, b) => parseInt(b.height) - parseInt(a.height))

      setIbcTransfers(transfers.slice(0, 100)) // Limit to 100 most recent
      setIsLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [transactions, tmClient])

  return {
    ibcTransfers,
    isLoading,
    hasTransfers: ibcTransfers.length > 0,
  }
}

// Helper to format IBC channel ID for display
export const formatIBCChannel = (channelId: string): string => {
  if (!channelId) return 'N/A'
  return channelId.length > 10 ? channelId.slice(0, 10) + '...' : channelId
}

// Helper to format IBC token amount
export const formatIBCAmount = (amount: string, denom: string): string => {
  if (!amount) return '0'

  // Try to convert based on denom prefix
  let formattedAmount = amount
  if (denom.startsWith('u') && amount.length > 6) {
    formattedAmount = (parseFloat(amount) / 1e6).toFixed(6)
  } else if (denom.startsWith('a') && amount.length > 18) {
    formattedAmount = (parseFloat(amount) / 1e18).toFixed(18)
  }

  return `${formattedAmount} ${denom.split('/').pop() || denom}`
}

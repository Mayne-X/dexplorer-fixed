import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import {
  selectTxEvent,
  selectBlocks,
  selectTotalActiveValidator,
  setTotalActiveValidator,
} from '@/store/streamSlice'
import { queryActiveValidators } from '@/rpc/abci'
import { getNetworkStatus } from '@/rpc/query'
import { useClientStore } from '@/store/clientStore'

export const useHomeData = () => {
  const dispatch = useDispatch()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const tmClient = useClientStore((state) => state.tmClient)
  const totalActiveValidator = useSelector(selectTotalActiveValidator)
  const persistentBlocks = useSelector(selectBlocks)
  const txEvent = useSelector(selectTxEvent)

  // Count transactions - this counter resets to 0 whenever the client disconnects
  // We track the previous count so we can detect when txEvent actually increments
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [blockTime, setBlockTime] = useState('--')

  // Network status data
  const [networkStatus, setNetworkStatus] = useState<{
    blockHeight: number
    catchingUp: boolean
    peers: number
    chainId: string
  }>({
    blockHeight: 0,
    catchingUp: false,
    peers: 0,
    chainId: '',
  })

  const isConnected = connectState

  // Track loading state - starts true and stays until we get first block data
  const [isLoading, setIsLoading] = useState(true)

  // Reset transaction counter when connection state changes to disconnected
  // This prevents the counter from just keeps incrementing on every page load
  useEffect(() => {
    if (!isConnected) {
      setTotalTransactions(0)
    }
  }, [isConnected])

  // Fetch network status when connected
  useEffect(() => {
    if (!tmClient) return

    const fetchNetworkStatus = async () => {
      try {
        const status = await getNetworkStatus(tmClient)
        setNetworkStatus({
          blockHeight: status.blockHeight,
          catchingUp: status.catchingUp,
          peers: status.peered,
          chainId: status.chainId,
        })
      } catch (error) {
        console.error('Failed to fetch network status:', error)
        // Keep default values on error
      }
    }

    fetchNetworkStatus()
    // Refresh network status every 10 seconds
    const interval = setInterval(fetchNetworkStatus, 10000)
    return () => clearInterval(interval)
  }, [tmClient, isConnected])

  // Real blockchain data - get latest block from persistent blocks
  const latestBlock =
    persistentBlocks.length > 0
      ? parseInt(persistentBlocks[0].header.height)
      : null

  // Calculate average block time based on first and most recent blocks
  useEffect(() => {
    if (persistentBlocks.length >= 2) {
      const recentBlock = persistentBlocks[0] // Most recent block
      const firstBlock = persistentBlocks[persistentBlocks.length - 1] // Oldest block in the array

      const recentHeight = parseInt(recentBlock.header.height)
      const firstHeight = parseInt(firstBlock.header.height)
      const recentTime = new Date(recentBlock.header.time).getTime()
      const firstTime = new Date(firstBlock.header.time).getTime()

      const heightDiff = recentHeight - firstHeight
      const timeDiff = (recentTime - firstTime) / 1000 // Convert to seconds

      if (heightDiff > 0) {
        const avgBlockTime = timeDiff / heightDiff
        setBlockTime(`${avgBlockTime.toFixed(1)}s`)
      }
    } else if (persistentBlocks.length === 1) {
      // Fallback to default when only one block is available
      setBlockTime('--')
    }
  }, [persistentBlocks])

  // Count transactions
  useEffect(() => {
    if (txEvent) {
      setTotalTransactions((prev) => prev + 1)
    }
  }, [txEvent])

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Fetch active validators if connected
    if (tmClient) {
      queryActiveValidators(tmClient, 0, 10).then((response) => {
        if (response.pagination?.total) {
          dispatch(setTotalActiveValidator(Number(response.pagination.total)))
        }
      })
    }

    return () => clearTimeout(timer)
  }, [tmClient, dispatch])

  return {
    isConnected,
    isLoading,
    latestBlock,
    totalTransactions,
    blockTime,
    totalActiveValidator,
    networkStatus,
  }
}

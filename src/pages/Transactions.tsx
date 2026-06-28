import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiChevronRight,
  FiActivity,
  FiClock,
  FiUser,
  FiHash,
  FiFilter,
  FiX,
  FiDownload,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  trimHash,
  timeFromNow,
  getTypeMsg,
  getActionFromAttributes,
  exportTransactionsToCSV,
  exportTransactionsToJSON,
} from '@/utils/helper'
import { RootState } from '@/store'
import { selectTransactions } from '@/store/streamSlice'
import SearchBar from '@/components/ui/SearchBar'
import CopyText from '@/components/ui/CopyText'
import { Button } from '@/components/ui/Button'

// Transaction type options for filtering
const TX_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Send', label: 'Send' },
  { value: 'Delegate', label: 'Delegate' },
  { value: 'Undelegate', label: 'Undelegate' },
  { value: 'WithdrawDelegatorReward', label: 'Withdraw Rewards' },
  { value: 'Vote', label: 'Vote' },
  { value: 'SubmitProposal', label: 'Submit Proposal' },
  { value: 'Deposit', label: 'Deposit' },
  { value: 'Transfer', label: 'IBC Transfer' },
  { value: 'Execute', label: 'Execute' },
  { value: 'Grant', label: 'Grant' },
  { value: 'Revoke', label: 'Revoke' },
]

// Status options for filtering
const TX_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const Transactions: React.FC = () => {
  const { colors } = useTheme()
  // Get persistent transaction data from Redux store
  const transactions = useSelector(selectTransactions)
  const { connectState } = useSelector((state: RootState) => state.connect)

  // Filter state
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchHash, setSearchHash] = useState('')

  // Check if any filters are active
  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || searchHash !== ''

  // Helper function to get transaction status
  const getTransactionStatus = (
    result: { code: number } | null | undefined
  ): 'success' | 'failed' => {
    if (!result) return 'failed'
    return result.code === 0 ? 'success' : 'failed'
  }

  // Extract message type from transaction
  const getTxType = (events: any[] | undefined): string => {
    if (!events) return ''
    const messages = events.filter((e) => {
      if (e.type === 'message') {
        return e.attributes.some((a: any) => a.key === 'action' && a.value)
      }
      return false
    })
    if (messages.length > 0) {
      return getTypeMsg(getActionFromAttributes(messages[0].attributes))
    }
    return ''
  }

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((tx) => {
        const txType = getTxType(tx.result?.events)
        return txType.toLowerCase().includes(typeFilter.toLowerCase())
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx) => {
        const status = getTransactionStatus(tx.result)
        return status === statusFilter
      })
    }

    // Filter by hash search
    if (searchHash) {
      filtered = filtered.filter((tx) =>
        tx.hash.toLowerCase().includes(searchHash.toLowerCase())
      )
    }

    return filtered
  }, [transactions, typeFilter, statusFilter, searchHash])

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setSearchHash('')
  }

  const renderEventMessages = (
    events:
      | {
          type: string
          attributes: { key: string; value: string; index: boolean }[]
        }[]
      | undefined
  ) => {
    try {
      if (!events || !events.length)
        return <span className="text-xs opacity-60">No data</span>

      const messages = events.filter((e) => {
        if (e.type === 'message') {
          const hasAction = e.attributes.some((a) => {
            if (a.key === 'action') {
              return a.value
            }
          })

          if (hasAction) {
            return e.attributes
          }
        }
      })

      if (messages.length === 1) {
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: colors.primary + '20',
              color: colors.primary,
            }}
          >
            {getTypeMsg(getActionFromAttributes(messages[0].attributes))}
          </span>
        )
      } else if (messages.length > 1) {
        const otherTypes = messages
          .slice(1)
          .map((m) => getTypeMsg(getActionFromAttributes(m.attributes)))
          .join(', ')

        return (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors.primary + '20',
                color: colors.primary,
              }}
            >
              {getTypeMsg(getActionFromAttributes(messages[0].attributes))}
            </span>
            <span
              className="text-xs font-medium cursor-help"
              style={{ color: colors.primary }}
              title={otherTypes}
            >
              +{messages.length - 1}
            </span>
          </div>
        )
      }
    } catch (error) {
      console.error('Error decoding events:', error)
      return <span className="text-xs opacity-60">Invalid data</span>
    }

    return <span className="text-xs opacity-60">No messages</span>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return colors.status.success
      case 'failed':
        return colors.status.error
      case 'pending':
        return colors.status.warning
      default:
        return colors.text.secondary
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Link
          to="/"
          className="hover:opacity-70 transition-opacity font-medium"
          style={{ color: colors.text.secondary }}
        >
          Home
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span className="font-bold" style={{ color: colors.text.primary }}>
          Transactions
        </span>
      </div>

      {/* Search Section */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: colors.text.primary }}
        >
          Search Transaction
        </h2>
        <SearchBar placeholder="Enter transaction hash..." basePath="/txs" />
      </div>

      {/* Recent Transactions */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                Recent Transactions
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                Latest transactions on the network
                {hasActiveFilters && (
                  <span className="ml-2 text-xs" style={{ color: colors.primary }}>
                    ({filteredTransactions.length} filtered)
                  </span>
                )}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border.secondary}`,
                    color: colors.text.primary,
                  }}
                >
                  {TX_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FiFilter
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: colors.text.tertiary }}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-lg text-sm appearance-none cursor-pointer"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border.secondary}`,
                    color: colors.text.primary,
                  }}
                >
                  {TX_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <FiActivity
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: colors.text.tertiary }}
                />
              </div>

              {/* Hash Search */}
              <input
                type="text"
                placeholder="Search by hash..."
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm w-40"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border.secondary}`,
                  color: colors.text.primary,
                }}
              />

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  <FiX className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}

              {/* Export Buttons */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: colors.border.secondary }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactionsToCSV(filteredTransactions)}
                    className="text-xs"
                    title="Export to CSV"
                  >
                    <FiDownload className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactionsToJSON(filteredTransactions)}
                    className="text-xs"
                    title="Export to JSON"
                  >
                    <FiDownload className="w-3 h-3 mr-1" />
                    JSON
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: colors.border.secondary }}
              >
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiHash className="w-4 h-4" />
                    Hash
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Height
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    Messages
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiActivity className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Time
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 50).map((tx, index) => {
                const status = getTransactionStatus(tx.result)
                return (
                  <tr
                    key={`${tx.hash}-${index}`}
                    className="border-b hover:bg-opacity-50 transition-colors duration-200"
                    style={{
                      borderColor: colors.border.secondary,
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/txs/${tx.hash}`}
                          className="hover:opacity-70 transition-opacity font-mono text-sm"
                          style={{ color: colors.primary }}
                        >
                          {tx.hash ? (
                            <CopyText
                              text={tx.hash}
                              displayText={trimHash(tx.hash)}
                              className="text-sm"
                              style={{ color: colors.text.secondary }}
                            />
                          ) : (
                            'Unknown'
                          )}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/blocks/${tx.height}`}
                        className="hover:opacity-70 transition-opacity font-mono"
                        style={{ color: colors.primary }}
                      >
                        {tx.height}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {renderEventMessages(tx.result?.events)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: getStatusColor(status) + '20',
                          color: getStatusColor(status),
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        {timeFromNow(tx.timestamp)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!connectState && (
            <div className="text-center py-12">
              <FiActivity
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                Not connected to blockchain
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Please connect to an RPC endpoint to view transactions
              </p>
            </div>
          )}

          {connectState && filteredTransactions.length === 0 && transactions.length > 0 && hasActiveFilters && (
            <div className="text-center py-12">
              <FiFilter
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No transactions match your filters
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Try adjusting your filter criteria
              </p>
            </div>
          )}

          {connectState && transactions.length === 0 && !hasActiveFilters && (
            <div className="text-center py-12">
              <FiActivity
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                style={{ color: colors.text.tertiary }}
              />
              <p style={{ color: colors.text.secondary }}>
                No transactions yet
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: colors.text.tertiary }}
              >
                Transactions will appear here when they occur on the network
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transactions

import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiChevronRight,
  FiArrowRight,
  FiActivity,
  FiClock,
  FiHash,
  FiCheckCircle,
  FiXCircle,
  FiLink,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import {
  useIBCTransfers,
  formatIBCChannel,
  formatIBCAmount,
} from '@/hooks/useIBCTransfers'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import CopyText from '@/components/ui/CopyText'

const IBCTransfers: React.FC = () => {
  const { colors } = useTheme()
  const { ibcTransfers, isLoading, hasTransfers } = useIBCTransfers()
  const { connectState } = useSelector((state: RootState) => state.connect)

  const getStatusColor = (status: 'success' | 'failed') => {
    return status === 'success' ? colors.status.success : colors.status.error
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
          IBC Transfers
        </span>
      </div>

      {/* Header */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FiLink className="w-6 h-6" style={{ color: colors.status.info }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            IBC Transfers
          </h1>
        </div>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          Track Inter-Blockchain Communication token transfers between chains
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiActivity
              className="w-5 h-5"
              style={{ color: colors.status.info }}
            />
            <span className="text-sm" style={{ color: colors.text.secondary }}>
              Total Transfers
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {ibcTransfers.length}
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiCheckCircle
              className="w-5 h-5"
              style={{ color: colors.status.success }}
            />
            <span className="text-sm" style={{ color: colors.text.secondary }}>
              Successful
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {ibcTransfers.filter((t) => t.status === 'success').length}
          </p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <FiXCircle
              className="w-5 h-5"
              style={{ color: colors.status.error }}
            />
            <span className="text-sm" style={{ color: colors.text.secondary }}>
              Failed
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {ibcTransfers.filter((t) => t.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* IBC Transfers List */}
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
          Recent IBC Transfers
        </h2>

        {!connectState ? (
          <div className="text-center py-12">
            <FiActivity
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: colors.text.tertiary }}
            />
            <p style={{ color: colors.text.secondary }}>
              Not connected to blockchain
            </p>
            <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
              Please connect to an RPC endpoint to view IBC transfers
            </p>
          </div>
        ) : !hasTransfers && !isLoading ? (
          <div className="text-center py-12">
            <FiLink
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: colors.text.tertiary }}
            />
            <p style={{ color: colors.text.secondary }}>No IBC transfers yet</p>
            <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
              IBC transfers will appear here when they occur on the network
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ibcTransfers.map((transfer, index) => (
              <div
                key={`${transfer.hash}-${index}`}
                className="rounded-lg p-4 border transition-colors hover:bg-opacity-50"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border.secondary,
                }}
              >
                {/* Transfer Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(transfer.status) + '20',
                        color: getStatusColor(transfer.status),
                      }}
                    >
                      {transfer.status === 'success' ? (
                        <>
                          <FiCheckCircle className="w-3 h-3 inline mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3 inline mr-1" />
                          Failed
                        </>
                      )}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: colors.status.info + '20',
                        color: colors.status.info,
                      }}
                    >
                      IBC
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock
                      className="w-4 h-4"
                      style={{ color: colors.text.tertiary }}
                    />
                    <span style={{ color: colors.text.secondary }}>
                      {new Date(transfer.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Sender and Receiver */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      From
                    </span>
                    <CopyText
                      text={transfer.sender}
                      displayText={transfer.sender.slice(0, 20) + '...'}
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    />
                  </div>

                  <FiArrowRight
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: colors.primary }}
                  />

                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      To
                    </span>
                    <CopyText
                      text={transfer.receiver}
                      displayText={transfer.receiver.slice(0, 20) + '...'}
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    />
                  </div>
                </div>

                {/* Channel Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      Source Channel
                    </span>
                    <span
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {formatIBCChannel(transfer.sourceChannel)}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      Source Port
                    </span>
                    <span
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {transfer.sourcePort || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      Dest Channel
                    </span>
                    <span
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {formatIBCChannel(transfer.destinationChannel)}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-xs block"
                      style={{ color: colors.text.tertiary }}
                    >
                      Dest Port
                    </span>
                    <span
                      className="font-mono text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {transfer.destinationPort || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Amount and Hash */}
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: colors.border.secondary }}
                >
                  <div>
                    {transfer.amount && transfer.denom && (
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text.primary }}
                      >
                        {formatIBCAmount(transfer.amount, transfer.denom)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHash
                      className="w-4 h-4"
                      style={{ color: colors.text.tertiary }}
                    />
                    <Link
                      to={`/txs/${transfer.hash}`}
                      className="text-sm hover:underline font-mono"
                      style={{ color: colors.primary }}
                    >
                      {transfer.hash.slice(0, 16)}...
                    </Link>
                  </div>
                </div>

                {/* Memo */}
                {transfer.memo && (
                  <div
                    className="mt-2 pt-2 border-t"
                    style={{ borderColor: colors.border.secondary }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: colors.text.tertiary }}
                    >
                      Memo:
                    </span>
                    <span
                      className="text-sm ml-2 font-mono"
                      style={{ color: colors.text.secondary }}
                    >
                      {transfer.memo}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default IBCTransfers

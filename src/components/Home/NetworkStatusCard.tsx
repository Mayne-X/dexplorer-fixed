import React from 'react'
import { useTheme } from '@/theme/ThemeProvider'
import { FiActivity, FiRefreshCw } from 'react-icons/fi'

interface NetworkStatusCardProps {
  isConnected: boolean
  catchingUp?: boolean
  syncedHeight?: number
  peers?: number
}

const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({
  isConnected,
  catchingUp = false,
  syncedHeight = 0,
  peers = 0,
}) => {
  const { colors } = useTheme()

  return (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <h3
        className="text-lg font-bold mb-4 tracking-tight"
        style={{ color: colors.text.primary }}
      >
        Network Status
      </h3>

      <div className="space-y-4">
        {/* Network Health / Sync Status */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Sync Status
          </span>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: !isConnected
                  ? colors.status.error
                  : catchingUp
                  ? colors.status.warning
                  : colors.status.success,
              }}
            ></div>
            <span
              className="text-sm font-semibold"
              style={{
                color: !isConnected
                  ? colors.status.error
                  : catchingUp
                  ? colors.status.warning
                  : colors.status.success,
              }}
            >
              {!isConnected
                ? 'Disconnected'
                : catchingUp
                ? 'Syncing...'
                : 'Synced'}
            </span>
          </div>
        </div>

        {/* Block Height */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Block Height
          </span>
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: colors.text.primary }}
          >
            {isConnected ? syncedHeight.toLocaleString() : 'N/A'}
          </span>
        </div>

        {/* Connected Peers */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Connected Peers
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: colors.text.primary }}
          >
            {isConnected ? peers : 'N/A'}
          </span>
        </div>

        {/* Chain ID */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: colors.text.secondary }}
          >
            Chain ID
          </span>
          <span
            className="text-xs font-mono truncate max-w-[120px]"
            style={{ color: colors.text.tertiary }}
            title="Chain identifier"
          >
            {isConnected ? 'Connected' : 'N/A'}
          </span>
        </div>

        {/* Consensus participation indicator */}
        {isConnected && (
          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: colors.border.secondary }}>
            <FiRefreshCw
              className="w-4 h-4"
              style={{ color: colors.status.success }}
            />
            <span className="text-xs" style={{ color: colors.text.tertiary }}>
              {catchingUp ? 'Catching up to consensus' : 'Participating in consensus'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default NetworkStatusCard

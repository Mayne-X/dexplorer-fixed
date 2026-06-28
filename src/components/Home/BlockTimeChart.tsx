import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/theme/ThemeProvider'
import { selectBlocks } from '@/store/streamSlice'
import { FiClock } from 'react-icons/fi'

interface BlockTimeData {
  height: number
  blockTime: number
  timestamp: Date
}

const BlockTimeChart: React.FC = () => {
  const { colors } = useTheme()
  const persistentBlocks = useSelector(selectBlocks)

  // Calculate block times from the persistent blocks
  const blockTimeData = useMemo((): BlockTimeData[] => {
    if (persistentBlocks.length < 2) return []

    const data: BlockTimeData[] = []
    const sortedBlocks = [...persistentBlocks].sort(
      (a, b) => parseInt(a.header.height) - parseInt(b.header.height)
    )

    for (let i = 1; i < sortedBlocks.length; i++) {
      const current = sortedBlocks[i]
      const previous = sortedBlocks[i - 1]

      const currentTime = new Date(current.header.time).getTime()
      const previousTime = new Date(previous.header.time).getTime()
      const blockTime = (currentTime - previousTime) / 1000 // seconds

      // Skip if block time is unreasonable (more than 30 seconds or negative)
      if (blockTime > 0 && blockTime < 30) {
        data.push({
          height: parseInt(current.header.height),
          blockTime: parseFloat(blockTime.toFixed(2)),
          timestamp: new Date(current.header.time),
        })
      }
    }

    // Take the last 20 data points for the chart
    return data.slice(-20)
  }, [persistentBlocks])

  // Chart dimensions
  const width = 400
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }

  // Calculate chart scales
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxBlockTime = Math.max(...blockTimeData.map((d) => d.blockTime), 7) // minimum 7 for scale
  const minBlockTime = 0

  // Scale functions
  const xScale = (index: number) =>
    padding.left + (index / (blockTimeData.length - 1 || 1)) * chartWidth
  const yScale = (value: number) =>
    padding.top +
    ((maxBlockTime - value) / (maxBlockTime - minBlockTime)) * chartHeight

  // Generate path for the line chart
  const linePath = blockTimeData.length
    ? blockTimeData
        .map((d, i) => {
          const x = xScale(i)
          const y = yScale(d.blockTime)
          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
        })
        .join(' ')
    : ''

  // Generate area fill path
  const areaPath =
    blockTimeData.length > 1
      ? `${linePath} L ${xScale(blockTimeData.length - 1)} ${height - padding.bottom} L ${xScale(0)} ${height - padding.bottom} Z`
      : ''

  // Average block time
  const avgBlockTime =
    blockTimeData.length > 0
      ? (
          blockTimeData.reduce((sum, d) => sum + d.blockTime, 0) /
          blockTimeData.length
        ).toFixed(2)
      : '0'

  if (blockTimeData.length < 2) {
    return (
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="w-5 h-5" style={{ color: colors.status.info }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Block Time
          </h3>
        </div>
        <div
          className="flex items-center justify-center h-48 text-sm"
          style={{ color: colors.text.tertiary }}
        >
          Need at least 2 blocks to show chart
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiClock className="w-5 h-5" style={{ color: colors.status.info }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Block Time
          </h3>
        </div>
        <div className="text-right">
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {avgBlockTime}s
          </p>
          <p className="text-xs" style={{ color: colors.text.tertiary }}>
            Avg (last {blockTimeData.length} blocks)
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-hidden">
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {[0, 2, 4, 6].map((value) => (
            <g key={value}>
              <line
                x1={padding.left}
                y1={yScale(value)}
                x2={width - padding.right}
                y2={yScale(value)}
                stroke={colors.border.secondary}
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 8}
                y={yScale(value) + 4}
                textAnchor="end"
                fontSize="10"
                fill={colors.text.tertiary}
              >
                {value}s
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={colors.primary + '20'} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {blockTimeData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(d.blockTime)}
              r="3"
              fill={colors.primary}
            />
          ))}

          {/* X-axis labels (block heights) */}
          {[
            0,
            Math.floor(blockTimeData.length / 2),
            blockTimeData.length - 1,
          ].map((index) => (
            <text
              key={index}
              x={xScale(index)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={colors.text.tertiary}
            >
              #{blockTimeData[index]?.height.toLocaleString()}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-4 mt-3 text-xs"
        style={{ color: colors.text.tertiary }}
      >
        <span>
          Block height range: #{blockTimeData[0]?.height.toLocaleString()} - #
          {blockTimeData[blockTimeData.length - 1]?.height.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default BlockTimeChart

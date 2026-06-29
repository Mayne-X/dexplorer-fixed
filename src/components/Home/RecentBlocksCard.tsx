import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { selectBlocks } from '@/store/streamSlice'
import { trimHash, timeFromNow } from '@/utils/helper'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

interface FormattedBlock {
  height: number
  hash: string
  time: string
  txCount: number
  validator: string
}

const RecentBlocksCard: React.FC = React.memo(() => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const persistentBlocks = useSelector(selectBlocks)
  const [recentBlocks, setRecentBlocks] = useState<FormattedBlock[]>([])

  // Update recent blocks from persistent store
  useEffect(() => {
    if (persistentBlocks.length > 0) {
      const formattedBlocks = persistentBlocks.slice(0, 4).map((block) => ({
        height: parseInt(block.header.height),
        hash: trimHash(block.header.appHash || '', 16),
        time: timeFromNow(block.header.time),
        txCount: block.txs?.length || 0,
        validator: trimHash(block.header.proposerAddress || '', 8),
      }))

      setRecentBlocks(formattedBlocks)
    }
  }, [persistentBlocks])

  return (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl font-bold tracking-tight"
          style={{ color: colors.text.primary }}
        >
          Recent Blocks
        </h3>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${colors.status.success}15`,
            color: colors.status.success,
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: colors.status.success }}
          ></div>
          Live
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {recentBlocks.length > 0
            ? recentBlocks.map((block, index) => (
                <motion.div
                  key={block.height}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="group flex items-center justify-between p-3.5 rounded-lg cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                  onClick={() => navigate(`/blocks/${block.height}`)}
                  whileHover={{ x: 2 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}0a`
                    e.currentTarget.style.borderColor = `${colors.primary}35`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.backgroundSecondary
                    e.currentTarget.style.borderColor = colors.border.primary
                  }}
                >
                  {/* left accent bar */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div className="flex-1 pl-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 font-mono"
                        style={{
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          border: `1px solid ${colors.primary}20`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-semibold font-ui"
                            style={{ color: colors.text.primary }}
                          >
                            #{block.height.toLocaleString()}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-md font-mono font-medium"
                            style={{
                              backgroundColor: `${colors.accent}18`,
                              color: colors.accent,
                            }}
                          >
                            {block.txCount} txs
                          </span>
                        </div>
                        <p
                          className="text-xs font-mono truncate mt-0.5"
                          style={{ color: colors.text.tertiary }}
                        >
                          {block.hash}…
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <span
                      className="text-xs font-medium font-ui"
                      style={{ color: colors.text.tertiary }}
                    >
                      {block.time}
                    </span>
                  </div>
                </motion.div>
              ))
            : // Skeleton loading for blocks
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border.secondary}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <SkeletonLoader
                          width="32px"
                          height="32px"
                          variant="rectangular"
                        />
                        <div className="space-y-2">
                          <SkeletonLoader
                            width="120px"
                            height="1rem"
                            variant="text"
                          />
                          <div className="flex items-center gap-2">
                            <SkeletonLoader
                              width="60px"
                              height="0.75rem"
                              variant="text"
                            />
                            <SkeletonLoader
                              width="80px"
                              height="0.75rem"
                              variant="text"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pl-11">
                        <SkeletonLoader
                          width="200px"
                          height="0.75rem"
                          variant="text"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <SkeletonLoader
                        width="60px"
                        height="0.75rem"
                        variant="text"
                      />
                    </div>
                  </div>
                </div>
              ))}
        </AnimatePresence>
      </div>

      <Link
        to="/blocks"
        className="block w-full mt-6 py-3 px-4 rounded-lg text-sm font-semibold text-center transition-all duration-200 hover:bg-opacity-10"
        style={{
          backgroundColor: 'transparent',
          border: `1px solid ${colors.primary}`,
          color: colors.primary,
        }}
      >
        View All Blocks →
      </Link>
    </div>
  )
})

export default RecentBlocksCard

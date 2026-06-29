import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/theme/ThemeProvider'
import { formatNumber } from '@/lib/utils'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
  isLoading?: boolean
  index?: number
}

const StatCard: React.FC<StatCardProps> = React.memo(
  ({
    title,
    value,
    icon: Icon,
    subtitle,
    trend,
    iconColor,
    isLoading = false,
    index = 0,
  }) => {
    const { colors, colorScheme } = useTheme()
    const cardIconColor = iconColor || colors.primary
    const isDark = colorScheme === 'dark'

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="group relative rounded-xl p-6 overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: isDark
            ? `0 1px 3px rgb(0 0 0 / 0.4), inset 0 1px 0 rgba(255,255,255,0.04)`
            : colors.shadow.sm,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          el.style.boxShadow = isDark
            ? `0 8px 32px rgb(0 0 0 / 0.5), 0 0 24px ${cardIconColor}18, inset 0 1px 0 rgba(255,255,255,0.06)`
            : colors.shadow.lg
          el.style.borderColor = `${cardIconColor}40`
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          el.style.boxShadow = isDark
            ? `0 1px 3px rgb(0 0 0 / 0.4), inset 0 1px 0 rgba(255,255,255,0.04)`
            : colors.shadow.sm
          el.style.borderColor = colors.border.primary
        }}
      >
        {/* Subtle gradient top-bar accent */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${cardIconColor}00, ${cardIconColor}cc, ${cardIconColor}00)`,
          }}
        />

        {/* Background glow */}
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
          style={{ backgroundColor: `${cardIconColor}20` }}
        />

        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{
                  backgroundColor: `${cardIconColor}18`,
                  border: `1px solid ${cardIconColor}25`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: cardIconColor }} />
              </motion.div>
              <p
                className="text-xs font-semibold tracking-widest uppercase font-ui"
                style={{ color: colors.text.tertiary }}
              >
                {title}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <SkeletonLoader width="120px" height="2.5rem" variant="text" />
                {subtitle && (
                  <SkeletonLoader width="80px" height="1rem" variant="text" />
                )}
              </div>
            ) : (
              <>
                <motion.p
                  key={String(value)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-3xl font-bold mb-1 tracking-tight font-ui"
                  style={{ color: colors.text.primary }}
                >
                  {typeof value === 'number' ? formatNumber(value) : value}
                </motion.p>

                {subtitle && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: colors.text.tertiary }}
                  >
                    {subtitle}
                  </p>
                )}
              </>
            )}

            {trend && !isLoading && (
              <div className="flex items-center gap-1.5 mt-3">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: trend.isPositive
                      ? `${colors.status.success}18`
                      : `${colors.status.error}18`,
                    color: trend.isPositive
                      ? colors.status.success
                      : colors.status.error,
                  }}
                >
                  {trend.isPositive ? (
                    <FiTrendingUp className="h-3 w-3" />
                  ) : (
                    <FiTrendingDown className="h-3 w-3" />
                  )}
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </div>
                <span
                  className="text-xs"
                  style={{ color: colors.text.tertiary }}
                >
                  vs last hour
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
)

export default StatCard

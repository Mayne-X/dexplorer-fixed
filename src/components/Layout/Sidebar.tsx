import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import {
  FiHome,
  FiBox,
  FiUsers,
  FiFileText,
  FiActivity,
  FiSettings,
  FiUser,
  FiWifi,
  FiWifiOff,
  FiGithub,
  FiLink,
} from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const navigation = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Blocks', href: '/blocks', icon: FiBox },
  { name: 'Transactions', href: '/txs', icon: FiActivity },
  { name: 'IBC Transfers', href: '/ibc-transfers', icon: FiLink },
  { name: 'Validators', href: '/validators', icon: FiUsers },
  { name: 'Proposals', href: '/proposals', icon: FiFileText },
  { name: 'Accounts', href: '/accounts', icon: FiUser },
  { name: 'Parameters', href: '/parameters', icon: FiSettings },
]

const externalLinks = [
  {
    name: 'Github',
    href: 'https://github.com/arifintahu/dexplorer',
    icon: FiGithub,
    isExternal: true,
  },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { colors } = useTheme()
  const location = useLocation()
  const { connectState } = useSelector((state: RootState) => state.connect)
  const isConnected = connectState

  const handleMobileLinkClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const SidebarContent = () => (
    <div
      className="flex grow flex-col gap-y-6 overflow-y-auto border-r px-6 py-6 transition-colors duration-200"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border.primary,
        boxShadow: colors.shadow.sm,
      }}
    >
      {/* Logo with Orbitron heading font */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              boxShadow: `0 4px 12px ${colors.primary}40`,
            }}
          >
            <span className="text-white font-bold text-base font-heading">
              D
            </span>
          </div>
          <h1
            className="text-base font-bold tracking-wide font-heading"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dexplorer
          </h1>
        </div>
      </div>

      {/* Connection Status with modern styling */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200"
        style={{
          backgroundColor: isConnected
            ? colors.status.success + '10'
            : colors.status.error + '10',
          border: `1px solid ${
            isConnected
              ? colors.status.success + '30'
              : colors.status.error + '30'
          }`,
        }}
      >
        {isConnected ? (
          <>
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colors.status.success }}
            />
            <FiWifi
              className="h-4 w-4"
              style={{ color: colors.status.success }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.status.success }}
            >
              Connected
            </span>
          </>
        ) : (
          <>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.status.error }}
            />
            <FiWifiOff
              className="h-4 w-4"
              style={{ color: colors.status.error }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.status.error }}
            >
              Disconnected
            </span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={handleMobileLinkClick}
                      className={cn(
                        'group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative font-ui',
                        !isActive &&
                          'hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)] hover:translate-x-1'
                      )}
                      style={{
                        backgroundColor: isActive
                          ? `${colors.primary}18`
                          : undefined,
                        color: isActive
                          ? colors.primary
                          : colors.text.secondary,
                        border: isActive
                          ? `1px solid ${colors.primary}30`
                          : '1px solid transparent',
                      }}
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full"
                          style={{
                            background: `linear-gradient(180deg, ${colors.primary}, ${colors.accent})`,
                          }}
                        />
                      )}
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
          <li>
            <div
              className="text-xs font-semibold leading-6 mb-2 px-3"
              style={{ color: colors.text.tertiary }}
            >
              Links
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              {externalLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleMobileLinkClick}
                    className="group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1 hover:bg-[var(--color-background-secondary)]"
                    style={{ color: colors.text.primary }}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onMobileClose}>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          />
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 flex w-60 flex-col transition-transform duration-300 lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar - Fixed 240px width */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar

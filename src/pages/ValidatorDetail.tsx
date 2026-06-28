import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiChevronRight,
  FiShield,
  FiTrendingUp,
  FiPercent,
  FiUser,
  FiActivity,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { queryActiveValidators, queryStakingPool } from '@/rpc/abci'
import { useClientStore } from '@/store/clientStore'
import { convertRateToPercent, convertVotingPower } from '@/utils/helper'
import ValidatorIcon from '@/components/ValidatorIcon'
import CopyText from '@/components/ui/CopyText'

type ValidatorDetail = {
  moniker: string
  identity: string
  website: string
  details: string
  status: number
  tokens: string
  commission: string
  minSelfDelegation: string
  delegatorShares: string
  unbondingHeight: string
  pubkey: string
}

const ValidatorDetail: React.FC = () => {
  const { identity } = useParams<{ identity: string }>()
  const { colors } = useTheme()
  const tmClient = useClientStore((state) => state.tmClient)

  const [validator, setValidator] = useState<ValidatorDetail | null>(null)
  const [poolTotal, setPoolTotal] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tmClient || !identity) return

    const fetchValidator = async () => {
      setLoading(true)
      setError(null)

      try {
        const [validatorsResponse, poolResponse] = await Promise.all([
          queryActiveValidators(tmClient, 0, 100),
          queryStakingPool(tmClient),
        ])

        const pool = poolResponse.pool?.bondedTokens || '0'
        setPoolTotal(pool)

        // Find the validator by identity (keybase identity)
        const foundValidator = validatorsResponse.validators.find(
          (v) => v.description?.identity === decodeURIComponent(identity)
        )

        if (!foundValidator) {
          // Try to find by moniker as fallback
          const fallback = validatorsResponse.validators.find(
            (v) => v.description?.moniker === decodeURIComponent(identity)
          )
          if (fallback) {
            setValidator({
              moniker: fallback.description?.moniker || 'Unknown',
              identity: fallback.description?.identity || '',
              website: fallback.description?.website || '',
              details: fallback.description?.details || '',
              status: fallback.status,
              tokens: fallback.tokens,
              commission: convertRateToPercent(
                fallback.commission?.commissionRates?.rate
              ),
              minSelfDelegation: fallback.minSelfDelegation || '1',
              delegatorShares: fallback.delegatorShares || '0',
              unbondingHeight: fallback.unbondingHeight?.toString() || '0',
              pubkey: 'N/A',
            })
          } else {
            setError('Validator not found')
          }
        } else {
          setValidator({
            moniker: foundValidator.description?.moniker || 'Unknown',
            identity: foundValidator.description?.identity || '',
            website: foundValidator.description?.website || '',
            details: foundValidator.description?.details || '',
            status: foundValidator.status,
            tokens: foundValidator.tokens,
            commission: convertRateToPercent(
              foundValidator.commission?.commissionRates?.rate
            ),
            minSelfDelegation: foundValidator.minSelfDelegation || '1',
            delegatorShares: foundValidator.delegatorShares || '0',
            unbondingHeight: foundValidator.unbondingHeight?.toString() || '0',
            pubkey: 'N/A',
          })
        }
      } catch (err) {
        console.error('Failed to fetch validator:', err)
        setError('Failed to load validator details')
      } finally {
        setLoading(false)
      }
    }

    fetchValidator()
  }, [tmClient, identity])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !validator) {
    return (
      <div className="space-y-6">
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
          <Link
            to="/validators"
            className="hover:opacity-70 transition-opacity font-medium"
            style={{ color: colors.text.secondary }}
          >
            Validators
          </Link>
          <FiChevronRight
            className="w-4 h-4"
            style={{ color: colors.text.tertiary }}
          />
          <span style={{ color: colors.text.primary }}>Not Found</span>
        </div>

        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
          }}
        >
          <FiXCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: colors.status.error }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text.primary }}
          >
            {error || 'Validator Not Found'}
          </h2>
          <p className="mb-6" style={{ color: colors.text.secondary }}>
            The validator you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <Link
            to="/validators"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            Back to Validators
          </Link>
        </div>
      </div>
    )
  }

  const isActive = validator.status === 3
  const votingPowerPercent =
    poolTotal !== '0'
      ? ((Number(validator.tokens) / Number(poolTotal)) * 100).toFixed(2)
      : '0'

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
        <Link
          to="/validators"
          className="hover:opacity-70 transition-opacity font-medium"
          style={{ color: colors.text.secondary }}
        >
          Validators
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.primary }}>{validator.moniker}</span>
      </div>

      {/* Header Card */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="flex items-start gap-4">
          <ValidatorIcon
            moniker={validator.moniker}
            identity={validator.identity}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {validator.moniker}
              </h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{
                  backgroundColor: isActive
                    ? colors.status.success + '20'
                    : colors.status.error + '20',
                  color: isActive ? colors.status.success : colors.status.error,
                }}
              >
                {isActive ? (
                  <>
                    <FiCheckCircle className="w-3 h-3" />
                    Active
                  </>
                ) : (
                  <>
                    <FiXCircle className="w-3 h-3" />
                    Inactive
                  </>
                )}
              </span>
            </div>
            {validator.identity && (
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Identity: {validator.identity}
              </p>
            )}
            {validator.website && (
              <a
                href={validator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
                style={{ color: colors.primary }}
              >
                {validator.website}
              </a>
            )}
            {validator.details && (
              <p
                className="mt-2 text-sm"
                style={{ color: colors.text.secondary }}
              >
                {validator.details}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Voting Power */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp
              className="w-5 h-5"
              style={{ color: colors.status.info }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Voting Power
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {convertVotingPower(validator.tokens)}
          </p>
          <p className="text-sm" style={{ color: colors.text.tertiary }}>
            {votingPowerPercent}% of bonded
          </p>
        </div>

        {/* Commission */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiPercent
              className="w-5 h-5"
              style={{ color: colors.status.warning }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Commission
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {validator.commission}
          </p>
          <p className="text-sm" style={{ color: colors.text.tertiary }}>
            Commission rate
          </p>
        </div>

        {/* Delegator Shares */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiUser
              className="w-5 h-5"
              style={{ color: colors.status.success }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Delegator Shares
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {convertVotingPower(validator.delegatorShares)}
          </p>
          <p className="text-sm" style={{ color: colors.text.tertiary }}>
            Total delegated
          </p>
        </div>

        {/* Uptime / Status */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FiActivity className="w-5 h-5" style={{ color: colors.primary }} />
            <span
              className="text-sm font-medium"
              style={{ color: colors.text.secondary }}
            >
              Status
            </span>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {isActive ? 'Bonded' : 'Unbonded'}
          </p>
          <p className="text-sm" style={{ color: colors.text.tertiary }}>
            Validator status
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validator Info */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Validator Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Min Self Delegation
              </span>
              <span
                className="font-medium"
                style={{ color: colors.text.primary }}
              >
                {validator.minSelfDelegation}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Unbonding Height
              </span>
              <span
                className="font-medium"
                style={{ color: colors.text.primary }}
              >
                {validator.unbondingHeight}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                PubKey Type
              </span>
              <span
                className="font-medium"
                style={{ color: colors.text.primary }}
              >
                {validator.pubkey !== 'N/A' ? (
                  <CopyText
                    text={validator.pubkey}
                    displayText={validator.pubkey.substring(0, 20) + '...'}
                  />
                ) : (
                  'N/A'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: colors.text.primary }}
          >
            Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiShield
                className="w-4 h-4"
                style={{ color: colors.status.success }}
              />
              <span
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Validator signed last block
              </span>
            </div>
            {validator.identity && (
              <div className="flex items-start gap-2">
                <FiKey
                  className="w-4 h-4 mt-0.5"
                  style={{ color: colors.status.info }}
                />
                <div>
                  <span
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Keybase Identity
                  </span>
                  <a
                    href={`https://keybase.io/${encodeURIComponent(validator.identity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {validator.identity}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delegator Actions Note */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text.primary }}
        >
          Delegator Info
        </h3>
        <p className="text-sm" style={{ color: colors.text.secondary }}>
          To delegate or undelegate to this validator, please use a wallet
          application like Keplr Wallet or Cosmostation. Dexplorer is a
          read-only block explorer.
        </p>
      </div>
    </div>
  )
}

export default ValidatorDetail

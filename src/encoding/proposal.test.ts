import { describe, it, expect } from 'vitest'
import { decodeContentProposal } from './proposal'
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'

describe('decodeContentProposal', () => {
  it('should decode TextProposal correctly', () => {
    const proposal = TextProposal.fromPartial({
      title: 'Test Proposal',
      description: 'A test proposal',
    })
    const encoded = TextProposal.encode(proposal).finish()
    const result = decodeContentProposal(
      '/cosmos.gov.v1beta1.TextProposal',
      encoded
    )
    expect(result.typeUrl).toBe('/cosmos.gov.v1beta1.TextProposal')
    expect(result.data).not.toBeNull()
    expect(result.data?.title).toBe('Test Proposal')
    expect(result.data?.description).toBe('A test proposal')
  })

  it('should return null data for unknown proposal type', () => {
    const result = decodeContentProposal(
      '/cosmos.gov.v1beta1.ParameterChangeProposal',
      new Uint8Array([1, 2, 3])
    )
    expect(result.typeUrl).toBe('/cosmos.gov.v1beta1.ParameterChangeProposal')
    expect(result.data).toBeNull()
  })

  it('should return null data for empty type URL', () => {
    const result = decodeContentProposal('', new Uint8Array(0))
    expect(result.typeUrl).toBe('')
    expect(result.data).toBeNull()
  })
})

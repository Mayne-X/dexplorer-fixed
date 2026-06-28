import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov'

const TYPE = {
  TextProposal: '/cosmos.gov.v1beta1.TextProposal',
}

export interface DecodeContentProposal {
  typeUrl: string
  data: TextProposal | null
}

export const decodeContentProposal = (
  typeUrl: string,
  value: Uint8Array
): DecodeContentProposal => {
  let data = null

  // Try to decode based on the type URL, if we don't recognize it, leave data as null
  // This is safer than silently decoding everything as TextProposal which could show incorrect data
  switch (typeUrl) {
    case TYPE.TextProposal:
      data = TextProposal.decode(value)
      break
    // If we encounter an unknown proposal type, we explicitly return null
    // rather than guessing - the UI will handle showing unknown types appropriately
    default:
      // Don't silently default to TextProposal - that would show wrong proposal data
      // for new proposal types like ParameterChangeProposal, etc.
      break
  }

  return {
    typeUrl,
    data,
  }
}

import { useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

const DEFAULT_LINKS = {
  test: {
    linkTransaction: 'https://explore-testnet.vechain.org/transactions/{txId}',
    linkBlock: 'https://explore-testnet.vechain.org/blocks/{blockId}',
    linkAccount: 'https://explore-testnet.vechain.org/accounts/{account}'
  },
  main: {
    linkTransaction: 'https://explore.vechain.org/transactions/{txId}',
    linkBlock: 'https://explore.vechain.org/blocks/{blockId}',
    linkAccount: 'https://explore.vechain.org/accounts/{account}'
  }
}

export function useLinks () {
  const { config, options } = useContext(VeChainContext)

  const linkTransaction = options.linkTransaction || DEFAULT_LINKS[config.network].linkTransaction
  const linkBlock = options.linkTransaction || DEFAULT_LINKS[config.network].linkBlock
  const linkAccount = options.linkTransaction || DEFAULT_LINKS[config.network].linkAccount

  const getTransactionLink = (txId) => linkTransaction.replace('{txId}', txId)
  const getBlockLink = (blockId) => linkBlock.replace('{blockId}', blockId)
  const getAccountLink = (account) => linkAccount.replace('{account}', account)

  return { getTransactionLink, getBlockLink, getAccountLink }
}

import { useContext, useEffect, useState } from 'react'
import { VeChainContext } from '../providers/VeChain'
import getNetworkByGenesisId from '../providers/VeChain/getNetworkByGenesisId'

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
  const { options, connex } = useContext(VeChainContext)
  const [networkType, setNetworkType] = useState('main')

  useEffect(() => {
    if (!connex) { return }
    const networkType = getNetworkByGenesisId(connex.thor.genesis.id)
    setNetworkType(networkType)
  }, [connex])

  const linkTransaction = options.linkTransaction || DEFAULT_LINKS[networkType].linkTransaction
  const linkBlock = options.linkTransaction || DEFAULT_LINKS[networkType].linkBlock
  const linkAccount = options.linkTransaction || DEFAULT_LINKS[networkType].linkAccount

  const getTransactionLink = (txId) => linkTransaction.replace('{txId}', txId)
  const getBlockLink = (blockId) => linkBlock.replace('{blockId}', blockId)
  const getAccountLink = (account) => linkAccount.replace('{account}', account)

  return { getTransactionLink, getBlockLink, getAccountLink }
}

import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import bent from 'bent'
import getNetworkByGenesisId from '../providers/VeChain/getNetworkByGenesisId'

const iconUri = 'https://vechain.github.io/token-registry/assets/'
const getTokenRegistry = bent('https://vechain.github.io/token-registry/', 'GET', 'json')

export function useTokens () {
  const { connex } = useContext(VeChainContext)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    if (!connex) { return }
    const network = getNetworkByGenesisId(connex.thor.genesis.id)
    getTokenRegistry(`${network}.json`).then(tokens => setTokens(tokens.map(token => ({ ...token, icon: `${iconUri}${token.icon}` }))))
  }, [connex])

  return {
    tokens
  }
}

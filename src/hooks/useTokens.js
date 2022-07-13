import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import bent from 'bent'

const iconUri = 'https://vechain.github.io/token-registry/assets/'
const getTokenRegistry = bent('https://vechain.github.io/token-registry/', 'GET', 'json')

export function useTokens () {
  const { config } = useContext(VeChainContext)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    const { network } = config
    getTokenRegistry(`${network}.json`).then(tokens => setTokens(tokens.map(token => ({ ...token, icon: `${iconUri}${token.icon}` }))))
  }, [config])

  return {
    tokens
  }
}

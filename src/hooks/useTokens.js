import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import bent from 'bent'

const getTokenRegistry = bent('https://vechain.github.io/token-registry/', 'GET', 'json')

export function useTokens() {
  const { config } = useContext(VeChainContext)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    const { network } = config
    getTokenRegistry(`${network}.json`).then(setTokens)
  }, [config])

  return {
    tokens
  }
}

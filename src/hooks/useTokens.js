import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import bent from 'bent'
import getNetworkByGenesisId from '../providers/VeChain/getNetworkByGenesisId'

const iconUri = 'https://vechain.github.io/token-registry/assets/'

const getTokenRegistry = bent('https://vechain.github.io/token-registry/', 'GET', 'json')
const getTokenPrice = bent('https://api.vexchange.io/v1/tokens', 'GET', 'json')

export function useTokens(includePrice) {
  const { connex } = useContext(VeChainContext)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    if (!connex) { return }

    const network = getNetworkByGenesisId(connex.thor.genesis.id)

    getTokenRegistry(`${network}.json`)
      .then((tokens) => {
        if (includePrice) {
          return getTokenPrice().then((prices) => [
            tokens,
            Object.values(prices)
          ])
        }

        return [tokens, undefined]
      })
      .then(([tokens, prices]) => {
        setTokens(
          tokens.map((token) => ({
            ...token,
            icon: `${iconUri}${token.icon}`,
            usdPrice: prices?.find((price) => token.symbol === price.symbol)?.usdPrice
          }))
        )
      })
  }, [connex])

  return {
    tokens
  }
}

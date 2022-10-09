import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import bent from 'bent'
import getNetworkByGenesisId from '../providers/VeChain/getNetworkByGenesisId'

const iconUri = 'https://vechain.github.io/token-registry/assets/'

const getTokenRegistry = bent('https://vechain.github.io/token-registry/', 'GET', 'json')
const getTokenPrice = bent('https://api.vexchange.io/v1/tokens', 'GET', 'json')

export function useTokens (options) {
  const { connex } = useContext(VeChainContext)
  const [tokens, setTokens] = useState([])

  async function addUsdPrices (tokens) {
    const prices = await getTokenPrice()
    const priceBySymbol = Object.values(prices).reduce((priceBySymbol, price) => {
      priceBySymbol[price.symbol] = price.usdPrice
      return priceBySymbol
    }, {})

    return tokens.map(token => {
      return {
        ...token,
        usdPrice: priceBySymbol[token.symbol]
      }
    })
  }
  const loadTokens = async (network, options = {}) => {
    const rawTokens = await getTokenRegistry(`${network}.json`)

    let tokens = rawTokens.map(token => ({ ...token, icon: `${iconUri}${token.icon}` }))

    if (options.usdPrice) {
      tokens = await addUsdPrices(tokens)
    }

    setTokens(tokens)
  }

  useEffect(() => {
    if (!connex) { return }

    const network = getNetworkByGenesisId(connex.thor.genesis.id)
    loadTokens(network, options)
  }, [connex, JSON.stringify(options)])

  return {
    tokens
  }
}

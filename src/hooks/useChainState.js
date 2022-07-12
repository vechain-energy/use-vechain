import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useChainState () {
  const { connex, waitForTransactionId } = useContext(VeChainContext)
  const [head, setHead] = useState()

  useEffect(() => {
    if (!connex) { return }

    if (!head) {
      setHead(connex.thor.status.head)
    }

    connex.thor.ticker().next().then(ticker => setHead(ticker))
  }, [connex, head])

  return {
    connex,
    head,
    waitForTransactionId
  }
}

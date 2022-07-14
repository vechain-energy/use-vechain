import { useState, useContext, useCallback } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useAccount () {
  const { account, connect, disconnect } = useContext(VeChainContext)
  const [error, setError] = useState()
  const [isLoading, setLoading] = useState(false)

  const handleConnect = useCallback(async (...args) => {
    setError()
    setLoading(true)
    let result
    try {
      result = await connect(...args)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
    return result
  })

  return {
    account,
    isLoading,
    error,
    connect: handleConnect,
    disconnect
  }
}

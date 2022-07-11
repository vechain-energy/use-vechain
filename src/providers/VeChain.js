import React, { useState, useEffect, useCallback, createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Connex from '@vechain/connex'

export const VeChainContext = createContext()
export const VeChainProvider = ({ children, config }) => {
  const [connex, setConnex] = useState()
  const [account, setAccount] = useLocalStorage('account')

  const connect = useCallback(async ({ comment = 'sign in' }) => {
    const certificate = {
      purpose: 'identification',
      payload: {
        type: 'text',
        content: comment
      }
    }

    const result = await connex.vendor.sign('cert', certificate).request()
    setAccount(result.annex.signer)

    return result
  }, [connex])

  const disconnect = useCallback(async () => {
    setAccount()
  }, [])

  useEffect(() => {
    const connex = new Connex(config)
    setConnex(connex)
  }, [config])

  return <VeChainContext.Provider value={{ connex, connect, disconnect, account }}>{children}</VeChainContext.Provider>
}

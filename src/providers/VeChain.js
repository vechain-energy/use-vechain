import React, { useState, useEffect, useCallback, createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Connex from '@vechain/connex'

export const VeChainContext = createContext()
export const VeChainProvider = ({ children, config, options }) => {
  const [connex, setConnex] = useState()
  const [account, setAccount] = useLocalStorage('account')
  const [defaultOptions, setDefaultOptions] = useState({})

  const connect = useCallback(async (payloadOrContent = 'identification') => {
    console.log(payloadOrContent)
    const payload = typeof (payloadOrContent) === 'object' ? { ...payloadOrContent } : { type: 'text', content: payloadOrContent }
    const certificate = {
      purpose: 'agreement',
      payload
    }

    const result = await connex.vendor.sign('cert', certificate).request()
    setAccount(result.annex.signer)

    return result
  }, [connex])

  const disconnect = useCallback(async () => {
    setAccount()
  }, [])

  useEffect(() => {
    setConnex(new Connex(config))
  }, [config])

  useEffect(() => {
    setDefaultOptions(options)
  }, [options])

  const waitForTransactionId = useCallback(async function waitForTransactionId (id) {
    const transaction = connex.thor.transaction(id)
    let receipt = await transaction.getReceipt()
    while (!receipt) {
      await connex.thor.ticker().next()
      receipt = await transaction.getReceipt()
    }

    if (receipt.reverted) {
      const transactionData = await transaction.get()
      const explainedTransaction = await connex.thor.explain(transactionData.clauses)
        .caller(transactionData.origin)
        .execute()

      const revertReasons = explainedTransaction.map(({ revertReason }) => revertReason).join(' ,')

      throw new Error(revertReasons || 'Transaction was reverted')
    }

    return transaction
  }, [connex])

  const submitTransaction = useCallback(async function submitTransaction (clauses, options = {}) {
    const transaction = connex.vendor.sign('tx', clauses)
    const optionsWithDefaults = { ...defaultOptions, ...options }
    for (const key of Object.keys(optionsWithDefaults)) {
      /* eslint-disable no-useless-call */
      transaction[key].call(transaction, optionsWithDefaults[key])
    }

    const { txid } = await transaction.request()
    return txid
  }, [connex, defaultOptions])

  return <VeChainContext.Provider value={{ connex, connect, disconnect, account, config, options, submitTransaction, waitForTransactionId }}>{children}</VeChainContext.Provider>
}

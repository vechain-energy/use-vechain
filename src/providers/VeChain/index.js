import React, { useState, useEffect, useCallback, createContext } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import Connex from '@vechain/connex'
import bent from 'bent'
import getNetworkByGenesisId from './getNetworkByGenesisId'
import testDelegation from './testDelegation'

const postJSON = bent('POST', 'json')
const isConnexV1 = (connex) => (connex?.version?.split('.')[0] === '1')

export const VeChainContext = createContext()
export const VeChainProvider = ({ children, config, options }) => {
  const connex = new Connex(config)
  const [account, setAccount] = useLocalStorage('account')
  const [defaultOptions, setDefaultOptions] = useState({})

  function getGlobalConnexIfNetworkMatches () {
    if (window.connex && getNetworkByGenesisId(window.connex.thor.genesis.id) === config.network) {
      return window.connex
    }

    return connex
  }

  const connect = useCallback(async (payloadOrContent = 'identification') => {
    const connex = getGlobalConnexIfNetworkMatches()
    const payload = typeof (payloadOrContent) === 'object' ? { ...payloadOrContent } : { type: 'text', content: payloadOrContent }
    const certificate = { purpose: 'agreement', payload }

    const result = await (isConnexV1(connex) ? connex.vendor.sign('cert').request(certificate) : connex.vendor.sign('cert', certificate).request())
    setAccount(result.annex.signer)
    return result
  }, [])

  const disconnect = useCallback(() => {
    setAccount()
  }, [])

  useEffect(() => {
    setDefaultOptions(options)
  }, [options])

  const waitForTransactionId = useCallback(async function waitForTransactionId (id) {
    const connex = getGlobalConnexIfNetworkMatches()
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
  }, [])

  const submitTransaction = useCallback(async function submitTransaction (clauses, options = {}) {
    const connex = getGlobalConnexIfNetworkMatches()
    const transaction = connex.vendor.sign('tx', clauses)
    const { delegateTest, ...optionsWithDefaults } = { ...defaultOptions, ...options }
    for (const key of Object.keys(optionsWithDefaults)) {
      /* eslint-disable no-useless-call */
      if (key === 'delegate') {
        applyConnexV1DelegateCompatilibity({ connex, transaction, delegate: optionsWithDefaults[key] })
      } else if (Array.isArray(optionsWithDefaults[key])) {
        transaction[key].call(transaction, ...optionsWithDefaults[key])
      } else {
        transaction[key].call(transaction, optionsWithDefaults[key])
      }
    }

    if (delegateTest) {
      const origin = Array.isArray(optionsWithDefaults.delegate) && optionsWithDefaults.delegate.length > 1 ? optionsWithDefaults.delegate[1] : (account || '0x0000000000000000000000000000000000000000')
      await testDelegation({ connex, url: delegateTest, options: optionsWithDefaults, origin, clauses })
    }

    const { txid } = await (isConnexV1(connex) ? transaction.request(clauses) : transaction.request())
    return txid
  }, [account, defaultOptions])

  return <VeChainContext.Provider value={{ connex, connect, disconnect, account, config, options, submitTransaction, waitForTransactionId }}>{children}</VeChainContext.Provider>
}

function applyConnexV1DelegateCompatilibity ({ connex, delegate, transaction }) {
  if (isConnexV1(connex)) {
    transaction.delegate((args) => postJSON(delegate, args))
  } else if (Array.isArray(delegate)) {
    transaction.delegate(...delegate)
  } else {
    transaction.delegate(delegate)
  }
}

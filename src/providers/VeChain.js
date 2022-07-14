import React, { useState, useEffect, useCallback, createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Connex from '@vechain/connex'
import { Transaction } from 'thor-devkit'
import bent from 'bent'

const postJSON = bent('POST', 'json')

export const VeChainContext = createContext()
export const VeChainProvider = ({ children, config, options }) => {
  const connex = new Connex(config)
  const [account, setAccount] = useLocalStorage('account')
  const [defaultOptions, setDefaultOptions] = useState({})

  const connect = useCallback(async (payloadOrContent = 'identification') => {
    const payload = typeof (payloadOrContent) === 'object' ? { ...payloadOrContent } : { type: 'text', content: payloadOrContent }
    const certificate = {
      purpose: 'agreement',
      payload
    }

    const result = await connex.vendor.sign('cert', certificate).request()
    setAccount(result.annex.signer)

    return result
  }, [])

  const disconnect = useCallback(async () => {
    setAccount()
  }, [])

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
  }, [])

  const submitTransaction = useCallback(async function submitTransaction (clauses, options = {}) {
    const transaction = connex.vendor.sign('tx', clauses)
    const { delegateTest, ...optionsWithDefaults } = { ...defaultOptions, ...options }
    for (const key of Object.keys(optionsWithDefaults)) {
      /* eslint-disable no-useless-call */
      if (Array.isArray(optionsWithDefaults[key])) {
        transaction[key].call(transaction, ...optionsWithDefaults[key])
      } else {
        transaction[key].call(transaction, optionsWithDefaults[key])
      }
    }

    if (delegateTest) {
      const origin = Array.isArray(optionsWithDefaults.delegate) && optionsWithDefaults.delegate.length > 1 ? optionsWithDefaults.delegate[1] : (account || '0x0000000000000000000000000000000000000000')
      const testTransaction = new Transaction({
        clauses,
        chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
        blockRef: connex.thor.status.head.id.slice(0, 18),
        expiration: 32,
        gas: connex.thor.genesis.gasLimit,
        gasPriceCoef: 128,
        dependsOn: optionsWithDefaults.dependsOn || null,
        nonce: +new Date(),
        reserved: {
          features: 1
        }
      })

      const { success, message, errors } = await postJSON(delegateTest, { raw: `0x${testTransaction.encode().toString('hex')}`, origin }, [200])
      if (!success) {
        console.error('fee delegation test failed', errors)
        throw new FeeDelegationError(message || 'fee delegation rejected', errors)
      }
    }

    const { txid } = await transaction.request()
    return txid
  }, [account, defaultOptions])

  return <VeChainContext.Provider value={{ connex, connect, disconnect, account, config, options, submitTransaction, waitForTransactionId }}>{children}</VeChainContext.Provider>
}

class FeeDelegationError extends Error {
  constructor (message, errors) {
    super(message)
    this.name = 'FeeDelegationError'
    this.errors = errors
  }
}

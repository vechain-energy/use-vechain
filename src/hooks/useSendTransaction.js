import { useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useSendTransaction () {
  const { submitTransaction, waitForTransactionId } = useContext(VeChainContext)

  const sendTransaction = async ({ to = null, value = 0, data, comment }, options = {}) => {
    const clause = { to, value, data, comment }

    if (options.transaction) {
      options.transaction._addClause(clause)
      return options.transaction
    } else {
      const txid = await submitTransaction([clause], options)
      return waitForTransactionId(txid)
    }
  }

  return { sendTransaction }
}

import { useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useMultiTask () {
  const { submitTransaction, waitForTransactionId } = useContext(VeChainContext)

  async function commit (clauses, options) {
    const txid = await submitTransaction(clauses, options)
    return waitForTransactionId(txid)
  }

  const multiTaskTransaction = (options1) => {
    const clauses = []
    return {
      _addClause: (clause) => { clauses.push(clause) },
      commit: (options2 = {}) => commit(clauses, { ...options1, ...options2 })
    }
  }

  const multiTask = async (optionsOrCallback, options) => {
    const options1 = options !== undefined ? options : (typeof (optionsOrCallback) === 'object' ? optionsOrCallback : {})

    const transaction = multiTaskTransaction(options1)

    if (typeof (optionsOrCallback) === 'function') {
      await optionsOrCallback(transaction)
      return transaction.commit()
    }

    return transaction
  }

  return { multiTask }
}

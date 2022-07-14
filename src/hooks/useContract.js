import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useContract (contractAddress, abis) {
  const { connex, submitTransaction, waitForTransactionId } = useContext(VeChainContext)
  const [contract, setContract] = useState()
  const [fns, setFunctions] = useState({})

  useEffect(() => {
    if (!connex || !contractAddress) { return }
    setContract(connex.thor.account(contractAddress))
  }, [connex, contractAddress])

  useEffect(() => {
    if (!contract || !abis?.length) { return }

    const fns = { _parsed: true }
    abis
      .filter(({ type }) => type === 'function')
      .forEach(abi => {
        const { name, stateMutability } = abi

        if (stateMutability === 'view') {
          fns[name] = generateViewFunction(abi)
        } else {
          fns[name] = generateTransactionFunction(abi)
        }
      })
    setFunctions(fns)

    function generateViewFunction (abi) {
      return async (...args) => (await contract.method(abi).call(...args)).decoded
    }

    function generateTransactionFunction (abi) {
      return async (...fnArgs) => {
        const args = fnArgs.slice(0, abi.inputs.length)
        const options = fnArgs.length > abi.inputs.length ? fnArgs[abi.inputs.length] : {}

        const clause = contract.method(abi).asClause(...args)
        if (options.transaction) {
          if (options.comment) {
            clause.comment = options.comment
          }
          options.transaction._addClause(clause)
        } else {
          const txid = await submitTransaction([clause], options)
          return waitForTransactionId(txid)
        }
      }
    }
  }, [contract, abis])

  return fns
}

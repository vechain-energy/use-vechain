import { useContext, useState, useEffect } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useContracts (contractAddresses, abis) {
  const { connex, submitTransaction, waitForTransactionId } = useContext(VeChainContext)
  const [contracts, setContracts] = useState([...new Array(contractAddresses.length)].map(() => ({})))

  useEffect(() => {
    if (!connex) {
      return
    }

    const contractVisitors = contractAddresses.map(contractAddress => connex.thor.account(contractAddress))

    const contracts = contractVisitors.map(contractVisitor => {
      return generateContractObject(contractVisitor, abis)
    })

    setContracts(contracts)

    function generateContractObject (contractVisitor, abis) {
      const fns = { _parsed: true }
      abis
        .filter(({ type }) => type === 'function')
        .forEach(abi => {
          const { name, stateMutability } = abi

          if (stateMutability === 'view') {
            fns[name] = generateViewFunction(contractVisitor, abi)
          } else {
            fns[name] = generateTransactionFunction(contractVisitor, abi)
          }
        })
      return fns
    }

    function generateViewFunction (contractVisitor, abi) {
      return async function (...args) {
        const { decoded } = await contractVisitor.method(abi).call(...args)
        if (abi.outputs.length === 1 && !abi.outputs[0].name) {
          return decoded['0']
        }
        return decoded
      }
    }

    function generateTransactionFunction (contractVisitor, abi) {
      return async function (...fnArgs) {
        const args = fnArgs.slice(0, abi.inputs.length)
        const options = fnArgs.length > abi.inputs.length ? fnArgs[abi.inputs.length] : {}

        const clause = contractVisitor.method(abi).asClause(...args)
        if (options.comment) { clause.comment = options.comment }
        if (options.value) {
          clause.value = options.value
          delete options.value
        }

        if (options.transaction) {
          options.transaction._addClause(clause)
          return options.transaction
        } else {
          const txid = await submitTransaction([clause], options)
          return waitForTransactionId(txid)
        }
      }
    }
  }, [JSON.stringify(contractAddresses, abis), waitForTransactionId, submitTransaction, connex])

  return contracts
}

export function useContract (contractAddress, abis) {
  return useContracts([contractAddress], abis)[0]
}

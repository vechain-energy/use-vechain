import { useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useContracts (contractAddresses, abis) {
  const { connex, submitTransaction, waitForTransactionId } = useContext(VeChainContext)

  if (!connex) {
    return []
  }

  const contracts = contractAddresses.map(contractAddress => connex.thor.account(contractAddress))

  const contractsFns = contracts.map(contract => {
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

    return fns

    function generateViewFunction (abi) {
      return async (...args) => {
        const { decoded } = await contract.method(abi).call(...args)
        if (abi.outputs.length === 1 && !abi.outputs[0].name) {
          return decoded['0']
        }
        return decoded
      }
    }

    function generateTransactionFunction (abi) {
      return async (...fnArgs) => {
        const args = fnArgs.slice(0, abi.inputs.length)
        const options = fnArgs.length > abi.inputs.length ? fnArgs[abi.inputs.length] : {}

        const clause = contract.method(abi).asClause(...args)
        if (options.comment) { clause.comment = options.comment }
        if (options.value) { clause.value = options.value }

        if (options.transaction) {
          options.transaction._addClause(clause)
          return options.transaction
        } else {
          const txid = await submitTransaction([clause], options)
          return waitForTransactionId(txid)
        }
      }
    }
  })

  return contractsFns
}

export function useContract (contractAddress, abis) {
  return useContracts([contractAddress], abis)[0]
}

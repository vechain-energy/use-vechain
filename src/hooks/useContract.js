import { useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useContract(contractAddress, abis) {
  const { connex, waitForTransactionId } = useContext(VeChainContext)
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
          return fns[name] = async (...args) => (await contract.method(abi).call(...args)).decoded
        }

        return fns[name] = async (...args) => {
          const clause = contract.method(abi).asClause(...args)
          const { txid } = await connex.vendor.sign('tx', [clause]).request()
          return waitForTransactionId(txid)
        }
      })
    setFunctions(fns)
  }, [contract, abis])


  return fns
}

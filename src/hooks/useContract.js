import { useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { VeChainContext } from '../providers/VeChain'

export function useContract(contractAddress, abis) {
  const { connex } = useContext(VeChainContext)
  const [contract, setContract] = useState()
  const [fns, setFunctions] = useState({})

  useEffect(() => {
    if (!connex || !contractAddress) { return }
    setContract(connex.thor.account(contractAddress))
  }, [connex, contractAddress])

  useEffect(() => {
    if (!contract || !abis?.length) { return }

    const fns = { _parsed: true }
    abis.forEach(abi => {
      const { name } = abi
      fns[name] = async (...args) => (await contract.method(abi).call(...args)).decoded
    })
    setFunctions(fns)
  }, [contract, abis])


  return fns
}

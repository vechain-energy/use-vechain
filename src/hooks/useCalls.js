import { useState, useEffect, useContext } from 'react'
import { useContract } from './useContract'

export function useCalls(contractAddress, abis, argsList) {
  const [results, setResults] = useState([])
  const contract = useContract(contractAddress, abis)


  useEffect(() => {
    if (!contract?._parsed || !argsList?.length) { return }
    executeCalls({ contract, abis, argsList }).then(setResults)
  }, [contract, abis, argsList])

  return results
}

export function useCall(contractAddress, abi, args) {
  const [abis] = useState([abi])
  const [argsList] = useState([args])
  return useCalls(contractAddress, abis, argsList)[0] || {}
}

async function executeCalls({ contract, abis, argsList }) {
  const results = []

  for (const index in abis) {
    const name = abis[index].name
    const args = argsList[index]
    const result = await contract[name](...args)
    results.push(result)
  }

  return results
}
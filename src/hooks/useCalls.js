import { useState, useEffect } from 'react'
import { useContract } from './useContract'

export function useCalls (contractAddress, abis, argsList) {
  const [results, setResults] = useState(abis.map(() => ({})))
  const contract = useContract(contractAddress, abis)

  useEffect(() => {
    executeCalls({ contract, abis, argsList }).then(setResults)
  }, [contract, JSON.stringify({ abis, argsList })])

  return results
}

export function useCall (contractAddress, abi, args) {
  return useCalls(contractAddress, [abi], [args])[0]
}

async function executeCalls ({ contract, abis, argsList = [] }) {
  const results = []

  for (const index in abis) {
    const name = abis[index].name
    const args = argsList[index] || []
    if (contract[name]) {
      const result = await contract[name](...args)
      results.push(result)
    } else {
      results.push({})
    }
  }

  return results
}

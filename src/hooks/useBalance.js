import { ethers } from '@vechain/ethers'
import { useState, useEffect, useContext, useCallback } from 'react'
import { VeChainContext } from '../providers/VeChain'
import { useChainState } from '../hooks/useChainState'

export function useBalance (address) {
  const { connex } = useContext(VeChainContext)
  const { head } = useChainState()

  const [vet, setVet] = useState(0)
  const [vtho, setVtho] = useState(0)

  const balanceOf = useCallback(async function balanceOf (address, raw) {
    if (!connex) { return { vet: 0, vtho: 0 } }
    const accountVisitor = connex.thor.account(address)
    const { balance, energy } = await accountVisitor.get()
    if (raw) {
      return { vet: balance, vtho: energy }
    }

    return {
      vet: ethers.utils.formatEther(new ethers.utils.BigNumber(balance)),
      vtho: ethers.utils.formatEther(new ethers.utils.BigNumber(energy))
    }
  }, [connex])

  useEffect(() => {
    if (!connex || !address) { return }
    balanceOf(address).then(({ vet, vtho }) => {
      setVet(vet)
      setVtho(vtho)
    })
  }, [connex, head, address])

  return {
    vet,
    vtho,
    balanceOf
  }
}

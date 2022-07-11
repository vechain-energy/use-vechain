import { ethers } from '@vechain/ethers'
import { useState, useEffect, useContext } from 'react'
import { VeChainContext } from '../providers/VeChain'
import { useChainState } from '../hooks/useChainState'

export function useBalance(address) {
  const { connex } = useContext(VeChainContext)
  const { head } = useChainState()

  const [vet, setVet] = useState(0)
  const [vtho, setVtho] = useState(0)

  useEffect(() => {
    if (!connex || !address) { return }

    const accountVisitor = connex.thor.account(address)
    accountVisitor.get().then(({ balance, energy }) => {
      setVet(ethers.utils.formatEther(new ethers.utils.BigNumber(balance)))
      setVtho(ethers.utils.formatEther(new ethers.utils.BigNumber(energy)))
    })
  }, [connex, head, address])

  return {
    vet,
    vtho
  }
}

import React from 'react'
import { useChainState } from '@vechain.energy/use-vechain'


export const Head = () => {
  const { head } = useChainState()
  return (<pre>{JSON.stringify(head, '', 2)}</pre>)
}

export default { title: 'Hooks/useChainState' }

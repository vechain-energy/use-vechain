import React from 'react'
import { useChainState } from '@vechain.energy/use-vechain'

export default {
  title: 'Hooks/useChainState',
  argTypes: {
  }
}

const Template = () => {
  const { head } = useChainState()
  return (<pre>{JSON.stringify(head, '', 2)}</pre>)
}

export const Head = Template.bind({})
Head.args = {}

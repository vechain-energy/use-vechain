import React from 'react'
import { VeChainProvider } from '@vechain.energy/use-vechain'

export default {
  title: 'Providers/VeChain',
  argTypes: {
  }
}

const Template = (args) => (
  <VeChainProvider {...args}>
    <pre>
      &lt;VeChainProvider config={`{ ${JSON.stringify(args.config)} }`}&gt;<br />
      <br />
      &nbsp;&nbsp;&lt;App /&gt;<br />
      <br />
      &lt;/VeChainProvider&gt;
    </pre>
  </VeChainProvider>
)

export const Default = Template.bind({})
Default.args = {
  config: {
    node: 'https://testnet.veblocks.net/',
    network: 'test'
  }
}

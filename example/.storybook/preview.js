import 'antd/dist/antd.css'
import React from 'react'
import { addDecorator } from '@storybook/react';
import { VeChainProvider } from '@vechain.energy/use-vechain'


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const TestNetProvider = (Story) => <VeChainProvider config={{ node: 'https://testnet.veblocks.net', network: 'test' }}>{<Story />}</VeChainProvider>
addDecorator(TestNetProvider);

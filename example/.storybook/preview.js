import 'antd/dist/antd.css'
import React from 'react'
import { addDecorator } from '@storybook/react';
import { VeChainProvider } from '@vechain.energy/use-vechain'
import { addParameters } from '@storybook/client-api';


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const TestNetProvider = (Story) => <VeChainProvider config={{ node: 'https://testnet.veblocks.net', network: 'test' }} options={{ delegate: 'https://sponsor-testnet.vechain.energy/by/90' }}>{<Story />}</VeChainProvider>
addDecorator(TestNetProvider);

addParameters({
  viewMode: 'docs',
  previewTabs: {
    'storybook/docs/panel': null,
    canvas: { hidden: true }
  },
});

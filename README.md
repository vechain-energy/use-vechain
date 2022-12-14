`@vechain.energy/use-vechain` is a collection of repeating patterns to improve development speed for react applications.

```shell
yarn add @vechain.energy/use-vechain
```

Add `VeChainProvider` into your `index.js`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/antd.css'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { VeChainProvider } from '@vechain.energy/use-vechain'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VeChainProvider config={{ node: 'https://mainnet.veblocks.net', network: 'main' }}>
      <App />
    </VeChainProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```


Start using the hooks:

```jsx
import { useChainState } from '@vechain.energy/use-vechain'

export const App = () => {
  const { head } = useChainState()
  return <pre>{JSON.stringify(head, '', 2)}</pre>
}
```
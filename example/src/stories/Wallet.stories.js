import React, { useState, useEffect } from 'react'
import { ethers } from '@vechain/ethers'
import { Button, Typography, List, Avatar, Row, Col, Radio, Divider } from 'antd'
import { VeChainProvider, useAccount, useTokens, useCall } from '@vechain.energy/use-vechain'
const { Text } = Typography

const ABI_BALANCEOF = { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }

const NETWORKS = {
  'main': { node: 'https://mainnet.veblocks.net', network: 'main' },
  'test': { node: 'https://testnet.veblocks.net', network: 'test' }
}

export const TokenWallet = () => {
  const [network, setNetwork] = useState('test')

  return (
    <VeChainProvider config={NETWORKS[network]}>
      <center>
        <Radio.Group onChange={(e) => setNetwork(e.target.value)} value={network}>
          <Radio value={'test'}>TestNet</Radio>
          <Radio value={'main'}>MainNet</Radio>
        </Radio.Group>
        <Divider />
      </center>

      <Tokens />
    </VeChainProvider>
  )

  function Tokens() {
    const { tokens } = useTokens()

    return (
      <Row gutter={[16, 16]}>

        <Col span={24}>
          <Account />
        </Col>

        <Col span={24}>
          <List
            dataSource={tokens}
            rowKey={'address'}
            renderItem={token => <Token key={token.address} {...token} />}
          />
        </Col>
      </Row>
    )

  }


  function Balance({ address, symbol }) {
    const { account } = useAccount()
    const [args, setArgs] = useState([account])

    const { balance } = useCall(address, ABI_BALANCEOF, args)
    useEffect(() => {
      setArgs([account])
    }, [account])

    const readableBalance = account && balance ? ethers.utils.formatEther(new ethers.utils.BigNumber(balance)) : 0

    return (
      <Row>
        <Col span={24} align='right'>{Math.round(readableBalance).toLocaleString()}</Col>
        <Col span={24} align='right'><Text type='secondary'>{symbol}</Text></Col>
      </Row>
    )
  }

  function Token({ address, name, symbol, desc, icon }) {

    return (
      <List.Item extra={<Balance address={address} symbol={symbol} />}>
        <List.Item.Meta
          avatar={<Avatar src={icon} />}
          title={name}
          description={desc}
        >
        </List.Item.Meta>
      </List.Item>
    )
  }

  function Account() {
    const { account, error, isLoading, connect, disconnect } = useAccount()

    const Address = () => <Text type='secondary'>{account.slice(0, 4)}…{account.slice(-4)}</Text>

    return (
      <>
        {!!error && <div>Error: {error}</div>}
        {account && <Button block onClick={disconnect} danger shape='round' icon={<Address />}>&nbsp;sign out</Button>}
        {!account && <Button block onClick={connect} loading={isLoading} shape='round'>sign in</Button>}
      </>
    )
  }
}


export default { title: 'Examples/TokenWallet' }

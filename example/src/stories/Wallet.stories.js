import React, { useState, useEffect, useCallback } from 'react'
import { ethers } from '@vechain/ethers'
import { Button, Typography, List, Avatar, Row, Col, Radio, Divider, Modal, Input } from 'antd'
import { VeChainProvider, useAccount, useTokens, useContract } from '@vechain.energy/use-vechain'
const { Text } = Typography

const AbiBalanceOf = { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }
const AbiTransfer = { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
const Abis = [AbiTransfer, AbiBalanceOf]

const NETWORKS = {
  'main': { config: { node: 'https://mainnet.veblocks.net', network: 'main' } },
  'test': { config: { node: 'https://testnet.veblocks.net', network: 'test' }, options: { delegate: 'https://sponsor-testnet.vechain.energy/by/90' } }
}

export const TokenWallet = () => {
  const [network, setNetwork] = useState('test')

  return (
    <VeChainProvider {...NETWORKS[network]}>
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
    const [balance, setBalance] = useState(0)
    const [showTransfer, setShowTransfer] = useState(false)
    const [recipient, setRecipient] = useState()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()

    const { transfer, balanceOf } = useContract(address, Abis)

    const displayTransfer = () => setShowTransfer(true)
    const hideTransfer = () => setShowTransfer(false)


    const updateBalance = useCallback(async () => {
      if (!balanceOf || !account) { return }
      const { balance } = await balanceOf(account)
      const readableBalance = account && balance ? ethers.utils.formatEther(new ethers.utils.BigNumber(balance)) : 0
      setBalance(readableBalance)
    }, [balanceOf, account])


    const handleTransfer = async () => {
      setLoading(true)
      setError()
      try {
        const { balance } = await balanceOf(account)
        await transfer(recipient, balance)
        await updateBalance()
        hideTransfer()
      }
      catch (err) {
        setError(err.message)
      }
      finally {
        setLoading(false)
      }
    }


    useEffect(() => {
      updateBalance()
    }, [updateBalance])

    return (
      <>
        <Row>
          <Col span={24} align='right'>{Math.round(balance).toLocaleString()}</Col>
          <Col span={24} align='right'><Text type='secondary'>{symbol}</Text></Col>
          {balance > 0 && <Col span={24} align='right'><Button size='small' type='link' onClick={displayTransfer}>transfer</Button></Col>}
        </Row>

        <Modal title="Transfer all tokens to" visible={showTransfer} onOk={handleTransfer} onCancel={hideTransfer} maskClosable={false} confirmLoading={loading}>
          {!!error && <div>{error}</div>}
          <Input placeholder="0x…" onChange={(e) => setRecipient(e.target.value)} />
        </Modal>
      </>
    )
  }


  function Token({ address, name, symbol, desc, icon }) {

    return (
      <List.Item extra={<Balance address={address} symbol={symbol} />}>
        <List.Item.Meta avatar={<Avatar src={icon} />} title={name} description={desc} />
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
        {!account && <Button block onClick={() => connect()} loading={isLoading} shape='round'>sign in</Button>}
      </>
    )
  }
}


export default { title: 'Examples/TokenWallet' }

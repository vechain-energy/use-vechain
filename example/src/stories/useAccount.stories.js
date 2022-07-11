import React from 'react'
import { Button, Typography } from 'antd'
import { useAccount } from '@vechain.energy/use-vechain'
const { Text } = Typography

export const Account = () => {
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

export default { title: 'Hooks/useAccount'}

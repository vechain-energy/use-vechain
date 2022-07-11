import React from 'react'
import { Descriptions } from 'antd'
import { useBalance } from '@vechain.energy/use-vechain'

export const Balance = () => {
  const address = '0x0000000000000000000000000000000000000000'
  const { vet, vtho } = useBalance(address)

  return (
    <Descriptions bordered column={1}>
      <Descriptions.Item label='Address'>{address}</Descriptions.Item>
      <Descriptions.Item label='VET'>{vet}</Descriptions.Item>
      <Descriptions.Item label='VTHO'>{vtho}</Descriptions.Item>
    </Descriptions>
  )
}

export default { title: 'Hooks/useBalance' }

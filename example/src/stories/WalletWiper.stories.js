import React, { useState } from 'react'
import { Button, Input } from 'antd'
import { useAccount, useTokens, useMultiTask, useContracts } from '@vechain.energy/use-vechain'

const AbiBalanceOf = { constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }
const AbiTransfer = { constant: false, inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function' }
const AbiSymbol = { constant: true, inputs: [], name: 'symbol', outputs: [{ name: 'symbol', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }
const Abis = [AbiTransfer, AbiBalanceOf, AbiSymbol]

export const WalletWiper = () => {
  const { tokens } = useTokens()
  const tokenContracts = useContracts(tokens.map(({ address }) => address), Abis)
  const { error, connect, disconnect } = useAccount()
  const { multiTask } = useMultiTask()
  const [recipient, setRecipient] = useState()
  const [wipeError, setWipeError] = useState()
  const [loading, setLoading] = useState(false)

  const handleWipe = async () => {
    setLoading(true)
    setWipeError()
    try {
      if (!recipient) {
        throw new Error('no recipient')
      }
      const { annex: { signer: account } } = await connect('identify your wallet to access your current balance')
      await multiTask(async (transaction) => {
        for (const tokenContract of tokenContracts) {
          const { balance } = await tokenContract.balanceOf(account)
          if (balance > 0) {
            const { symbol } = await tokenContract.symbol()
            tokenContract.transfer(recipient, balance, { comment: `wipe balance of ${symbol}`, transaction })
          }
        }
      }, { comment: 'wipe wallet' })
      await disconnect()
    } catch (err) {
      setWipeError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>{error || wipeError}</div>
      <Input placeholder='0x…' onChange={(e) => setRecipient(e.target.value)} /><br />
      <br />
      <Button block onClick={handleWipe} loading={loading} shape='round' type='primary'>sign in and send all your TestNet tokens to new wallet</Button>
    </>
  )
}

export default { title: 'Examples/WalletWiper' }

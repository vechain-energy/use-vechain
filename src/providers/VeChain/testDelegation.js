import { Transaction } from 'thor-devkit'
import bent from 'bent'

const postJSON = bent('POST', 'json')

export default async function testDelegation ({ url, connex, origin, clauses, options }) {
  const testTransaction = new Transaction({
    clauses,
    chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
    blockRef: connex.thor.status.head.id.slice(0, 18),
    expiration: 32,
    gas: connex.thor.genesis.gasLimit,
    gasPriceCoef: 128,
    dependsOn: options.dependsOn || null,
    nonce: +new Date(),
    reserved: {
      features: 1
    }
  })

  const { success, message, errors } = await postJSON(url, { raw: `0x${testTransaction.encode().toString('hex')}`, origin })
  if (!success) {
    console.error('fee delegation test failed', errors)
    throw new FeeDelegationError(message || 'fee delegation rejected', errors)
  }
}

class FeeDelegationError extends Error {
  constructor (message, errors) {
    super(message)
    this.name = 'FeeDelegationError'
    this.errors = errors
  }
}

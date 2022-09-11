// import libraries
// yarn add @vechain/connex-framework @vechain/connex-driver @vechain/ethers thor-devkit bent
const { Framework } = require('@vechain/connex-framework')
const { Driver, SimpleNet } = require('@vechain/connex-driver')
const { Transaction, secp256k1 } = require('thor-devkit')
const bent = require('bent')
const { ethers } = require('@vechain/ethers')

let nonce = 0
async function sendTransaction () {
  // create connex instance
  const driver = await Driver.connect(new SimpleNet('https://testnet.veblocks.net'))
  const connex = new Framework(driver)

  // build transaction clause
  const clauses = [...Array(1375)].map(() => ({
    to: '0x8384738C995D49C5b692560ae688fc8b51af1059',
    value: 0,
    data: '0xd09de08a'
  }))

  // delegate url
  const delegateUrl = 'https://sponsor-testnet.vechain.energy/by/90'
  const postSponsor = bent('POST', 'json')

  // build transaction
  const transaction = new Transaction({
    chainTag: Number.parseInt(connex.thor.genesis.id.slice(-2), 16),
    // blockRef: connex.thor.genesis.id.slice(0, 18),
    blockRef: connex.thor.status.head.id.slice(0, 18),
    parentID: connex.thor.status.head.id,
    expiration: '0xffffffff',
    clauses,
    gas: 30000000,
    gasPriceCoef: 1,
    dependsOn: null,
    nonce: nonce++,
    reserved: {
      unused: Buffer.from(connex.thor.status.head.id.slice(0, 18), 'hex'),
      features: 1 // this enables the fee delegation feature
    }
  })

  // build hex encoded version of the transaction for signing request
  const rawTransaction = `0x${transaction.encode().toString('hex')}`

  // generate a wallet for testing purpose
  const wallet = ethers.Wallet.createRandom()

  // request to send for sponsorship/fee delegation
  const sponsorRequest = {
    origin: wallet.address,
    raw: rawTransaction
  }

  // request sponsorship
  const { signature, error } = await postSponsor(delegateUrl, sponsorRequest)

  // sponsorship was rejected
  if (error) {
    throw new Error(error)
  }

  // sign transaction with the known private key
  const signingHash = transaction.signingHash()
  const originSignature = secp256k1.sign(signingHash, Buffer.from(wallet.privateKey.slice(2), 'hex'))

  // build combined signature from both parties
  const sponsorSignature = Buffer.from(signature.substr(2), 'hex')
  transaction.signature = Buffer.concat([originSignature, sponsorSignature])

  // post transaction to node
  try {
    const postTransaction = bent('POST', 'https://testnet.veblocks.net', 'json')
    const signedTransaction = `0x${transaction.encode().toString('hex')}`
    const { id } = await postTransaction('/transactions', { raw: signedTransaction })

    console.log('transaction submitted with transaction id', `https://explore-testnet.vechain.org/transactions/${id}`)
  } catch (err) {
    const text = await err.text()
    console.log(text)
  }
}

async function loop () {
  await sendTransaction()
}
loop()

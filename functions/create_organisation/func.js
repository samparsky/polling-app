const fdk=require('@autom8/fdk');
const a8=require('@autom8/js-a8-fdk')
const fetch = require('node-fetch')
const Web3 = require('web3')
const abi = require('./Polling.json')

fdk.handle(function({ account, contractAddress, provider } ){
  const web3 = new Web3(new Web3.providers.HttpProvider(provider))

  // get gas price
  const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
  const nonce = await web3.eth.getTransactionCount(account)
  const pollingContract = new web3.eth.Contract(abi, contractAddress, { gasPrice: fast, defaultAccount: account })
  const calldata = await pollingContract.methods.createOrganisation().encodeABI()
  const gasLimit = await pollingContract.methods.createOrganisation().estimateGas()

  return {
      nonce,
      gasPrice: fast,
      gasLimit,
      to: contractAddress,
      value: '0x00', 
      data: calldata,
      chainId: 1337
  }
})

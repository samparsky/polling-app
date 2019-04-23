const ethers = require('ethers')
const fdk=require('@autom8/fdk');
const a8=require('@autom8/js-a8-fdk')
const Web3 = require('web3')
const abi = require('adex-protocol-eth/abi/AdExCore.json')

const contractAddress = ''
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/<REDACTED API KEY"));

fdk.handle(function(input ){
  const { account } = input
  // gas limit
  // gas estimate
  

  const nonce = web3.eth.getTransactionCount(account)
  let provider = ethers.getDefaultProvider();
  let contract = new ethers.Contract(contractAddress, abi, provider);

  const txParams = {
    nonce: nonce,
    gasPrice: '0x09184e72a000', 
    gasLimit: '0x2710',
    to: '0x0000000000000000000000000000000000000000', 
    value: '0x00', 
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    // EIP 155 chainId - mainnet: 1, ropsten: 3
    chainId: 3
  }

  return { 'unsignedTx': transaction }
})

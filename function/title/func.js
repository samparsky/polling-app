const fdk=require('@autom8/fdk');
const a8=require('@autom8/js-a8-fdk')
const { utils, Contract, getDefaultProvider, providers } = require('ethers')
const fetch = require('node-fetch')
const abi = require('./Polling.json')

fdk.handle(async function({ command, account, contractAddress, args=[]}){
  const pollingInterface = new utils.Interface(abi)
  let data = {}, err

  try {
    const provider = getDefaultProvider('goerli');

    if(command === 'getInitiativeResult') {
      const contract = new Contract(contractAddress, abi, provider)
      const result = await contract.getInitiativeResult(...args)
      data.data = result
    } else if(command === 'broadcast') {
      data.balance = (await provider.getBalance(account)).toString()
      data.data = await provider.sendTransaction(args[0])
    } else {
      const { safeLow } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
      data.nonce = await provider.getTransactionCount(account)
      data.data = pollingInterface.functions[command].encode([...args])
      data.value = '0x00'
      data.to = contractAddress
      data.gasPrice = parseInt(safeLow, 16)
      data.gasLimit = 300000
      data.chainId = 5
    }

  } catch(e) {
    err = e.message
  }

  return {
    response: JSON.stringify({ command, data, err }) 
  }

})

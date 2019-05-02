const fdk=require('@autom8/fdk');
const a8=require('@autom8/js-a8-fdk')
const Web3 = require('web3')

fdk.handle(function({ signedTx, provider}){
  const web3 = new Web3(new Web3.providers.HttpProvider(provider))

  // assert
  assert.ok(signedTx.startsWith('0x'), 'signed transaction should start with 0x')

  const response = { success: true }

  await web3.eth.sendSignedTransaction(signedTx)
  .on('error', function(err){
    if(err) {
      response.success = false
      response.err = err.toString()
    }
  })

  return response

})

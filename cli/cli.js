#!/usr/bin/env node

const program = require("commander")
const colors = require('colors')
const assert = require('assert')

program
  .version('0.1.0')
  .option('-n, --chain <chain>', 'default: ethereum', 'ethereum')
  .option('-p, --httpProvider <provider>', 'http provider', 'http://localhost:8545')
  .option('-w, --websocketProvider <provider>', 'websocket provider', 'ws://localhost:8545')
  .option('-k, --keystore <dir>', 'keystore location')
  .option('-p, --password <password>', 'keystore password')
program
  .command('create_organisation')
  .description('create an organisation')
  .action(createOrganisation)
program
  .command('add_constituent <orgId> <constituentAddress>')
  .description('add a constituent to an organisation')
  .action(addConstituent)
program
  .command('remove_constituent <orgId> <constituentAddress>')
  .description('remove a constituent from an organisation')
  .action(removeConstituent)
program
  .command('add_initiative <orgId> <initiative>')
  .description('add an initiative to an organisation')
  .action(addInitiative)
program
  .command('vote <orgId> <initiativeId> <choice>')
  .description('vote for an initiative')
  .action(vote)
program
  .command('get_result <orgId> <initiativeId>')
  .description('get result for an initiative')
  .action(getInitiativeResult)

const contractAddress = '0x564540a26Fb667306b3aBdCB4ead35BEb88698ab'
const lib = require('./lib')( program.httpProvider, program.websocketProvider, contractAddress)

program.parse(process.argv);

function logError(e){
  console.log(`\n${colors.red(e.toString())}\n`)
  process.exit()
}

async function createOrganisation() {
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.createOrganisation({ 
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })

  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey})
  await lib.broadcast({ signedTx: rawTransaction })

  console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  const displayResult = (event) => {
    const { organisationId } = event.returnValues
    console.log(colors.green('✓ Succesfully created organisation'))
    console.log(colors.green(`\nOrganisation ID = ${organisationId.toString()}\n`))
  }

  // watch for mined event and exit
  await lib.subscribeEvent('CreateOrganisation', { creator: address }, displayResult, logError, transactionHash)
}

async function addConstituent(orgId, constituentAddress, args){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.addConstituent({ 
    orgId,
    constituentAddress: constituentAddress.split(','),
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })

  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  await lib.broadcast({ signedTx: rawTransaction })

  console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  const displayResult = (event) => {
    const { organisationId, constituents } = event.returnValues
    console.log(colors.green(`✓ Succesfully added constituent(s) to oragnisation ${orgId}`))
    console.log(colors.green(`\nOrganisation ID = ${organisationId.toString()}\n`))
    console.log(colors.green(`\nConstituents    = ${constituents.toString()}\n`))
  }
   // watch for mined event and exit
   await lib.subscribeEvent('AddConstituent', { organisationId: orgId }, displayResult, logError, transactionHash)

}

async function removeConstituent(orgId, constituentAddress, args){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.removeConstituent({ 
    orgId,
    constituentAddress,
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })

  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  await lib.broadcast({ signedTx: rawTransaction })

  console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  const displayResult = (event) => {
    const { organisationId, constituent } = event.returnValues
    console.log(colors.green(`✓ Succesfully removed constituent from oragnisation ${orgId}`))
    console.log(colors.green(`\nOrganisation ID = ${organisationId.toString()}`))
    console.log(colors.green(`\nConstituent   = ${constituent}\n`))
  }
   // watch for mined event and exit
   await lib.subscribeEvent('RemoveConstituent', { organisationId: orgId }, displayResult, logError, transactionHash)


}
/**
 * 

 { initiativeTitle: 'one', ballotOptions: [1,2,3,4], expiryTime: 1556700062459 }
 */

async function addInitiative(orgId, initiative, args){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const {
    initiativeTitle, 
    ballotOptions,
    expiryTime, 
    number_of_votes_allowed=0, 
    allowAnyOne=false,
  } = JSON.parse(initiative)
  
  assert.ok(orgId)
  assert.ok(initiativeTitle)
  assert.ok(Array.isArray(ballotOptions))
  assert.ok(expiryTime > 0)

  const tx = await lib.addInitiative({
    orgId, 
    initiativeTitle, 
    ballotOptions, 
    expiryTime, 
    number_of_votes_allowed, 
    allowAnyOne,
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })

  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  await lib.broadcast({ signedTx: rawTransaction })

  console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  const displayResult = (event) => {
    const { organisationId, initiativeId,initiativeTitle, expiryTime, number_of_votes_allowed, _ballotOptions } = event.returnValues
    console.log(colors.green(`✓ Succesfully created initiative for oragnisation ${orgId}`))
    console.table(
      [{ 
        organisationId: organisationId.toNumber(), 
        initiativeId: initiativeId.toNumber(), 
        initiativeTitle, 
        expiryTime: expiryTime.toNumber(), 
        number_of_votes_allowed: number_of_votes_allowed.toNumber() , 
        ballotOptions: _ballotOptions.map(item => item.toNumber()).toString()  }]  )
    // console.log(colors.green(`\nConstituent   = ${constituent}\n`))
  }

  // watch for mined event and exit
  await lib.subscribeEvent('AddInitiative', { organisationId: orgId }, displayResult, logError, transactionHash)

}

async function vote(orgId, initiativeId, choice, args){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.vote({
    orgId, 
    initiativeId, 
    choice,
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })

  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  await lib.broadcast({ signedTx: rawTransaction })

  console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))
  const displayResult = (event) => {
    const { organisationId, voter, success } = event.returnValues
    console.log(colors.green(`✓ Succesfully voted for initiative ${initiativeId} in organisation ${orgId}`))
    console.table([
      {
        organisationId, voter, success
      }
    ])
  }
   // watch for mined event and exit
   await lib.subscribeEvent('Vote', { organisationId: orgId, voter: address }, displayResult, logError, transactionHash)

}

async function getInitiativeResult(orgId, initiativeId, args) {
  const { address } = await lib.getAccount(program).catch(logError)
  // loading icon
  console.log(colors.green(` Getting initiative result`))
  
  const result = await lib.getInitiativeResult({
    orgId, 
    initiativeId, 
    contractAddress, 
    account: address, 
    network: '*',
    provider: program.httpProvider
  })
  // display result in table format
  const votes = result['0'].map((choice, index) => new Vote(choice.toNumber(), result['1'][index].toNumber()))

  console.table(votes)
  process.exit()
}

function Vote(choice, vote){
  this.choice = choice
  this.vote = vote
}

#!/usr/bin/env node

const program = require("commander")
const colors = require('colors')
const ora = require('ora')

program
  .version('0.1.0')
  .option('-n, --chain <chain>', 'default: ethereum', 'ethereum')
  .option('-p, --httpProvider <provider>', 'http provider', 'http://ed7766d2.ngrok.io')
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

const contractAddress = '0x7cC4B1851c35959D34e635A470F6b5C43bA3C9c9'
const lib = require('./lib')( program.httpProvider, program.websocketProvider, contractAddress)
program.parse(process.argv);

function logError(e){
  console.log(`\n${colors.red(e.toString())}\n`)
  process.exit()
}

function displayResult(title) {
  return function(event) {
    console.log(colors.green(`${title}`))
    // console.log({ event })
    console.table([
      {
        ...event.returnValues
      }
    ])
  }
}

async function broadcastTxAndWaitTillMined({tx, privateKey, event, filter, successTitle, httpProvider}) {
  console.log(colors.green(`✔ Succesfully created the transaction`))

  const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  // watch for mined event and exit
  const eventPromise = lib.subscribeEvent(
    event,
    filter, 
    displayResult(successTitle), 
    logError, 
    transactionHash)
    console.log({ rawTransaction })
  await lib.call({ command: 'broadcast', args: [rawTransaction] })

  // watch for mined event and exit
  await eventPromise
}

async function createOrganisation() {
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'createOrganisation',
    account: address, 
  })

  await broadcastTxAndWaitTillMined({
    tx,
    privateKey,
    event: 'CreateOrganisation',
    filter: { creator: address },
    successTitle: '✓ Succesfully created organisation',
    httpProvider: program.httpProvider
  })
}

async function addConstituent(orgId, constituentAddress) {
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'addConstituent',
    account: address, 
    args: [orgId, constituentAddress.split(',')]
  }) 

  await broadcastTxAndWaitTillMined({
    tx,
    privateKey,
    event: 'AddConstituent',
    filter: { organisationId: orgId },
    successTitle: '✓ Succesfully added constituent(s) to oragnisation',
    httpProvider: program.httpProvider
  })

}

async function removeConstituent(orgId, constituentAddress, args){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'removeConstituent',
    account: address, 
    args: [orgId, constituentAddress]
  }) 

  await broadcastTxAndWaitTillMined({
    tx,
    privateKey,
    event: 'RemoveConstituent',
    filter: { organisationId: orgId },
    successTitle: '✓ Succesfully removed constituent from oragnisation ',
    httpProvider: program.httpProvider
  })

  // const { privateKey, address } = await lib.getAccount(program).catch(logError)

  // const tx = await lib.removeConstituent({ 
  //   orgId,
  //   constituentAddress,
  //   contractAddress, 
  //   account: address, 
  //   network: '*',
  //   provider: program.httpProvider
  // })

  // console.log(colors.green(`✔ Succesfully created the transaction`))

  // const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  // await lib.broadcast({ signedTx: rawTransaction })

  // console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  // console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  // const displayResult = (event) => {
  //   const { organisationId, constituent } = event.returnValues
  //   console.log(colors.green(`✓ Succesfully removed constituent from oragnisation ${orgId}`))
  //   console.log(colors.green(`\nOrganisation ID = ${organisationId.toString()}`))
  //   console.log(colors.green(`\nConstituent   = ${constituent}\n`))
  // }
  //  // watch for mined event and exit
  //  await lib.subscribeEvent('RemoveConstituent', { organisationId: orgId }, displayResult, logError, transactionHash)


}
/**
 * 

 { initiativeTitle: 'one', ballotOptions: [1,2,3,4], expiryTime: 1556700062459 }
 */

async function addInitiative(orgId, initiative){
  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const {
    initiativeTitle, 
    ballotOptions,
    expiryTime, 
    number_of_votes_allowed=0, 
    allowAnyOne=false,
  } = JSON.parse(initiative)

  const tx = await lib.call({ 
    command: 'addInitiative',
    account: address, 
    args: [orgId, initiativeTitle, ballotOptions, expiryTime, number_of_votes_allowed, allowAnyOne]
  })

  await broadcastTxAndWaitTillMined({
    tx,
    privateKey,
    event: 'AddInitiative',
    filter: { organisationId: orgId },
    successTitle: '✓ Succesfully created initiative for organisation',
    httpProvider: program.httpProvider
  })

  // const { privateKey, address } = await lib.getAccount(program).catch(logError)

  // const {
  //   initiativeTitle, 
  //   ballotOptions,
  //   expiryTime, 
  //   number_of_votes_allowed=0, 
  //   allowAnyOne=false,
  // } = JSON.parse(initiative)
  
  // assert.ok(orgId)
  // assert.ok(initiativeTitle)
  // assert.ok(Array.isArray(ballotOptions))
  // assert.ok(expiryTime > 0)

  // const tx = await lib.addInitiative({
  //   orgId, 
  //   initiativeTitle, 
  //   ballotOptions, 
  //   expiryTime, 
  //   number_of_votes_allowed, 
  //   allowAnyOne,
  //   contractAddress, 
  //   account: address, 
  //   network: '*',
  //   provider: program.httpProvider
  // })

  // console.log(colors.green(`✔ Succesfully created the transaction`))

  // const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  // await lib.broadcast({ signedTx: rawTransaction })

  // console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  // console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))

  // const displayResult = (event) => {
  //   const { organisationId, initiativeId,initiativeTitle, expiryTime, number_of_votes_allowed, _ballotOptions } = event.returnValues
  //   console.log(colors.green(`✓ Succesfully created initiative for oragnisation ${orgId}`))
  //   console.table(
  //     [{ 
  //       organisationId: organisationId.toNumber(), 
  //       initiativeId: initiativeId.toNumber(), 
  //       initiativeTitle, 
  //       expiryTime: expiryTime.toNumber(), 
  //       number_of_votes_allowed: number_of_votes_allowed.toNumber() , 
  //       ballotOptions: _ballotOptions.map(item => item.toNumber()).toString()  }]  )
  //   // console.log(colors.green(`\nConstituent   = ${constituent}\n`))
  // }

  // // watch for mined event and exit
  // await lib.subscribeEvent('AddInitiative', { organisationId: orgId }, displayResult, logError, transactionHash)

}

async function vote(orgId, initiativeId, choice){

  const { privateKey, address } = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'vote',
    account: address, 
    args: [orgId, initiativeId, choice]
  })

  await broadcastTxAndWaitTillMined({
    tx,
    privateKey,
    event: 'Vote',
    filter: { organisationId: orgId, voter: address },
    successTitle: `✓ Succesfully voted for initiative ${initiativeId} in organisation`,
    httpProvider: program.httpProvider
  })

  
  // const { privateKey, address } = await lib.getAccount(program).catch(logError)

  // const tx = await lib.vote({
  //   orgId, 
  //   initiativeId, 
  //   choice,
  //   contractAddress, 
  //   account: address, 
  //   network: '*',
  //   provider: program.httpProvider
  // })

  // console.log(colors.green(`✔ Succesfully created the transaction`))

  // const { rawTransaction, transactionHash } = await lib.signTransaction({ tx, privateKey })
  // await lib.broadcast({ signedTx: rawTransaction })

  // console.log(colors.green(`✔ Succesfully broadcasted the transaction`))
  // console.log(colors.gray(`check transaction status at \nhttps://rinkeby.etherscan.io/tx/${transactionHash}.. `))
  // const displayResult = (event) => {
  //   const { organisationId, voter, success } = event.returnValues
  //   console.log(colors.green(`✓ Succesfully voted for initiative ${initiativeId} in organisation ${orgId}`))
  //   console.table([
  //     {
  //       organisationId, voter, success
  //     }
  //   ])
  // }
  //  // watch for mined event and exit
  //  await lib.subscribeEvent('Vote', { organisationId: orgId, voter: address }, displayResult, logError, transactionHash)

}

async function getInitiativeResult(orgId, initiativeId, args) {
  const { address } = await lib.getAccount(program).catch(logError)

  const spinner = ora('Fetching result ..');
  spinner.start()

  const { data } = await lib.call({ 
    command: 'getInitiativeResult',
    account: address, 
    args: [orgId, initiativeId]
  })

  const Vote = function(choice, vote){
    this.choice = choice
    this.votes = vote
  }
  const result = {}

  const votes = data['0'].map((choice, index) => result[index+1] = new Vote(parseInt(choice._hex, 16), parseInt(data['1'][index]._hex, 16)))
  spinner.stop()
  console.table(result)

  process.exit()
}

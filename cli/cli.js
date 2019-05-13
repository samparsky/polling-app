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

const contractAddress = '0x98f8b3425a3ff787429a3f27a357e6a6bbf8bd79'
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

}

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

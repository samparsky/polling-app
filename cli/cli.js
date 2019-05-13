#!/usr/bin/env node

const program = require("commander")
const colors = require('colors')
const ora = require('ora')

program
  .version('0.1.0')
  .option('-n, --chain <chain>', 'default: ethereum', 'ethereum')
  .option('-p, --httpProvider <provider>', 'http provider', 'https://goerli.prylabs.net/')
  .option('-w, --websocketProvider <provider>', 'websocket provider', 'wss://goerli.prylabs.net/websocket')
  .option('-n, --chainId <chainId>', 'chain id', '5')
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

const contractAddress = getContractAddress()
const lib = require('./lib')( program.httpProvider, program.websocketProvider, contractAddress)
program.parse(process.argv);

function logError(e){
  console.log(`\n${colors.red(e.toString())}\n`)
  process.exit()
}

function displayResult(title, property) {
  return function(event) {
    console.log(colors.green(`${title}`))
    console.log({ event })
    const result = {}
    
    property.forEach(function(ppty){
      if(typeof event.args[ppty] == 'string'){
        result[ppty] = event.args[ppty]
      } else {
        result[ppty] = parseInt(event.args[ppty]._hex, 16)
      }
    })

    console.table(result)
  }
}

function getContractAddress(chain, network){
  // return default goerli address
  return '0x98f8b3425a3ff787429a3f27a357e6a6bbf8bd79'
}

async function broadcastTxAndWaitTillMined({tx, event, filter, successTitle, httpProvider}) {
  console.log(colors.green(`✔ Succesfully created the transaction`))
  const { rawTransaction, transactionHash } = await lib.signTransaction(tx)
  // watch for mined event and exit
  const eventPromise = lib.subscribeEvent(
    event,
    filter, 
    displayResult(successTitle, ['creator', 'organisationId']), 
    logError, 
    transactionHash)

  await lib.call({ command: 'broadcast', account: '0x3d20c11f4e3f8b9f13d5badc9fbd39259d4c6946', args: [rawTransaction] })

  // watch for mined event and exit
  await eventPromise
}

async function createOrganisation() {
  const address = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({
    command: 'createOrganisation',
    account: address, 
  })

  await broadcastTxAndWaitTillMined({
    tx,
    event: 'CreateOrganisation',
    filter: [address],
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

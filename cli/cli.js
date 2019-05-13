#!/usr/bin/env node

const program = require("commander")
const colors = require('colors')
const ora = require('ora')

program
  .version('0.1.0')
  .option('-n, --chain <chain>', 'default: ethereum', 'ethereum')
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
const lib = require('./lib')(contractAddress)
program.parse(process.argv);

function logError(e){
  console.log(`\n${colors.red(e.toString())}\n`)
  process.exit()
}

function displayResult(title) {
  return function(event) {
    console.log(colors.green(`${title}`))
    const result = {}
    const keys = (Object.keys(event.args)).filter(key => key.length > 2 && key != 'length')
    
    keys.forEach(function(ppty){
      if(event.args[ppty]) {
        if(typeof event.args[ppty] == 'string'){
          result[ppty] = event.args[ppty]
        } else if (event.args[ppty]._hex){
          result[ppty] = parseInt(event.args[ppty]._hex, 16)
        } else {
          result[ppty] = event.args[ppty].toString()
        }
      }
    })

    console.table(result)
  }
}

function getContractAddress(chain, network){
  // return default goerli address
  return '0x98f8b3425a3ff787429a3f27a357e6a6bbf8bd79'
}

async function broadcastTxAndWaitTillMined({tx, event, filter, successTitle}) {
  console.log(colors.green(`✔ Succesfully created the transaction`))
  const { rawTransaction, transactionHash } = await lib.signTransaction(tx)
  // watch for mined event and exit
  const eventPromise = lib.subscribeEvent(
    event,
    filter, 
    displayResult(successTitle), 
    logError, 
    transactionHash)

  await lib.call({ command: 'broadcast', args: [rawTransaction] })

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
  })
}

async function addConstituent(orgId, constituentAddress) {
  const address = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'addConstituent',
    account: address, 
    args: [orgId, constituentAddress.split(',')]
  }) 

  await broadcastTxAndWaitTillMined({
    tx,
    event: 'AddConstituent',
    filter: [`0x${orgId.toString(16)}`],
    successTitle: '✓ Succesfully added constituent(s) to oragnisation',
  })

}

async function removeConstituent(orgId, constituentAddress, args){
  const address = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'removeConstituent',
    account: address, 
    args: [orgId, constituentAddress]
  }) 

  await broadcastTxAndWaitTillMined({
    tx,
    event: 'RemoveConstituent',
    filter: [`0x${orgId.toString(16)}`],
    successTitle: '✓ Succesfully removed constituent from oragnisation ',
  })

}

async function vote(orgId, initiativeId, choice){

  const address = await lib.getAccount(program).catch(logError)

  const tx = await lib.call({ 
    command: 'vote',
    account: address, 
    args: [orgId, initiativeId, choice]
  })

  await broadcastTxAndWaitTillMined({
    tx,
    event: 'Vote',
    filter: [`0x${orgId.toString(16)}`, address],
    successTitle: `✓ Succesfully voted for initiative ${initiativeId} in organisation`,
  })
}

async function addInitiative(orgId, initiative){
  const address = await lib.getAccount(program).catch(logError)

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
    event: 'AddInitiative',
    filter:  [`0x${orgId.toString(16)}`],
    successTitle: '✓ Succesfully created initiative for organisation',
  })
}

async function getInitiativeResult(orgId, initiativeId, args) {
  const address = await lib.getAccount(program).catch(logError)

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

  data['0'].map((choice, index) => result[index+1] = new Vote(parseInt(choice._hex, 16), parseInt(data['1'][index]._hex, 16)))

  spinner.stop()
  console.table(result)

  process.exit()
}

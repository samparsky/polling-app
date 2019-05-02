const Web3 = require('web3')
const assert = require('assert')
const fetch = require('node-fetch')
const abi = require('./Polling.json');
const Spinner = require('cli-spinner').Spinner;


module.exports = function( httpProvider, websocketProvider, contractAddress ) {
    const web3 = new Web3(new Web3.providers.HttpProvider(httpProvider))
    const wsWeb3 =  new Web3(new Web3.providers.WebsocketProvider(websocketProvider))
    const pollingContract = new wsWeb3.eth.Contract(abi, contractAddress)

    return {

    signTransaction: async function({ privateKey, tx }) {
        const { rawTransaction } =  await web3.eth.accounts.signTransaction(tx, privateKey)
        const  transactionHash = web3.utils.sha3(rawTransaction, { encoding: "hex" });

        return { rawTransaction, transactionHash }
    },

    subscribeEvent: async function(event, filter, display, logError, transactionHash ) {
        const spinner = new Spinner(`\n %s Waiting for transaction to be mined..\n`);
        spinner.start();
      
        pollingContract.events[event]({
            filter,
        }, function(error, event) {
            spinner.stop();
            spinner.clearLine()

            if(error){
                logError(error)
            } else {
                display(event)
            }

            process.exit()
        })
    },

    getAccount: async function ({ keystore, password, provider }){
        const web3 = new Web3(new Web3.providers.HttpProvider(provider))
        // load keystore json file
        const loadKeystore = require(keystore)
        return web3.eth.accounts.decrypt(loadKeystore, password)
    },      

    createOrganisation: async function({ account, contractAddress, provider }){
        const Web3 = require('web3')
        const web3 = new Web3(new Web3.providers.HttpProvider(provider))

        // get gas price
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const nonce = await web3.eth.getTransactionCount(account)
        const pollingContract = new web3.eth.Contract(abi, contractAddress)
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

    },

    addConstituent: async function({ orgId, constituentAddress, account, contractAddress, provider}) {
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const nonce = await web3.eth.getTransactionCount(account)
        const pollingContract = new web3.eth.Contract(abi, contractAddress)
        const calldata = await pollingContract.methods.addConstituent(orgId, constituentAddress).encodeABI()
        const gasLimit = await pollingContract.methods.addConstituent(orgId, constituentAddress).estimateGas()

        return {
            nonce,
            gasPrice: fast,
            gasLimit,
            to: contractAddress,
            value: '0x00', 
            data: calldata,
            chainId: 1337
        }
    },
    removeConstituent: async function({ orgId, constituentAddress, account, contractAddress, provider='ropsten'}) {
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const nonce = await web3.eth.getTransactionCount(account)
        const pollingContract = new web3.eth.Contract(abi, contractAddress)
        const calldata = await pollingContract.methods.removeConstituent(orgId, constituentAddress).encodeABI()
        const gasLimit = await pollingContract.methods.removeConstituent(orgId, constituentAddress).estimateGas()

        return {
            nonce,
            gasPrice: fast,
            gasLimit,
            to: contractAddress,
            value: '0x00', 
            data: calldata,
            chainId: 1337
        }
    },
    addInitiative: async function({
        orgId, 
        initiativeTitle, 
        ballotOptions, 
        expiryTime, 
        number_of_votes_allowed, 
        allowAnyOne,
        contractAddress, 
        account, 
        provider
      }) {
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const nonce = await web3.eth.getTransactionCount(account)
        const pollingContract = new web3.eth.Contract(abi, contractAddress, { gasPrice: fast, defaultAccount: account })
        const calldata = await pollingContract.methods.addInitiative(
            orgId, 
            initiativeTitle, 
            ballotOptions, 
            expiryTime, 
            number_of_votes_allowed, 
            allowAnyOne
        ).encodeABI()

        const gasLimit = await pollingContract.methods.addInitiative(
            orgId, 
            initiativeTitle, 
            ballotOptions, 
            expiryTime, 
            number_of_votes_allowed, 
            allowAnyOne
        ).estimateGas()

        return {
            nonce,
            gasPrice: fast,
            gasLimit,
            to: contractAddress,
            value: '0x00', 
            data: calldata,
            chainId: 1337
        }

    },
    vote: async function({
        orgId, 
        initiativeId,
        choice,
        contractAddress, 
        account, 
        provider
    }) {
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const nonce = await web3.eth.getTransactionCount(account)
        const pollingContract = new web3.eth.Contract(abi, contractAddress, { gasPrice: fast, defaultAccount: account })
        const calldata = await pollingContract.methods.vote(orgId, initiativeId, choice).encodeABI()
        const gasLimit = await pollingContract.methods.vote(orgId, initiativeId, choice).estimateGas()

        return {
            nonce,
            gasPrice: fast,
            gasLimit,
            to: contractAddress,
            value: '0x00', 
            data: calldata,
            chainId: 1337
        }
    },
    getInitiativeResult: async function({
        orgId, 
        initiativeId,
        contractAddress, 
        account, 
        provider
    }) {
        const { fast } = await fetch('https://ethgasstation.info/json/ethgasAPI.json').then(res => res.json())
        const pollingContract = new web3.eth.Contract(abi, contractAddress, { gasPrice: fast, defaultAccount: account })
        const result = await pollingContract.methods.getInitiativeResult(orgId, initiativeId).call()
        return result
    },

    broadcast: async function({ signedTx, provider}) {
        const Web3 = require('web3')
        const web3 = new Web3(new Web3.providers.HttpProvider(provider))

        // assert
        assert.ok(signedTx.startsWith('0x'), 'signed transaction should start with 0x')

        await web3.eth.sendSignedTransaction(signedTx)
        .on('error', function(err){
            console.error(err)
            process.exit()
        })
    }
}
}
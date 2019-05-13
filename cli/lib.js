const Web3 = require('web3')
const abi = require('./Polling.json');
// const a8Connect = require('@autom8/js-a8-connect')
const util = require('util')
const colors = require('colors')
const exec = util.promisify(require('child_process').exec)
const ora = require('ora');

const a8 = {
    invoke: async function(params, app=`samparsky.title`){
        const options = JSON.stringify(params)
        const response = await exec(`a8 invoke ${app} '${options}'`).catch(console.log)
        console.log({ response })
        return JSON.parse(response.stdout)
    }
}

module.exports = function( httpProvider, websocketProvider, contractAddress, network=1337 ) {
    const web3 = new Web3(new Web3.providers.HttpProvider(httpProvider))
    const wsWeb3 =  new Web3(new Web3.providers.WebsocketProvider(websocketProvider))
    const pollingContract = new wsWeb3.eth.Contract(abi, contractAddress)
    
    // const a8 = new a8Connect({port: 3035})

    return {
        signTransaction: async function({ privateKey, tx }) {
            const { rawTransaction } =  await web3.eth.accounts.signTransaction(tx, privateKey)
            const  transactionHash = web3.utils.sha3(rawTransaction, { encoding: "hex" });

            return { rawTransaction, transactionHash }
        },

        subscribeEvent: async function(event, filter, display, logError, transactionHash ) {
            console.log(colors.gray(`transaction hash ${transactionHash}`))
            const spinner = ora('Waiting for transaction to be mined..');
            spinner.start()

            pollingContract.events[event]({
                filter,
            }, function(error, event) {
                spinner.stop();
                // console.log({ error })
                // console.log({ event })
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

        call: async function({ account, command, args=[] }) {
                const { response } = await a8.invoke({
                    command,
                    account,
                    contractAddress, 
                    httpProvider,
                    args
                })

                const { data, err } = JSON.parse(response)
                if(err) {
                    console.error(err)
                    process.exit()
                }

                return {
                    ...data,
                    chainId: 1337
                }
        },
    }
}
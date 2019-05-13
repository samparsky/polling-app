const web3 = require('web3')
const abi = require('./Polling.json');
const ethers = require('ethers')
// const a8Connect = require('@autom8/js-a8-connect')
const util = require('util')
const colors = require('colors')
const exec = util.promisify(require('child_process').exec)
const ora = require('ora');

const a8 = {
    invoke: async function(params, app=`samparsky.title`){
        const options = JSON.stringify(params)
        const response = await exec(`a8 invoke ${app} '${options}'`).catch(console.log)
        return JSON.parse(response.stdout)
    }
}

module.exports = function( contractAddress) {
    // const a8 = new a8Connect({port: 3035})
    const provider = ethers.getDefaultProvider('goerli');
    let wallet

    return {
        signTransaction: async function(tx) {
            if(!wallet){
                console.error('wallet not unlocked')
                process.exit()
            }
             const rawTransaction = await wallet.sign(tx)
            const  transactionHash = ethers.utils.keccak256(rawTransaction);

            return { rawTransaction, transactionHash }
        },
        getAccount: async function({ keystore, password }){
            const loadKeystore = require(keystore)
            wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(loadKeystore), password)
            return wallet.address
        }, 
        subscribeEvent: async function(event, filter, display, logError, transactionHash ) {
            const pollingContract = new ethers.Contract(contractAddress, abi, provider)

            console.log(colors.gray(`transaction hash ${transactionHash}`))
            const spinner = ora('Waiting for transaction to be mined..');
            spinner.start()
            const eventFilter = pollingContract.filters[event](...filter)

            pollingContract.once(eventFilter, function(){
                spinner.stop();
                // last argument is event object
                display(arguments[arguments.length - 1])
                process.exit()
            })

            setTimeout(function(){
                console.error(`An error occurred, please check transaction status online ${transactionHash}`)
                process.exit()
            }, 180000)
        },  

        call: async function({ account, command, args=[] }) {
                const { response } = await a8.invoke({
                    command,
                    account,
                    contractAddress, 
                    args
                })

                const { data, err } = JSON.parse(response)
                console.log(response)
                if(err) {
                    console.error(`\n${colors.red(err)}`)
                    process.exit()
                }

                return {
                    ...data,
                }
        },
    }
}
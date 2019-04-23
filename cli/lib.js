const { Contract, ContractFactory, Wallet} = require('ethers')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/<REDACTED API KEY"));

module.exports = {

    createOrganisation: function({ account, contractAddress }){
        const nonce = web3.eth.getTransactionCount(account)
        const gasPrice = web3.at
        return {
            contractAddress,
            nonce,
            gasPrice: '0x09184e72a000', 
            gasLimit: '0x2710',
            to: '0x0000000000000000000000000000000000000000', 
            value: '0x00', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            // EIP 155 chainId - mainnet: 1, ropsten: 3
            chainId: 3
        }
    }
}
# Polling App

This is sample application built using A8 decentralised serverless platform and Ethereum

# Infura.io

# Goerli Testnet

The contract has been deployed on the goerli testnet.
  
Contract Address: 0x98f8b3425a3ff787429a3f27a357e6a6bbf8bd79
Get goerli testnet ether from https://faucet.goerli.mudit.blog/


# Commands

### Create Organisation
```sh
./cli.js --keystore ./keystore.json --password test create_organisation
```

### Add Constituent

```sh
./cli.js --keystore ./keystore.json --password test add_constituent  <orgId> <constituentAddress>
```

Params

constituentAddress : comma separated list of constituent address

orgId : Organsation id

example
```sh
./cli.js --keystore ./keystore.json --password test add_constituent 17 0x9ace976f2f06f2d2815a93f1866011007171fdb2,0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe
```

### Remove Constituent

```sh
./cli.js --keystore ./keystore.json --password test remove_constituent <orgId> <constituentAddress>
```
example
```sh
./cli.js --keystore ./keystore.json --password test remove_constituent 17 0x9ace976f2f06f2d2815a93f1866011007171fdb2
```

### Add Initiative

```sh
./cli.js --keystore ./keystore.json --password test add_initiative <OrgId> <intiative> (in json format )
```

example
```sh
./cli.js --keystore ./keystore.json --password test add_initiative 41 '{"initiativeTitle":"one","ballotOptions":[1,2,3,4],"expiryTime":1556700062459,"allowAnyOne": true}'
```

### Vote

```sh
./cli.js --keystore ./keystore.json --password test vote <OrgId> <InitiativeId> <choice>
```

example
```sh
./cli.js --keystore ./keystore.json --password test vote 17 0 1
```

### Get Vote Result

```sh
./cli.js --keystore ./keystore.json --password test get_result <OrgId> <initiativeId>
```

##### Params
Organisation id
Initiative Id

example
```sh
./cli.js --keystore ./keystore.json --password test get_result 17 0
```

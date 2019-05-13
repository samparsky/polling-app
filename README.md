# Polling App

This is sample application built using A8 decentralised serverless platform and Ethereum

###  Goerli Testnet

The contract has been deployed on the goerli testnet.
  
Contract Address: 0x98f8b3425a3ff787429a3f27a357e6a6bbf8bd79
Get goerli testnet ether from https://faucet.goerli.mudit.blog/

### Requirements
* NodeJS
#### Install A8 platform

Details to install a8 can be found here https://gitlab.com/autom8.network/docs

# Commands

### Create Organisation

```sh
./cli.js --keystore ./keystore.json --password <password> create_organisation
```

### Add Constituent

```sh
./cli.js --keystore ./keystore.json --password <password> add_constituent  <orgId> <constituentAddress>
```

Params

constituentAddress : comma separated list of constituent address

orgId : Organsation id

example
```sh
./cli.js --keystore ./keystore.json --password <password> add_constituent 17 0x9ace976f2f06f2d2815a93f1866011007171fdb2,0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe
```

### Remove Constituent

```sh
./cli.js --keystore ./keystore.json --password <password> remove_constituent <orgId> <constituentAddress>
```
example
```sh
./cli.js --keystore ./keystore.json --password <password> remove_constituent 17 0x9ace976f2f06f2d2815a93f1866011007171fdb2
```

### Add Initiative

```sh
./cli.js --keystore ./keystore.json --password <password> add_initiative <OrgId> <intiative> (in json format )
```

example
```sh
./cli.js --keystore ./keystore.json --password <password> add_initiative 41 '{"initiativeTitle":"one","ballotOptions":[1,2,3,4],"expiryTime":1556700062459,"allowAnyOne": true}'
```

### Vote

```sh
./cli.js --keystore ./keystore.json --password <password> vote <OrgId> <InitiativeId> <choice>
```

example
```sh
./cli.js --keystore ./keystore.json --password <password> vote 17 0 1
```

### Get Vote Result

```sh
./cli.js --keystore ./keystore.json --password <password> get_result <OrgId> <initiativeId>
```

##### Params
Organisation id
Initiative Id

example
```sh
./cli.js --keystore ./keystore.json --password <password> get_result 17 0
```

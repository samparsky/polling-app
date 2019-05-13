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

Create an organisation

```sh
./cli.js --keystore ./keystore.json --password <password> create_organisation

✔ Succesfully created the transaction
transaction hash 0xc17ac70c34076f2085cfcd12b4576beaefcd40816eda7722ac40f5c229c8799c
✓ Succesfully created organisation

┌────────────────┬──────────────────────────────────────────────┐
│    (index)     │                    Values                    │
├────────────────┼──────────────────────────────────────────────┤
│    creator     │ '0x3d20C11F4E3F....'                         │
│ organisationId │                      6                       │
└────────────────┴──────────────────────────────────────────────┘
```


### Add Constituent

```sh
./cli.js --keystore ./keystore.json --password <password> add_constituent  <orgId> <constituentAddress>
```

Params

`constituentAddress : comma separated list of constituent address`

`orgId : Organsation id`

Example

```sh
./cli.js --keystore ./keystore.json --password <password> add_constituent 5 0x3d20C11F4E3F8B9F13d5BAdc9fBD39259d4C6946

✔ Succesfully created the transaction
transaction hash 0x118fb0eace8380884...
✓ Succesfully added constituent(s) to oragnisation

┌────────────────┬──────────────────────────────────────────────┐
│    (index)     │                    Values                    │
├────────────────┼──────────────────────────────────────────────┤
│ organisationId │                      5                       │
│  constituents  │ '0x3d20C11F4E3F8B9F13d5BAdc9fBD39259d4C6946' │
└────────────────┴──────────────────────────────────────────────┘
```

### Remove Constituent

```sh
./cli.js --keystore ./keystore.json --password <password> remove_constituent <orgId> <constituentAddress>
```

Example

```sh
./cli.js --keystore ./keystore.json --password <password> remove_constituent 5 0x3d20C11F4E3F8B9F13d5BAdc9fBD39259d4C6946

✔ Succesfully created the transaction
transaction hash 0xcff57bf27f15c99ad1d5....
✓ Succesfully removed constituent from oragnisation
┌────────────────┬──────────────────────────────────────────────┐
│    (index)     │                    Values                    │
├────────────────┼──────────────────────────────────────────────┤
│ organisationId │                      5                       │
│  constituent   │ '0x3d20C11F4E3F8B9F13d5BAdc9fBD39259d4C6946' │
└────────────────┴──────────────────────────────────────────────┘

```

### Add Initiative

```sh
./cli.js --keystore ./keystore.json --password <password> add_initiative <OrgId> <intiative> (in json format )

```

Example

```sh
./cli.js --keystore ./keystore.json --password <password> add_initiative 5 '{"initiativeTitle":"one","ballotOptions":[1,2,3,4],"expiryTime":1556700062459,"allowAnyOne": true}'

✔ Succesfully created the transaction
transaction hash 0xdc07ffb3611438733091e5d91bb742ae4ed4..
✓ Succesfully created initiative for organisation

┌─────────────────────────┬───────────────┐
│         (index)         │    Values     │
├─────────────────────────┼───────────────┤
│     organisationId      │       5       │
│      initiativeId       │       1       │
│     initiativeTitle     │     'one'     │
│       expiryTime        │ 1556700062459 │
│ number_of_votes_allowed │       0       │
│     _ballotOptions      │   '1,2,3,4'   │
└─────────────────────────┴───────────────┘

```

### Vote

```sh
./cli.js --keystore ./keystore.json --password <password> vote <OrgId> <InitiativeId> <choice>
```

Example

```sh
./cli.js --keystore ./keystore.json --password <password> vote 17 0 1

┌────────────────┬──────────────────────────────────────────────┐
│    (index)     │                    Values                    │
├────────────────┼──────────────────────────────────────────────┤
│ organisationId │                      5                       │
│     voter      │ '0x3d20C11F4E3F8B9F13d5BAdc9fBD39259d4C6946' │
│    success     │                    'true'                    │
└────────────────┴──────────────────────────────────────────────┘

```

### Get Vote Result

```sh
./cli.js --keystore ./keystore.json --password <password> get_result <OrgId> <initiativeId>
```

##### Params
`organisation id`
`initiative Id`

Example

```sh
./cli.js --keystore ./keystore.json --password <password> get_result 17 0

┌─────────┬────────┬───────┐
│ (index) │ choice │ votes │
├─────────┼────────┼───────┤
│    1    │   1    │   1   │
│    2    │   2    │   0   │
│    3    │   3    │   0   │
│    4    │   4    │   0   │
└─────────┴────────┴───────┘

```

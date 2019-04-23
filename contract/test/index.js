const Polling = artifacts.require("Polling")

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

contract('Polling', (accounts) => {
    let polling, snapId;

    const creator       = accounts[0]
    const constituent1  = accounts[1]
    const constituent2  = accounts[2]
    const constituent3  = accounts[3]

    const constituents = [constituent1, constituent2]

    const createOrgranisation = async () => await polling.createOrgranisation({from: creator})
    const addConstituents = async (organisationId) => await polling.addConstituent(organisationId, constituents, { from: creator})

    before(async() => {
        polling = await Polling.deployed()
        // snapId = await takeSnapshot();
    })

    afterEach('revert the blockchain snapshot', async function () {
        // await revertToSnapshot(snapId) // revert to the snapshot
        // snapId = await takeSnapshot();
      })

    it('should create organisation', async() => {
        const tx = await createOrgranisation()
        assert.equal(tx.logs[0].args.organisationId, 0, "failed to create organisation");
    })

    it('should add constituent to organisation', async() => {
        // create organisation
        const tx = await createOrgranisation()
        const { organisationId } = tx.logs[0].args

        // add constituent 
        const addConstituentTx = await addConstituents(organisationId.toNumber());

        assert.equal(addConstituentTx.logs[0].args.organisationId, 1, "failed to create organisation");
        assert.deepEqual(addConstituentTx.logs[0].args.constituents, constituents, "Failed to add constituents")
    })

    it('should remove constituent from organisation', async() => {
        // create organisation
        const tx = await createOrgranisation()
        const { organisationId } = tx.logs[0].args

        // add constituent 
        await addConstituents(organisationId.toNumber());

        // remove constituent
        const removeConstituentTx = await polling.removeConstituent(organisationId.toNumber(), constituent1, { from: creator});

        assert.equal(removeConstituentTx.logs[0].args.organisationId, 2, "failed to remove constituent");
        assert.equal(removeConstituentTx.logs[0].args.constituent, constituent1, "failed to remove constituent");

    })

    it('should add initiative for organisation', async() => {
        // create organisation
        const tx = await createOrgranisation()
        const organisationId = tx.logs[0].args.organisationId.toNumber()

        // add constituent 
        await addConstituents(organisationId);

        // add initiave by creator
        const addInitiativeTx = await polling.addInitiative( 
            organisationId,  
            'test',  
            [1, 2, 3, 4, 5,],
            Date.now('2101-01-01'), 
            0,
            true,
            {from: creator}
        )


        assert.equal(addInitiativeTx.logs[0].args.organisationId, organisationId, "failed to add initiative");
        assert.equal(addInitiativeTx.logs[0].args.initiativeId, 0, "failed to add initiative");

    })

    it('should allow constituent to vote for ballotOption in initiative for organisation', async() => {
        // create organisation
        const tx = await createOrgranisation()
        const organisationId = tx.logs[0].args.organisationId.toNumber()

        // add constituent 
        await addConstituents(organisationId);

        // add initiave by creator
        const addInitiativeTx = await polling.addInitiative( 
            organisationId,
            'test',  
            [ 1, 2, 3 ],
            Date.now('2101-01-01'), 
            0,
            false,
            {from: creator}
        )

        const initiativeId = addInitiativeTx.logs[0].args.initiativeId.toNumber()

        // vote for intiative
        const voteTx = await polling.vote(organisationId, initiativeId, 1, { from: constituent1 })

        assert.equal(voteTx.logs[0].args.success, true, "succesfully voted");

    })

    it('should allow to get an initiative result for organisation', async() => {
        // create organisation
        const tx = await createOrgranisation()
        const organisationId = tx.logs[0].args.organisationId.toNumber()

        // add constituent 
        await addConstituents(organisationId);

        // add initiave by creator
        const addInitiativeTx = await polling.addInitiative( 
            organisationId,
            'test',  
            [ 1, 2, 3 ],
            Date.now('2101-01-01'), 
            0,
            false,
            {from: creator}
        )

        const initiativeId = addInitiativeTx.logs[0].args.initiativeId.toNumber()

        // vote for intiative
        await polling.vote(organisationId, initiativeId, 1, { from: constituent1 })
        await polling.vote(organisationId, initiativeId, 2, { from: constituent2 })

        const intiativeResult = await polling.getInitiativeResult(organisationId, initiativeId);
        
        const expectedResult = [1, 1, 0]
        for(let i = 0; i < intiativeResult['0'].length; i++) {
            const result = intiativeResult['1'][i]
            assert.equal(result, expectedResult[i], 'should have the expected result')
        }
        
    })


})

function takeSnapshot() {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_snapshot",
                params: [],
                id: new Date().getTime()
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result.result);
            }
        );
    });
}

function revertToSnapshot(snapShotId) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_revert",
                params: [snapShotId],
                id: new Date().getTime()
            },
            err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            }
        );
    });
}
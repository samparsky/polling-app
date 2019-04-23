pragma solidity >=0.4.21 <0.6.0;

contract Polling {

    struct Initiative {
        uint initiativeId;
        string initiativeTitle; // very short description of what is being voted on
        uint expiryTime;
        uint number_of_votes_allowed;
        uint[] ballotOptions; // integer representation of available voting options
        bool allowAnyone;
        bool exists;
    }

    struct Organisation {
        address creator;
        uint orgId;
        bool exists;
    }

    modifier allowOnlyOrgOwner(uint orgId) {
        require(msg.sender == organisations[orgId].creator);
        _;
    }

    // mapping of constituent address to orgId to exists
    mapping(address => mapping(uint => bool)) constituents;
    // mapping of orgId to intiativeId to totalVotes
    mapping(uint => mapping(uint => uint)) totalVotes;
    // mapping of orgId to intiativeId to ballotOption and vote
    mapping(uint => mapping(uint => mapping(uint => uint))) votes;
     // mapping of orgId to org intiatives
    mapping(uint => Initiative[]) intiatives;
    // mapping of orgId to initiativeid to constituent to have voted
    mapping(uint => mapping(uint => mapping(address => bool ))) voted;

    // array of created organisations
    Organisation[] organisations;

    function createOrgranisation() public {
        address creator = msg.sender;
        uint orgId = organisations.length;
        
        Organisation memory newOrganisation = Organisation(
            creator,
            orgId,
            true
        );
        
        organisations.push(newOrganisation);
        emit CreateOrganisation(creator, orgId);
    }
    
    function addConstituent(uint _organisationId, address[] memory _constituents) allowOnlyOrgOwner(_organisationId) public {
        for (uint i = 0; i < _constituents.length; i++) {
            address constituent = _constituents[i];
            constituents[constituent][_organisationId] = true;
        }

        emit AddConstituent(
            _organisationId,
            _constituents
        );
    }

    function removeConstituent(uint _organisationId, address _constituent) allowOnlyOrgOwner(_organisationId) public {
        require(constituents[_constituent][_organisationId] == true, 'constituent doest not exist');
        
        // remove constituent
        constituents[_constituent][_organisationId] = false;

        emit RemoveConstituent(
            _organisationId,
            _constituent
        );
    }

    function addInitiative( 
        uint _organisationId,  
        string memory _initiativeTitle,  
        uint[] memory _ballotOptions,
        uint _expiryTime, 
        uint _number_of_votes_allowed,
        bool _allowAnyOne
    ) public allowOnlyOrgOwner(_organisationId) {

        require(_ballotOptions.length > 0, 'should have ballotOptions');
        require(_expiryTime > now, 'should expire in the future');

        uint initiativeId = intiatives[_organisationId].length;

        Initiative memory newInitiative = Initiative(
            initiativeId,
            _initiativeTitle,
            _expiryTime,
            _number_of_votes_allowed,
            _ballotOptions,
            _allowAnyOne,
            true
        );

        // store
        intiatives[_organisationId].push(newInitiative);
        
        emit AddInitiative(
            _organisationId,
            initiativeId,
            _initiativeTitle,
            _expiryTime,
            _number_of_votes_allowed,
            _ballotOptions
        );
    }

    function vote(uint _orgId, uint _initiativeId, uint _choice) public {
        // check if initiave exists
        Initiative storage initiative = intiatives[_orgId][_initiativeId];
        uint[] storage ballotOptions = initiative.ballotOptions;
        address constituent = msg.sender;

        // check has not voted
        require(voted[_orgId][_initiativeId][constituent] == false, 'you can only vote once');

        if(initiative.allowAnyone == false) {
            // check if the initiate allows anyone or just constituents
            require(isOrgConstituent(initiative, constituent, _orgId), 'only org constituents are allowed to vote');
        }

        require(initiative.exists == true && initiative.initiativeId == _initiativeId, 'intiative does not exist' );
        // check if time has not expired
        require(initiative.expiryTime > now, 'voting period has expired');
        // check if it doesn't exceed the number of votes allowed
        uint number_of_votes_allowed = initiative.number_of_votes_allowed;
        if(number_of_votes_allowed > 0 ){
            require(totalVotes[_orgId][_initiativeId] < number_of_votes_allowed, 'cannot exceed allowed votes');
        }
        // check if choice is part of ballotOptions
        require(partOfBallotOptions(ballotOptions, _choice), 'choice is not part of allowed ballot options');

        // increase choice by 1
        votes[_orgId][_initiativeId][_choice] += 1;
        // increase total vote
        totalVotes[_orgId][_initiativeId] += 1;
        // has voted
        voted[_orgId][_initiativeId][constituent] = true;

        emit Vote(true);
    }

    function getInitiativeResult(uint _orgId, uint _initiativeId) public view returns(uint[] memory, uint[] memory) {
        Initiative storage initative = intiatives[_orgId][_initiativeId];   
        uint[] storage ballotOptions = initative.ballotOptions;

        uint[] memory ballotResult = new uint[](ballotOptions.length);

        for(uint i = 0; i < ballotOptions.length; i++ ){
            // retreive the voting result
            ballotResult[i] = votes[_orgId][_initiativeId][ballotOptions[i]];
        }
        
        return (ballotOptions, ballotResult);
    }

    function isOrgConstituent(Initiative memory initiative, address _constituent, uint _organisationId) internal view returns(bool){
        if(initiative.allowAnyone) {
            return true;
        }

        return constituents[_constituent][_organisationId];
    }

    function partOfBallotOptions(uint[] memory ballotOptions, uint choice) internal pure returns(bool) {
        bool exists = false;
        for(uint i = 0; i < ballotOptions.length; i++) {
            if(choice == ballotOptions[i]) {
                exists = true;
            }
        }

        return exists;
    }

    event CreateOrganisation(
        address indexed creator,
        uint organisationId
    );

    event AddConstituent(
        uint indexed organisationId,
        address[] constituents
    );

    event RemoveConstituent(
        uint indexed organisationId,
        address constituent
    );

    event Vote(
        bool success
    );

    event AddInitiative(
        uint indexed organisationId,
        uint initiativeId,
        string initiativeTitle,
        uint expiryTime,
        uint number_of_votes_allowed,
        uint[] _ballotOptions
    );


}
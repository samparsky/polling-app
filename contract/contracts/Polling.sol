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

    modifier allowOnlyOrgOwner(orgId) {
        require(msg.sender == organisations[orgId].creator);
        _;
    }

    // array of created organisations
    Organisation[] organisations;
    // mapping of orgId to org intiatives
    mapping(uint => intiative[]) intiatives;
    // mapping of constituent address to orgId to exists
    mapping(address => mapping(uint => bool)) constituents;
    // mapping of orgId to intiativeId to totalVotes
    mapping(uint => mapping(uint => uint)) totalVotes;
    // mapping of orgId to intiativeId to ballotOption and vote
    mapping(uint => mapping(uint => mapping(uint => uint))) votes;

    /**
    * An address can create multiple organisations
    */
    function createOrgranisation() public {
        address creator = msg.sender;
        uint orgId = organisations.length;
        
        Organisation memory newOrganisation = Organisation(
            creator,
            orgId
        );
        
        organsiations.push(newOrganisation);
        emit CreateOrganisation(creator, orgId);
    }
    
    function addConstituent(uint _organisationId, address[] _constituents) allowOnlyOrgOwner(_organisationId) public {
        for (uint i = 0; i < _constituents.length; i++) {
            address constituent = _constituents[i];

            Constitutent memory newConstituent = Constitutent(
                _organisationId,
                constituent
            );

            constituents[newConstituent] = true;
        }

        emit AddConstituent(
            _organisationId,
            _constituents
        );
    }

    function removeConstituent(uint _organisationId, address _constituent) allowOnlyOrgOwner(_organisationId) public {
        Constitutent memory constituent = Constitutent(
                _organisationId,
                _constituent
        );
        require(constituents[constituent] == true, 'constituent doest not exist');
        
        // remove constituent
        delete constituents[constituent];

        emit RemoveConstituent(
            _organisationId,
            _constituent
        );
    }

    function addInitiative( 
        uint _organisationId,  
        string _initiativeTitle,  
        uint[] _ballotOptions,
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
            true,
        );

        // store
        intiatives[_organisationId].push(newInitiative);
        
        emit AddInitiative(
            _organisationId,
            initiativeId,
            _initiativeTitle,
            _expiryTime,
            _number_of_votes_allowed,
            _ballotOptions,
        );
    }

    function vote(uint _orgId, uint _initiativeId, uint _choice) public {
        // check if initiave exists
        Initiative storage initative = intiatives[_orgId][_initiativeId];
        uint[] ballotOptions = initative.ballotOptions;

        if(initiative.allowAnyone == false) {
            // check if the initiate allows anyone or just constituents
            require(isOrgConstituent(address _constituent, uint _orgId), 'only org constituents are allowed to vote');
        }

        require(initative.exists == true && initative., 'intiative does not exist' );
        // check if time has not expired
        require(initative.expiryTime > now, 'voting period has expired');
        // check if it doesn't exceed the number of votes allowed
        uint number_of_votes_allowed = initative.number_of_votes_allowed;
        if(number_of_votes_allowed > 0 ){
            require(totalVotes[_orgId][_initiativeId] < number_of_votes_allowed, 'cannot exceed allowed votes');
        }
        // check if choice is part of ballotOptions
        require(partOfBallotOptions(ballotOptions, _choice), 'choice is not part of allowed ballot options');

        // increase choice by 1
        votes[_orgId][_initiativeId][_choice] += 1;
        // increase total vote
        totalVotes[_orgId][_initiativeId] += 1;
    }

    function getInitiativeResult(uint _orgId, uint initiativeId) public returns(uint[], uint[]) {
        Initiative storage initative = intiatives[_orgId][_initiativeId];   
        uint[] storage ballotOptions = initative.ballotOptions;

        uint[] memory ballotResult = new uint[](ballotOptions.length);

        for(uint i = 0; i < ballotOptions.length; i++ ){
            // retreive the voting result
            ballotResult[i] = votes[_orgId][_initiativeId][ballotOptions[i]];
        }
        
        return ballotOptions, ballotResult
    }

    function isOrgConstituent(address _constituent, uint _orgId) internal pure returns(bool){
        Constitutent memory constituent = Constitutent(
                _organisationId,
                _constituent
        );
        return constituents[constituent];
    }

    function partOfBallotOptions(uint[] ballotOptions, uint choice) internal pure returns(bool) {
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
        uint orgId
    );

    event AddConstituent(
        uint indexed organisationId,
        address[] constituents
    );

    event RemoveConstituent(
        uint indexed _organisationId,
        address _constituent
    );

    event AddInitiative(
        uint indexed organisationId,
        uint initiativeId,
        string initiativeTitle,
        uint expiryTime,
        uint number_of_votes_allowed,
        uint[] _ballotOptions,
    );


}
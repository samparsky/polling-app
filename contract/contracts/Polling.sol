pragma solidity >=0.4.21 <0.6.0;

contract Polling {
    enum Status { PREVOTE, ONGOING, CONCLUDED };

    struct InitiativeBound { 
        uint expiryTime;
        uint number_of_votes_allowed;
    };

    struct initiative {
        string initiativeTitle; // very short description of what is being voted on
        InitiativeBound initiativeBound;
        uint[] ballotOptions; // integer representation of available voting options
    };

    struct vote {

    };

    struct Organisation {
        address creator;
        uint orgId;
        bool exists;
    }

    struct Constitutent {
        uint orgId;
        adddress constituent;
    }

    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }

    modifier allowOnlyOrgOwner(orgId) {
        require(msg.sender == organisations[orgId].creator);
        _;
    }

    Organisation[] organisations;
    mapping(Constitutent => bool) constituents;

    mapping(uint => []intiative) organisation_intiatives;
    mapping(uint => mapping(uint => []vote) votes;

    constructor() {

    }
    /**
    * An address can create multiple organisations
    *
    *
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

    function removeConstituent(uint _organisationId, address _constituent){
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

    function addInitiative( uint organisationId, ) public {
        require()
        struct initiative {
        string initiativeTitle; // very short description of what is being voted on
        InitiativeBound initiativeBound;
        uint[] ballotOptions; // integer representation of available voting options
    };
    }

    function addInitiatives() public {

    }

    function vote() public {

    }

    function isOwnerOrgId(uint orgId) internal pure returns (bool) {
        address sender = msg.sender;
        uint[] senderOrganisation = organisations[sender];
        
        if(senderOrganisation.length == 0){
            return false;
        }

        for(uint i =0; i < senderOrganisation.length ; i++ ){
            if
        }
    }


    event CreateOrganisation(
        address indexed creator,
        uint orgID
    );

    event AddConstituent(
        address indexed organisationId,
        address[] constituents
    );

    event RemoveConstituent(
        address indexed _organisationId,
        address _constituent
    );


}
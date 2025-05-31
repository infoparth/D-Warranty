
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Burnable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract WarrantyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable, AccessControl {
    

    mapping (uint256 => uint256) public creationTime;

    bool RepairWarranty = true ;

    uint256 s_warrantyPeriod;

  // Struct to hold repair/replacement history for an NFT

     struct RepairHistory 
     {
        uint256 timestamp;
        string description;
    }


     // Mapping from NFT ID to repair/replacement history

    mapping(uint256 => RepairHistory[]) public repairHistory;

    bytes32 public constant Retailers = keccak256("Retailers");

    bytes32 public constant Managers = keccak256("Managers");
    
    constructor(
        string memory collectionName,
        string memory collectionSymbol,
        address _root, 
        uint256 _warrantyPeriod)
        ERC721(collectionName, collectionSymbol) 
        Ownable(_root) 
        {

        super._grantRole(DEFAULT_ADMIN_ROLE, _root);
        _setRoleAdmin(Retailers, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(Managers, DEFAULT_ADMIN_ROLE);
        s_warrantyPeriod = _warrantyPeriod;

    }

     modifier onlyManager() {
        require(hasRole(Managers, msg.sender), "Restricted to Managers.");
        _;
    }

    modifier onlyRetailer() {
        require(hasRole(Retailers, msg.sender) || hasRole(Managers, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted.");
        _;
    }

         // Changing the Owner of the Contract

    function changeOwner(
        address _to)
        public 
        onlyOwner
        {
        transferOwnership(_to);
    }

    // Adding a retailer, who can mint NFT's

    function addRetail(
        address _retailer) 
        public 
        virtual 
        onlyManager 
        {
        grantRole(Retailers, _retailer);
    }

    function changeWarranty(uint256 _warrantyPeriod) external onlyOwner{
        s_warrantyPeriod = _warrantyPeriod;
    }
    
    // Removing the person from the assigned the retailer role

     function removeRetai(
        address _retailer) 
        public 
        virtual 
        onlyManager 
        {
        revokeRole(Retailers, _retailer);
    }

    // Setting up a new Role Admin/ Manager

    function addManager(
        address _manager) 
        public
        virtual 
        onlyOwner 
        {
        grantRole(Managers, _manager);
    }

    //Renouncing the Manager perks

    function renounceManager(
        address _manager) 
        public 
        virtual 
        onlyOwner
        returns(bool)
        {
        renounceRole(Managers, _manager);
        return (hasRole(Managers, _manager));
    }

    // This function is used to mint a new NFT and assign it to a specific address.

    function mint(
        address _to, 
        string memory uri)
        public  
        onlyRetailer  
        returns(uint256)
        {

        // Generate a new, unique token ID for the NFT.

        uint256 tokenId = totalSupply();

        creationTime[tokenId] = block.timestamp;

        // Mint the NFT and assign it to the specified address.

        _mint(_to, tokenId);
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    // Makes the Warranty void 

    function repairWarrantyVoid() 
    private   
    onlyRetailer  
    {
        RepairWarranty = false;
    }

    // Brings the Warranty back
        function repairWarrantyNotVoid() 
        private  
        onlyRetailer 
        {
        RepairWarranty = true;
    }

    function _exists(uint256 _tokenId)
    internal 
    view
    returns(bool){

        return (_tokenId <  totalSupply());
    }

    // This function is used to check whether a specific address has a valid warranty NFT.

    function hasValidWarranty(
        uint256 _tokenId) 
        public 
        view 
        returns (bool) 
        {

        // Check if the specified address has any NFTs of the "WAR" symbol.
        require(_exists(_tokenId), "TokenID Invalid");

        // Check if the most recent NFT minted for this address is still within the warranty period.

        uint256 mintTimestamp = creationTime[_tokenId];

        uint256 currentTimestamp = block.timestamp;

        uint256 expiredTime = mintTimestamp + s_warrantyPeriod;

        if (currentTimestamp < expiredTime){ 
       
        return true;
        }

        // If the address has a valid NFT, return true.

        return false;
    }

    function transfer(
        address _to, 
        uint256 _tokenId) 
        public 
        {
        address nftOwner = ownerOf(_tokenId);

        // Ensure that the NFT exists and is owned by the caller

        require(_exists(_tokenId), "Token does not exist");

        require(hasValidWarranty(_tokenId),"Your Warranty has expired");

        require(_isAuthorized(nftOwner, msg.sender, _tokenId), "Caller is not the owner or approved to transfer the token");

        // Transfer ownership of the NFT to the new owner

        _transfer(msg.sender, _to, _tokenId);
    }

    function addRepair(
        uint256 _tokenId, 
        string memory _description) 
        public 
        onlyRole(Retailers)
        {


        // Ensure that the NFT exists and is owned by the caller

        require(_exists(_tokenId), "Token does not exist");

        require(hasValidWarranty(_tokenId),"Your Warranty has expired");


        // Add a new entry to the repair/replacement history for the NFT

        repairHistory[_tokenId].push(RepairHistory(block.timestamp, _description));
    }

    //Function overrides

    function _update(address to, uint256 tokenId, address zero)
    internal
    virtual
    override(ERC721, ERC721Enumerable)
    returns(address)
    {

        return super._update(to, tokenId, zero);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721, ERC721Enumerable){
    return super._increaseBalance(account, value);
    }
}
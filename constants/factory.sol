// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./warranty.sol";

contract NFTFactory {

    struct BrandsInfo{
        string collectionName;
        address collectionAddress;
    }

    BrandsInfo[] public s_deployedContracts;

    struct Info{
        string collectionName;
        string brandName;
        string productName;
        string collectionSymbol;
        uint256 warrantyPeriod;
        uint256 creationTime;
    }

    mapping (address => Info) public s_brandDetails;

    mapping(address => BrandsInfo[]) public s_brandOwnedCollections;

    event ContractDeployed(address indexed newContract, address indexed creator);

    function createContract(string memory brandName, string memory _productName, string memory collectionName, string memory collectionSymbol, uint256 warrantyPeriod) public returns(address){
        WarrantyNFT newContract = new WarrantyNFT(collectionName, collectionSymbol, msg.sender, warrantyPeriod);
        Info memory newInfo;
        newInfo.brandName = brandName;
        newInfo.productName = _productName;
        newInfo.creationTime = block.timestamp;
        newInfo.collectionName = collectionName;
        newInfo.collectionSymbol = collectionSymbol;
        newInfo.warrantyPeriod = warrantyPeriod;

        BrandsInfo memory newBrandInfo = BrandsInfo({
        collectionName: collectionName,
        collectionAddress: address(newContract)
        });
    
        // Add the new Info struct to the array associated with the new contract address
        s_brandDetails[address(newContract)] = (newInfo);
        s_brandOwnedCollections[msg.sender].push(newBrandInfo);
        s_deployedContracts.push(newBrandInfo);
        emit ContractDeployed(address(newContract), msg.sender);
        return address(newContract);
    }

    function getDeployedContracts() public view returns (BrandsInfo[] memory) {
        return s_deployedContracts;
    }

    function getBrandOwnedCollections(address _address) external view returns(BrandsInfo[] memory){
        return s_brandOwnedCollections[_address];
    }

    function getBrandInfo(address _address) external view returns(Info memory){
        return s_brandDetails[_address];
    }

}
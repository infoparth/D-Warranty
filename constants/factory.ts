export const factoryABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newContract",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "ContractDeployed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "brandName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_productName",
        type: "string",
      },
      {
        internalType: "string",
        name: "collectionName",
        type: "string",
      },
      {
        internalType: "string",
        name: "collectionSymbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "warrantyPeriod",
        type: "uint256",
      },
    ],
    name: "createContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getBrandInfo",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "collectionName",
            type: "string",
          },
          {
            internalType: "string",
            name: "brandName",
            type: "string",
          },
          {
            internalType: "string",
            name: "productName",
            type: "string",
          },
          {
            internalType: "string",
            name: "collectionSymbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "warrantyPeriod",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "creationTime",
            type: "uint256",
          },
        ],
        internalType: "struct NFTFactory.Info",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getBrandOwnedCollections",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "collectionName",
            type: "string",
          },
          {
            internalType: "address",
            name: "collectionAddress",
            type: "address",
          },
        ],
        internalType: "struct NFTFactory.BrandsInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDeployedContracts",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "collectionName",
            type: "string",
          },
          {
            internalType: "address",
            name: "collectionAddress",
            type: "address",
          },
        ],
        internalType: "struct NFTFactory.BrandsInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "s_brandDetails",
    outputs: [
      {
        internalType: "string",
        name: "collectionName",
        type: "string",
      },
      {
        internalType: "string",
        name: "brandName",
        type: "string",
      },
      {
        internalType: "string",
        name: "productName",
        type: "string",
      },
      {
        internalType: "string",
        name: "collectionSymbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "warrantyPeriod",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "creationTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "s_brandOwnedCollections",
    outputs: [
      {
        internalType: "string",
        name: "collectionName",
        type: "string",
      },
      {
        internalType: "address",
        name: "collectionAddress",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "s_deployedContracts",
    outputs: [
      {
        internalType: "string",
        name: "collectionName",
        type: "string",
      },
      {
        internalType: "address",
        name: "collectionAddress",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

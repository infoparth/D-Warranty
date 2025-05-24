import { ThirdwebClient, createThirdwebClient, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { factoryABI } from "./factory";
import { warrantyABI } from "./warranty";

const clientId = "a81b28f71aa45b7499e14d244942b8b2";

export const factoryAddress = "0x192704C0201CB06b06cce44A9e32690084d72eec";
const warrantyAddress = "0xD42f42deBD0ffD5D01EE63c76a832c3aa00f7e6d";

export const client: ThirdwebClient = createThirdwebClient({
  clientId: clientId,
});

export const chain = sepolia;

export const factoryContract = getContract({
  client: client,
  chain: chain,
  address: factoryAddress,
  abi: factoryABI,
});
export function nftContract(address: string) {
  const nftContract = getContract({
    client: client,
    chain: chain,
    address: address,
    abi: warrantyABI,
  });

  return nftContract;
}

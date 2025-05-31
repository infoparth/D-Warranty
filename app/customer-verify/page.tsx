"use client";

import type React from "react";

import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Search,
  Wallet,
  Coins,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { readContract } from "thirdweb";
import { factoryContract, nftContract, client } from "@/constants/contract";
import { ConnectButton, useActiveAccount } from "thirdweb/react";

interface VerificationResult {
  isValid: boolean;
  message: string;
  productInfo?: {
    name: string;
    issueDate: string;
    expiryDate: string;
    brand: string;
  };
}

interface CollectionOption {
  collectionName: string;
  collectionAddress: string;
}

// Placeholder function to simulate NFT warranty verification
async function verifyNFTWarranty(
  collectionAddress: string,
  tokenId: string
): Promise<VerificationResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock verification logic - replace with actual smart contract/API call
  const isValidAddress =
    collectionAddress.startsWith("0x") && collectionAddress.length === 42;
  const isValidTokenId = tokenId.trim() !== "" && !isNaN(Number(tokenId));

  if (!isValidAddress || !isValidTokenId) {
    return {
      isValid: false,
      message: "Invalid collection address or token ID format",
    };
  }

  // Simulate random verification result for demo
  const isValid = await checkIfValid(collectionAddress, Number(tokenId)); // 70% chance of valid warranty

  const productInfo = await getProductInfo(collectionAddress);

  if (isValid) {
    return {
      isValid: true,
      message: "Warranty is valid and active",
      productInfo: {
        name: productInfo.productName,
        issueDate: convertTimestampToDate(Number(productInfo.creationTime)),
        expiryDate: convertTimestampToDate(
          Number(productInfo.creationTime + productInfo.warrantyPeriod)
        ),
        brand: productInfo.brandName,
      },
    };
  } else {
    return {
      isValid: false,
      message: "Warranty is invalid or expired",
    };
  }
}

const checkIfValid = async (nftAddress: string, tokenId: number) => {
  const _nftContract = nftContract(nftAddress);

  const isValid = await readContract({
    contract: _nftContract,
    method: "hasValidWarranty",
    params: [BigInt(tokenId)],
  });

  console.log("The contract waeeanty check is : ", isValid);

  return isValid;
};

const getProductInfo = async (nftAddress: string) => {
  const brandInfo = await readContract({
    contract: factoryContract,
    method: "getBrandInfo",
    params: [nftAddress],
  });

  return brandInfo;
};

// Function to get all deployed contracts
const getDeployedContracts = async (): Promise<CollectionOption[]> => {
  try {
    // Replace this with your actual contract method
    const deployedContracts = await readContract({
      contract: factoryContract,
      method: "getDeployedContracts",
      params: [],
    });

    return [...deployedContracts];
  } catch (error) {
    console.error("Error fetching deployed contracts:", error);
    // Fallback to demo data if contract call fails
    return [
      {
        collectionName: "Premium Watches",
        collectionAddress: "0x192704C0201CB06b06cce44A9e32690084d72eec",
      },
      {
        collectionName: "Designer Bags",
        collectionAddress: "0x292704C0201CB06b06cce44A9e32690084d72eed",
      },
      {
        collectionName: "Electronics",
        collectionAddress: "0x392704C0201CB06b06cce44A9e32690084d72eee",
      },
    ];
  }
};

function convertTimestampToDate(
  timestamp: number,
  options?: {
    format?: "full" | "short" | "numeric";
    includeTime?: boolean;
    timezone?: string;
  }
): string {
  const date = new Date(timestamp * 1000);

  const {
    format = "full",
    includeTime = false,
    timezone = "UTC",
  } = options || {};

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month:
      format === "full" ? "long" : format === "short" ? "short" : "numeric",
    day: "numeric",
    hour: includeTime ? "2-digit" : undefined,
    minute: includeTime ? "2-digit" : undefined,
    second: includeTime ? "2-digit" : undefined,
    hour12: false,
  };

  return date.toLocaleDateString("en-US", formatOptions);
}

export default function CustomerVerifyPage() {
  const [selectedCollection, setSelectedCollection] = useState("");
  const [customCollectionAddress, setCustomCollectionAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCustomAddress, setShowCustomAddress] = useState(false);

  const account = useActiveAccount();
  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoadingCollections(true);
      try {
        const deployedCollections = await getDeployedContracts();
        setCollections(deployedCollections);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  const handleCollectionChange = (value: string) => {
    setSelectedCollection(value);
    if (value === "other") {
      setShowCustomAddress(true);
      setCustomCollectionAddress("");
    } else {
      setShowCustomAddress(false);
      setCustomCollectionAddress("");
    }
    // Reset verification results when collection changes
    setVerificationResult(null);
    setHasSearched(false);
  };

  const getCollectionAddress = () => {
    if (selectedCollection === "other") {
      return customCollectionAddress;
    }
    return selectedCollection;
  };

  const handleVerifyWarranty = async () => {
    const collectionAddress = getCollectionAddress();

    if (!collectionAddress.trim() || !tokenId.trim()) {
      setVerificationResult({
        isValid: false,
        message: "Please select a collection and enter a token ID",
      });
      return;
    }

    if (
      selectedCollection === "other" &&
      (!customCollectionAddress.trim() ||
        !customCollectionAddress.startsWith("0x") ||
        customCollectionAddress.length !== 42)
    ) {
      setVerificationResult({
        isValid: false,
        message:
          "Please enter a valid collection address (must start with 0x and be 42 characters long)",
      });
      return;
    }

    setIsLoading(true);
    setVerificationResult(null);
    setHasSearched(false);

    try {
      const result = await verifyNFTWarranty(
        collectionAddress.trim(),
        tokenId.trim()
      );
      setVerificationResult(result);
      setHasSearched(true);
    } catch (error) {
      console.log("The error is: ", error);
      const err = error as Error; // Type assertion

      let errorMessage =
        "Error occurred while verifying warranty. Please try again.";

      if (
        err &&
        typeof err.message === "string" &&
        err.message.includes("execution reverted: TokenID Invalid")
      ) {
        errorMessage = "Token ID does not exist";
      }

      setVerificationResult({
        isValid: false,
        message: errorMessage,
      });
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleVerifyWarranty();
    }
  };

  const isFormValid = () => {
    const collectionAddress = getCollectionAddress();
    return collectionAddress.trim() !== "" && tokenId.trim() !== "";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mx-auto max-w-2xl">
            {/* Header Section */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight">
                Verify Product Warranty
              </h1>
              <p className="text-muted-foreground">
                Select your NFT collection and enter the token ID to verify your
                product warranty status
              </p>
            </div>

            {/* Verification Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Warranty Verification</CardTitle>
                <CardDescription>
                  Choose your NFT collection and provide the token ID to check
                  your product's warranty status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collection">NFT Collection</Label>
                  {isLoadingCollections ? (
                    <div className="flex h-10 items-center justify-center rounded-md border bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading collections...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={selectedCollection}
                      onValueChange={handleCollectionChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection, index) => (
                          <SelectItem
                            key={index}
                            value={collection.collectionAddress}
                          >
                            {collection.collectionName}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          Other (Custom Address)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select your NFT collection from the list or choose "Other"
                    to enter a custom address
                  </p>
                </div>

                {/* Custom Collection Address Input */}
                {showCustomAddress && (
                  <div className="space-y-2">
                    <Label htmlFor="customCollectionAddress">
                      Custom Collection Address
                    </Label>
                    <Input
                      id="customCollectionAddress"
                      type="text"
                      placeholder="0x..."
                      value={customCollectionAddress}
                      onChange={(e) =>
                        setCustomCollectionAddress(e.target.value)
                      }
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the smart contract address of your NFT collection
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tokenId">NFT Token ID</Label>
                  <Input
                    id="tokenId"
                    type="text"
                    placeholder="e.g., 1234"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    The unique token ID of your NFT warranty
                  </p>
                </div>

                <Button
                  onClick={handleVerifyWarranty}
                  disabled={isLoading || !isFormValid()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Warranty...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check Warranty
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Verification Results */}
            {verificationResult && hasSearched && (
              <Card
                className={`border-l-4 ${
                  verificationResult.isValid
                    ? "border-l-green-500"
                    : "border-l-red-500"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {verificationResult.isValid ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          verificationResult.isValid
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {verificationResult.isValid
                          ? "Warranty Valid"
                          : "Warranty Invalid"}
                      </h3>
                      <p
                        className={`mt-1 ${
                          verificationResult.isValid
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {verificationResult.message}
                      </p>

                      {/* Product Information */}
                      {verificationResult.isValid &&
                        verificationResult.productInfo && (
                          <div className="mt-4 rounded-lg bg-green-50 p-4">
                            <h4 className="font-semibold text-green-800">
                              Product Information
                            </h4>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-green-700 md:grid-cols-2">
                              <div>
                                <span className="font-medium">Product:</span>{" "}
                                {verificationResult.productInfo.name}
                              </div>
                              <div>
                                <span className="font-medium">Brand:</span>{" "}
                                {verificationResult.productInfo.brand}
                              </div>
                              <div>
                                <span className="font-medium">Issue Date:</span>{" "}
                                {verificationResult.productInfo.issueDate}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Expiry Date:
                                </span>{" "}
                                {verificationResult.productInfo.expiryDate}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Alert className="mt-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Select your NFT collection from the
                dropdown, or choose "Other" to enter a custom collection
                address. You can find your token ID in your wallet or on
                blockchain explorers like Etherscan. If you're having trouble,
                contact our support team.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      <Footer />
      {!account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 border-2 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Connect Your Wallet
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  You need to connect your wallet to access the NFT warranty
                  dashboard and manage your collections.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Create and manage NFT collections</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4 text-blue-500" />
                  <span>Mint warranty NFTs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4 text-purple-500" />
                  <span>Track and verify warranties</span>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <ConnectButton client={client} />
              </div>

              <div className="text-xs text-center text-muted-foreground">
                By connecting your wallet, you agree to our terms of service and
                privacy policy.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

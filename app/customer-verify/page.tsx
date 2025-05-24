"use client";

import type React from "react";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Shield, Search } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { readContract } from "thirdweb";
import { factoryContract, nftContract } from "@/constants/contract";

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

function convertTimestampToDate(
  timestamp: number,
  options?: {
    format?: "full" | "short" | "numeric"; // full: "October 5, 2023", short: "Oct 5, 2023", numeric: "10/5/2023"
    includeTime?: boolean; // Whether to include time component
    timezone?: string; // Timezone (e.g., 'UTC')
  }
): string {
  // Sepolia timestamps are in seconds, convert to milliseconds
  const date = new Date(timestamp * 1000);

  // Default options
  const {
    format = "full",
    includeTime = false,
    timezone = "UTC",
  } = options || {};

  // Formatting configuration
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

  // Return formatted date string
  return date.toLocaleDateString("en-US", formatOptions);
}

export default function CustomerVerifyPage() {
  const [collectionAddress, setCollectionAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerifyWarranty = async () => {
    if (!collectionAddress.trim() || !tokenId.trim()) {
      setVerificationResult({
        isValid: false,
        message: "Please enter both collection address and token ID",
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
      setVerificationResult({
        isValid: false,
        message: "Error occurred while verifying warranty. Please try again.",
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
                Enter your NFT collection address and token ID to verify your
                product warranty status
              </p>
            </div>

            {/* Verification Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Warranty Verification</CardTitle>
                <CardDescription>
                  Provide the NFT details to check your product's warranty
                  status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collectionAddress">
                    NFT Collection Address
                  </Label>
                  <Input
                    id="collectionAddress"
                    type="text"
                    placeholder="0x..."
                    value={collectionAddress}
                    onChange={(e) => setCollectionAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    The smart contract address of your NFT collection
                  </p>
                </div>

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
                  disabled={
                    isLoading || !collectionAddress.trim() || !tokenId.trim()
                  }
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
                <strong>Need help?</strong> You can find your NFT collection
                address and token ID in your wallet or on blockchain explorers
                like Etherscan. If you're having trouble, contact our support
                team.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

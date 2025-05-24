"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Coins,
  FileText,
  History,
  Plus,
  QrCode,
  Settings,
  Shield,
  Eye,
  ExternalLink,
  Copy,
  Calendar,
  Package,
  Award,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CreateCollectionForm from "@/components/create-collection-form";
import MintNftForm from "@/components/mint-nft-form";
import { readContract } from "thirdweb";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { client, factoryContract, nftContract } from "@/constants/contract";
import { toast } from "sonner";

interface CollectionData {
  address: string;
  name: string;
  brandName: string;
  productName: string;
  symbol: string;
  warrantPeriod: string;
  count?: number;
  date: string;
}

export default function Dashboard() {
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showMintNft, setShowMintNft] = useState(false);
  const [showCollectionDetails, setShowCollectionDetails] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionData | null>(null);
  const [connectedWallet, setConnectedWallet] = useState("0x1a2...3b4c");
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDeployedContracts, setTotalDeployedContracts] = useState(0);
  const [totalNftsMinted, setTotalNftsMinted] = useState(0);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);

  const account = useActiveAccount();

  // Demo data for fallback
  const demoCollections = [
    {
      address: "demo1",
      name: "Premium Watches",
      brandName: "Luxury Brand",
      productName: "Watch",
      symbol: "PW",
      warrantPeriod: "24",
      count: 12,
      date: "Created 2 weeks ago",
    },
    {
      address: "demo2",
      name: "Designer Bags",
      brandName: "Fashion House",
      productName: "Bag",
      symbol: "DB",
      warrantPeriod: "12",
      count: 8,
      date: "Created 1 month ago",
    },
    {
      address: "demo3",
      name: "Electronics",
      brandName: "Tech Corp",
      productName: "Device",
      symbol: "EL",
      warrantPeriod: "36",
      count: 4,
      date: "Created 2 months ago",
    },
  ];

  // Function to get total NFTs for a single contract
  const getTotalNFTs = async (nftAddress: string): Promise<number> => {
    try {
      const _nftContract = nftContract(nftAddress);
      const totalNfts = await readContract({
        contract: _nftContract,
        method: "totalSupply",
        params: [],
      });
      return Number(totalNfts) || 0;
    } catch (error) {
      console.error(`Error fetching NFT count for ${nftAddress}:`, error);
      return 0;
    }
  };

  // Function to calculate total NFTs across all collections
  const calculateTotalNFTs = async (contractAddresses: string[]) => {
    if (!contractAddresses || contractAddresses.length === 0) {
      return 0;
    }

    setIsLoadingNfts(true);
    let total = 0;

    try {
      // Fetch NFT counts for all contracts in parallel
      const nftCountPromises = contractAddresses.map((address) =>
        getTotalNFTs(address)
      );
      const nftCounts = await Promise.all(nftCountPromises);

      total = nftCounts.reduce((sum, count) => sum + count, 0);
    } catch (error) {
      console.error("Error calculating total NFTs:", error);
    } finally {
      setIsLoadingNfts(false);
    }

    return total;
  };

  const fetchCollections = useCallback(async () => {
    if (!account) {
      setCollections(demoCollections);
      setTotalNftsMinted(
        demoCollections.reduce((sum, col) => sum + (col.count || 0), 0)
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all deployed contracts
      const deployedContracts = await readContract({
        contract: factoryContract,
        method: "getDeployedContracts",
        params: [],
      });

      setTotalDeployedContracts(deployedContracts?.length || 0);

      if (!deployedContracts || deployedContracts.length === 0) {
        setCollections(demoCollections);
        setTotalNftsMinted(
          demoCollections.reduce((sum, col) => sum + (col.count || 0), 0)
        );
        setIsLoading(false);
        return;
      }

      // Fetch brand info for each contract
      const collectionsData: CollectionData[] = [];

      for (const contractAddress of deployedContracts) {
        try {
          const brandInfo = await readContract({
            contract: factoryContract,
            method: "getBrandInfo",
            params: [contractAddress],
          });

          if (brandInfo) {
            // Get NFT count for this collection
            const nftCount = await getTotalNFTs(contractAddress);

            const collection: CollectionData = {
              address: contractAddress,
              name: brandInfo.collectionName || "Unknown Collection",
              brandName: brandInfo.brandName || "Unknown Brand",
              productName: brandInfo.productName || "Unknown Product",
              symbol: brandInfo.collectionSymbol || "UNK",
              warrantPeriod: brandInfo.warrantyPeriod?.toString() || "0",
              count: nftCount,
              date: "Recently created", // You might want to store creation timestamp in contract
            };
            collectionsData.push(collection);
          }
        } catch (err) {
          console.error(
            `Error fetching brand info for ${contractAddress}:`,
            err
          );
        }
      }

      // If we have real data, use it, otherwise use demo data
      if (collectionsData.length > 0) {
        setCollections(collectionsData);
        // Calculate total NFTs from real data
        const totalNfts = collectionsData.reduce(
          (sum, col) => sum + (col.count || 0),
          0
        );
        setTotalNftsMinted(totalNfts);
      } else {
        setCollections(demoCollections);
        setTotalNftsMinted(
          demoCollections.reduce((sum, col) => sum + (col.count || 0), 0)
        );
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
      setError("Failed to load collections");
      setCollections(demoCollections); // Fallback to demo data on error
      setTotalNftsMinted(
        demoCollections.reduce((sum, col) => sum + (col.count || 0), 0)
      );
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Function to refresh NFT counts only (useful after minting)
  const refreshNFTCounts = useCallback(async () => {
    if (!account || collections.length === 0) return;

    setIsLoadingNfts(true);
    try {
      const updatedCollections = await Promise.all(
        collections.map(async (collection) => {
          const nftCount = await getTotalNFTs(collection.address);
          return { ...collection, count: nftCount };
        })
      );

      setCollections(updatedCollections);
      const totalNfts = updatedCollections.reduce(
        (sum, col) => sum + (col.count || 0),
        0
      );
      setTotalNftsMinted(totalNfts);
    } catch (error) {
      console.error("Error refreshing NFT counts:", error);
    } finally {
      setIsLoadingNfts(false);
    }
  }, [account, collections]);

  // Fetch collections on component mount and when account changes
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Handle successful collection creation
  const handleCollectionCreated = useCallback(() => {
    setShowCreateCollection(false);
    // Refresh collections after creation
    setTimeout(() => {
      fetchCollections();
    }, 2000); // Give some time for blockchain confirmation
  }, [fetchCollections]);

  // Handle successful NFT minting
  const handleNFTMinted = useCallback(() => {
    setShowMintNft(false);
    // Refresh NFT counts after minting
    setTimeout(() => {
      refreshNFTCounts();
    }, 2000); // Give some time for blockchain confirmation
  }, [refreshNFTCounts]);

  // Handle collection view
  const handleViewCollection = (collection: CollectionData) => {
    setSelectedCollection(collection);
    setShowCollectionDetails(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to show a toast notification here
  };

  function secondsToMonths(seconds: number) {
    const secondsInAMonth = 30.44 * 24 * 60 * 60; // ~2,629,746 seconds/month (average)
    const months = seconds / secondsInAMonth;
    return Math.round(months * 10) / 10; // Round to 1 decimal place (e.g., "12.3 months")
  }

  const displayCollections = isLoading ? demoCollections : collections;

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Main Content */}
      <div className={!account ? "blur-sm pointer-events-none" : ""}>
        <Header isLoggedIn={true} walletAddress={connectedWallet} />
        <main className="flex-1 bg-muted/30">
          <div className="container px-4 py-8 md:px-6 md:py-12">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your NFT warranty collections and minting
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshNFTCounts}
                  disabled={isLoadingNfts}
                >
                  <History className="mr-2 h-4 w-4" />
                  {isLoadingNfts ? "Refreshing..." : "Refresh Counts"}
                </Button>
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  Transaction History
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Collections
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : totalDeployedContracts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Loading..."
                      : `${collections.length > 0 ? "Live data" : "Demo data"}`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total NFTs Minted
                  </CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading || isLoadingNfts ? "..." : totalNftsMinted}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Loading..."
                      : isLoadingNfts
                      ? "Updating..."
                      : account
                      ? "Real-time data"
                      : "Demo data"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Verifications
                  </CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-700/10">
                  <CardTitle>Start Your Own NFT Collection</CardTitle>
                  <CardDescription>
                    Create a new NFT warranty collection for your products
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
                    <Shield className="h-10 w-10 text-primary opacity-70" />
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Create branded warranty NFTs
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Customize metadata and appearance
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Deploy to the blockchain
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4">
                  <Button
                    className="w-full"
                    onClick={() => setShowCreateCollection(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-cyan-700/10">
                  <CardTitle>Mint from Your Collection</CardTitle>
                  <CardDescription>
                    Create new warranty NFTs from your existing collections
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
                    <FileText className="h-10 w-10 text-primary opacity-70" />
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Mint to customer wallets
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Add product-specific metadata
                    </li>
                    <li className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Track warranty ownership
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-muted/50 px-6 py-4">
                  <Button
                    className="w-full"
                    onClick={() => setShowMintNft(true)}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Mint NFT
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Recent Collections */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Collections</h2>
                {error && (
                  <p className="text-sm text-red-500">
                    Failed to load - showing demo data
                  </p>
                )}
                {!error && !isLoading && collections.length > 0 && (
                  <p className="text-sm text-green-600">Live data</p>
                )}
                {!error && !isLoading && collections.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No collections - showing demo data
                  </p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {displayCollections.map((collection, index) => (
                  <Card
                    key={collection.address || index}
                    className={isLoading ? "animate-pulse" : ""}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {collection.name}
                        {collection.symbol && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {collection.symbol}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {collection.date}
                        {collection.brandName && (
                          <span className="block text-xs">
                            Brand: {collection.brandName}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {collection.warrantPeriod && (
                          <p className="text-xs text-muted-foreground">
                            Warranty:{" "}
                            {secondsToMonths(Number(collection.warrantPeriod))}{" "}
                            months
                          </p>
                        )}
                        {collection.productName && (
                          <p className="text-xs text-muted-foreground">
                            Product: {collection.productName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          NFTs: {collection.count || 0}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewCollection(collection)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Collection
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {displayCollections.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No collections found. Create your first collection to get
                    started!
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Wallet Connection Modal - Only shown when account is undefined */}
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

      {/* Modal Forms - Only shown when wallet is connected */}
      {account && showCreateCollection && (
        <CreateCollectionForm onClose={handleCollectionCreated} />
      )}

      {account && showMintNft && <MintNftForm onClose={handleNFTMinted} />}

      {/* Collection Details Modal - Only shown when wallet is connected */}
      {account && showCollectionDetails && selectedCollection && (
        <Dialog
          open={showCollectionDetails}
          onOpenChange={setShowCollectionDetails}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {selectedCollection.name}
                <Badge variant="secondary">{selectedCollection.symbol}</Badge>
              </DialogTitle>
              <DialogDescription>
                Collection details and contract information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Brand Name
                    </label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedCollection.brandName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Product Type
                    </label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {selectedCollection.productName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Warranty Period
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-mono bg-muted p-2 rounded flex-1">
                        {secondsToMonths(
                          Number(selectedCollection.warrantPeriod)
                        )}{" "}
                        months
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      NFTs Minted
                    </label>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-mono bg-muted p-2 rounded flex-1">
                        {selectedCollection.count || 0} NFTs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contract Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Information
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Contract Address
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-muted p-2 rounded flex-1 break-all">
                      {selectedCollection.address}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        copyToClipboard(selectedCollection.address);
                        toast("Copied to Clipboard.");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://sepolia.etherscan.io/address/${selectedCollection.address}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Collection Symbol
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {selectedCollection.symbol}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {selectedCollection.date}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Quick Actions
                </h3>

                <div className="grid gap-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setShowCollectionDetails(false);
                      setShowMintNft(true);
                    }}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Mint NFT from this Collection
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://testnets.opensea.io/${selectedCollection.address}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on OpenSea
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      copyToClipboard(
                        `Collection: ${selectedCollection.name}\nContract: ${selectedCollection.address}\nBrand: ${selectedCollection.brandName}`
                      );
                      toast("Copied to Clipboard");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Collection Details
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {secondsToMonths(Number(selectedCollection.warrantPeriod))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Months Warranty
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {selectedCollection.count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    NFTs Minted
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {selectedCollection.address.slice(0, 4)}...
                    {selectedCollection.address.slice(-4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Contract ID
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

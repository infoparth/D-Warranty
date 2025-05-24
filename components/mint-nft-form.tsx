"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { factoryContract, nftContract, client } from "@/constants/contract";
import {
  useActiveAccount,
  useReadContract,
  MediaRenderer,
} from "thirdweb/react";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { upload } from "thirdweb/storage";
import { readContract } from "thirdweb";

interface MintNftFormProps {
  onClose: () => void;
}

interface CollectionInfo {
  brandName: string;
  productName: string;
  creationTime: BigInt;
}

export default function MintNftForm({ onClose }: MintNftFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    collection: "",
    recipientAddress: "",
    productSerial: "",
    metadata: "",
    description: "",
    image: null as File | null,
  });
  const [collectionInfo, setCollectionInfo] = useState<
    CollectionInfo | undefined
  >();

  const account = useActiveAccount();

  const walletAddress = account?.address;

  const { data: collectionList } = useReadContract({
    contract: factoryContract,
    method: "getBrandOwnedCollections",
    params: [walletAddress as `0x${string}`],
  });

  useEffect(() => {
    if (!factoryContract) return;

    const fetchCollectionDetails = async () => {
      const collectionInfo = await readContract({
        contract: factoryContract,
        method: "getBrandInfo",
        params: [formData.collection as `0x${string}`],
      });

      setCollectionInfo(collectionInfo);
    };

    fetchCollectionDetails();
  }, [formData.collection]);

  console.log("The document list is: ", collectionList);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fileUri = await handleFileUploadToIPFS();

    const metaDataUri = await handleMetaDataUploadToIPFS(fileUri);

    const _nftContract = nftContract(formData.collection);

    try {
      const transaction = prepareContractCall({
        contract: _nftContract,
        method: "mint",
        params: [formData.recipientAddress as `0x${string}`, metaDataUri],
      });

      console.log("The transaction is", transaction);

      if (transaction !== undefined && account) {
        const _transactionReceipt = await sendAndConfirmTransaction({
          account: account,
          transaction: transaction,
        });

        console.log("The Transaction Reciept is: ", _transactionReceipt);

        setIsSubmitting(false);
        onClose();
        return _transactionReceipt.transactionHash;
      }
    } catch (err) {
      console.log("Error is:", err);
      setIsSubmitting(false);
      onClose();
    }

    alert("Your NFT is Minted Successfully");
  };

  const handleMetaDataUploadToIPFS = async (imageUri: string | undefined) => {
    const nftMetadata = {
      name: collectionInfo?.brandName,
      description: formData?.description,
      image: imageUri,
      productSerialNo: formData.productSerial,
      additionalData: formData?.metadata,
    };

    const metadataJSON = JSON.stringify(nftMetadata);

    const nftUri = await uploadMetadataToIPFS(metadataJSON); //uploading to ipfs

    return nftUri;
  };

  const handleFileUploadToIPFS = async () => {
    if (formData.image !== null) {
      const uri = await upload({
        client,
        files: [formData.image],
      });

      console.log("The URI is: " + uri);
      return uri;
    } else {
      alert("File Upload Failed");
      return;
    }
  };

  const uploadMetadataToIPFS = async (metadataJSON: string) => {
    const uri = await upload({
      client,
      files: [metadataJSON],
    });

    console.log("The URI is", uri);
    return uri;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const collections = ["Premium Watches", "Designer Bags", "Electronics"];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mint NFT Warranty</DialogTitle>
            <DialogDescription>
              Create a new warranty NFT from your existing collections.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection">Select Collection</Label>
              <Select
                value={formData.collection}
                onValueChange={(value) =>
                  handleSelectChange("collection", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {(collectionList ? collectionList : collections).map(
                    (collection, key) => (
                      <SelectItem key={key} value={collection}>
                        {collection}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipientAddress">Recipient Wallet Address</Label>
              <Input
                id="recipientAddress"
                name="recipientAddress"
                placeholder="0x..."
                value={formData.recipientAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Digital warranties for our premium watch collection"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productSerial">Product Serial Number</Label>
              <Input
                id="productSerial"
                name="productSerial"
                placeholder="SN12345678"
                value={formData.productSerial}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Collection Image</Label>
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
                {formData.image ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{formData.image.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(formData.image.size / 1024)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: null }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <Label
                      htmlFor="image-upload"
                      className="mt-2 block cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Upload Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG or SVG (max. 2MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metadata">Additional Metadata</Label>
              <Textarea
                id="metadata"
                name="metadata"
                placeholder="Enter any additional product information in JSON format"
                value={formData.metadata}
                onChange={handleChange}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Example:{" "}
                {
                  '{ "model": "XYZ-100", "color": "Silver", "warranty_period": "2 years" }'
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Minting..." : "Mint NFT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

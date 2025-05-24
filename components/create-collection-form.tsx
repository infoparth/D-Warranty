"use client";

import type React from "react";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { factoryContract, client } from "@/constants/contract";

interface CreateCollectionFormProps {
  onClose: () => void;
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

export default function CreateCollectionForm({
  onClose,
}: CreateCollectionFormProps) {
  const account = useActiveAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    productName: "",
    collectionName: "",
    collectionSymbol: "",
    description: "",
    warrantPeriod: 12,
    image: null as File | null,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let transaction;

      transaction = prepareContractCall({
        contract: factoryContract,
        method: "createContract",
        params: [
          formData.brandName,
          formData.productName,
          formData.collectionName,
          formData.collectionSymbol,
          convertMonthsToSeconds(formData.warrantPeriod),
        ],
      });

      console.log("The transaction is", transaction);

      if (transaction !== undefined && account) {
        const transactionReceipt = await sendAndConfirmTransaction({
          account: account,
          transaction: transaction,
        });

        console.log("The Transaction Receipt is: ", transactionReceipt);

        setIsSubmitting(false);
        onClose();
        return transactionReceipt;
      }
    } catch (err) {
      console.log("Error is:", err);
      setIsSubmitting(false);
      onClose();
    }

    // Simulate form submission
    alert("Your NFT collection created successfully");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom_${Date.now()}`,
      label: "",
      value: "",
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateCustomField = (
    id: string,
    key: "label" | "value",
    newValue: string
  ) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: newValue } : field
      )
    );
  };

  function convertMonthsToSeconds(months: number) {
    const avgSecondsInMonth = 30.44 * 24 * 60 * 60; // ~2,629,746 seconds per month
    return BigInt(Math.round(months * avgSecondsInMonth));
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create NFT Collection</DialogTitle>
            <DialogDescription>
              Create a new NFT warranty collection for your products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collectionName">Collection Name</Label>
              <Input
                id="collectionName"
                name="collectionName"
                placeholder="Premium Watch Warranties"
                value={formData.collectionName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="collectionSymbol">Collection Symbol</Label>
              <Input
                id="collectionSymbol"
                name="collectionSymbol"
                placeholder="PWW"
                value={formData.collectionSymbol}
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
              <Label htmlFor="warrantPeriod">Warranty Period in Months</Label>
              <Input
                id="warrantPeriod"
                name="warrantPeriod"
                placeholder="12"
                type="number"
                value={formData.warrantPeriod}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter warranty period in months
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                name="brandName"
                placeholder="Rolex"
                value={formData.brandName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="Quartz"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="grid gap-2">
                <Label>Custom Fields</Label>
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-2 gap-2 items-end"
                  >
                    <div>
                      <Input
                        placeholder="Field name (e.g., Model)"
                        value={field.label}
                        onChange={(e) =>
                          updateCustomField(field.id, "label", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) =>
                          updateCustomField(field.id, "value", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomField(field.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={addCustomField}
            >
              + Add Field
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

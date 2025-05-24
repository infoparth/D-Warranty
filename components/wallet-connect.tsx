"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WalletConnectProps {
  buttonText?: string
  buttonIcon?: React.ReactNode
}

export default function WalletConnect({ buttonText = "Connect Wallet", buttonIcon }: WalletConnectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false)
      setIsOpen(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {buttonIcon || <Wallet className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your wallet to access the D-Warranty platform.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-between"
            onClick={() => handleConnect("metamask")}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded-full bg-orange-500"></div>
              MetaMask
            </div>
            {isConnecting && <span className="text-xs">Connecting...</span>}
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between"
            onClick={() => handleConnect("walletconnect")}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded-full bg-blue-500"></div>
              WalletConnect
            </div>
            {isConnecting && <span className="text-xs">Connecting...</span>}
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between"
            onClick={() => handleConnect("coinbase")}
            disabled={isConnecting}
          >
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded-full bg-blue-700"></div>
              Coinbase Wallet
            </div>
            {isConnecting && <span className="text-xs">Connecting...</span>}
          </Button>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <div className="text-xs text-muted-foreground">By connecting, you agree to our Terms of Service</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

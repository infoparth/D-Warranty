"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Shield, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import WalletConnect from "@/components/wallet-connect";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/constants/contract";

interface HeaderProps {
  isLoggedIn?: boolean;
  walletAddress?: string;
}

export default function Header({
  isLoggedIn = false,
  walletAddress,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary fill-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            D-Warranty
          </span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/customer-verify"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Verify Warranty
          </Link>
          <Link
            href="/#about-section"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            About
          </Link>
          <Link
            href="/#features-section"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/#contact-section"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* {isLoggedIn ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="rounded-full bg-muted px-3 py-1 text-xs">{walletAddress}</div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="hidden md:block">
              <WalletConnect />
            </div>
          )} */}
          <ConnectButton client={client} />

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">D-Warranty</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/#about-section"
                  className="text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/#features-section"
                  className="text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#contact-section"
                  className="text-base font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                {isLoggedIn ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="rounded-full bg-muted px-3 py-1 text-xs">
                      {walletAddress}
                    </div>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <WalletConnect />
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

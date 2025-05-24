"use client";
import { ArrowRight, Shield, Wallet, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WalletConnect from "@/components/wallet-connect";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/constants/contract";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/dashboard");
    }
  }, [account]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-24 md:py-32">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-no-repeat opacity-5"></div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Decentralized Warranty Platform
                  </h1>
                  <p className="max-w-[600px] md:text-xl">
                    Secure your product authenticity with blockchain-powered
                    digital warranties. Create, mint, and verify NFT-based
                    warranties in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {/* <WalletConnect
                    buttonText="Connect Wallet"
                    buttonIcon={<Wallet className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                  /> */}
                  <ConnectButton
                    client={client}
                    onConnect={() => router.push("/dashboard")}
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      document
                        .getElementById("about-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-1">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-32 w-32 text-primary" />
                  </div>
                  <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-purple-500"></div>
                  <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cyan-500"></div>
                  <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-purple-500"></div>
                  <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cyan-500"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about-section" className="bg-muted/50 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                About D-Warranty
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                D-Warranty is a decentralized platform that empowers brands to
                create NFT-based digital warranties and enables customers to
                verify product authenticity through blockchain technology.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Authentic Verification</h3>
                <p className="text-center text-muted-foreground">
                  Verify product authenticity instantly through
                  blockchain-backed NFT ownership.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Easy Creation</h3>
                <p className="text-center text-muted-foreground">
                  Create and manage NFT warranty collections with a simple,
                  intuitive interface.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Decentralized Control</h3>
                <p className="text-center text-muted-foreground">
                  Maintain full ownership of your warranty data through
                  decentralized blockchain technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Platform Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Discover how D-Warranty revolutionizes product authenticity and
                warranty management.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">NFT Warranties</h3>
                <p className="text-center text-muted-foreground">
                  Create unique digital warranties backed by blockchain
                  technology.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Instant Verification</h3>
                <p className="text-center text-muted-foreground">
                  Verify product authenticity instantly with a simple wallet
                  check.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Transferable Ownership</h3>
                <p className="text-center text-muted-foreground">
                  Transfer warranty ownership when products change hands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Connect your wallet and start creating NFT-based warranties for
                your products today.
              </p>
              {/* <WalletConnect
                buttonText="Connect Wallet"
                buttonIcon={<Wallet className="ml-2 h-4 w-4" />}
              /> */}
              <ConnectButton
                client={client}
                onConnect={() => router.push("/dashboard")}
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact-section" className="bg-muted/50 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                Contact Us
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Have questions about D-Warranty? We're here to help.
              </p>
              <div className="mt-6 flex flex-col gap-4 min-[400px]:flex-row">
                <Button size="lg" variant="outline">
                  support@d-warranty.com
                </Button>
                <Button size="lg">Schedule a Demo</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

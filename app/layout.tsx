import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "D-Warranty",
  description: "Decentralized Warranty Management",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThirdwebProvider>
        <body>
          {" "}
          <main>{children}</main>
          <Toaster />
        </body>
      </ThirdwebProvider>
    </html>
  );
}

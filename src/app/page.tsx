"use client";
import WalletConnectionProvider from "./adapter/page"; // Correct the path to WalletConnectionProvider
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import VotingSystem from "./votingsystem/page";

export default function Home() {
  return (
    <WalletConnectionProvider>
      <WalletMultiButton /> {/* Add the wallet connection button */}
      <VotingSystem /> {/* The main voting system component */}
    </WalletConnectionProvider>
  );
}

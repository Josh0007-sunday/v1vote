"use client";
import WalletConnectionProvider from "./adapter/page";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import VotingSystem from "./votingsystem/page";
import CastVote from "./component/castvote/page";

export default function Home() {
  return (
    <WalletConnectionProvider>
      <VotingSystem />
    </WalletConnectionProvider>
  );
}

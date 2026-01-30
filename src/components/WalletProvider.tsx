"use client";

import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Filter to only show wallets that support Solana features
const isSolanaWallet = (wallet: { features: Record<string, unknown> }) => {
  return Object.keys(wallet.features).some((feature) =>
    feature.startsWith("solana:"),
  );
};

const client = createClient({
  endpoint:
    process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",
  walletConnectors: autoDiscover({ filter: isSolanaWallet }),
});

const queryClient = new QueryClient();

export function WalletProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaProvider client={client}>{children}</SolanaProvider>
    </QueryClientProvider>
  );
}

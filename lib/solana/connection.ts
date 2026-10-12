import { Connection } from "@solana/web3.js";

// Solana RPC connection. api.mainnet-beta.solana.com now returns
// 403 "Access forbidden" to browser sendTransaction (verified Oct 2026),
// which killed launches at the final step. PublicNode is keyless and
// accepts browser traffic, so it is the default; set
// NEXT_PUBLIC_SOLANA_RPC_URL to Helius / QuickNode for real volume.
export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://solana-rpc.publicnode.com";

export function getConnection(): Connection {
  return new Connection(RPC_URL, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60_000,
  });
}

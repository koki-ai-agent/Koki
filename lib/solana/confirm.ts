import type { Connection } from "@solana/web3.js";

// Robust confirmation by polling getSignatureStatuses.
//
// web3.js confirmTransaction() opens a websocket subscription AND races it
// against a block-height check built from a blockhash we fetched AFTER
// sending. On load-balanced public RPCs (PublicNode) the nodes answering
// getLatestBlockhash and getBlockHeight can disagree by more than the
// validity window, which produced "Signature … has expired: block height
// exceeded" for a transaction that was ALREADY finalized on chain. Polling
// the signature status directly has no such race: the chain either knows
// the signature or it doesn't.

export interface ConfirmResult {
  ok: boolean;
  status: "confirmed" | "finalized" | "failed" | "timeout";
  err?: unknown;
}

export async function confirmSignature(
  connection: Connection,
  signature: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<ConfirmResult> {
  const timeoutMs = opts.timeoutMs ?? 90_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const { value } = await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });
      const s = value[0];
      if (s) {
        if (s.err) return { ok: false, status: "failed", err: s.err };
        if (
          s.confirmationStatus === "confirmed" ||
          s.confirmationStatus === "finalized"
        ) {
          return { ok: true, status: s.confirmationStatus };
        }
      }
    } catch {
      // transient RPC hiccup — keep polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { ok: false, status: "timeout" };
}

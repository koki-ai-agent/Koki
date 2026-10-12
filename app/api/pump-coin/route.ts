import { NextResponse, type NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getConnection } from "@/lib/solana/connection";

// /api/pump-coin — a Pump.fun token's live state, read DIRECTLY from chain.
//
// Pump.fun's unofficial frontend API (frontend-api*.pump.fun/coins/<mint>)
// is gone as of Oct 2026 (v3 404s the route, older hosts fail DNS), so
// market data now comes from the source of truth instead: the token's
// bonding-curve PDA. Keyless, no third party, can't be "migrated" away.
//
//   bonding-curve PDA = ["bonding-curve", mint] under the pump program
//   layout (166 bytes):  8 disc | u64 virtualTokenReserves
//                        | u64 virtualSolReserves | u64 realTokenReserves
//                        | u64 realSolReserves | u64 tokenTotalSupply
//                        | bool complete | ...
//
//   price (SOL/token) = virtualSol / virtualToken
//   market cap (SOL)  = price × totalSupply
//   progress          = tokens sold / 793.1M (the curve's sellable supply)
//
// Name / symbol come from the Token-2022 metadata extension pump.fun now
// writes at CreateV2. SOL/USD from Jupiter's keyless price API.

export const runtime = "nodejs";

const PUMP_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const WSOL = "So11111111111111111111111111111111111111112";
// Sellable supply on the curve at launch (793.1M tokens, 6 decimals).
const INITIAL_REAL_TOKEN_RESERVES = 793_100_000_000_000n;

interface PumpCoin {
  mint: string;
  marketCapUsd: number | null;
  marketCapSol: number | null;
  bondingProgress: number | null; // 0..1
  complete: boolean; // graduated (curve complete → PumpSwap/Raydium)
  holders: number | null;
  symbol: string | null;
  name: string | null;
}

interface PumpCoinResponse {
  ok: boolean;
  coin?: PumpCoin;
  error?: string;
  source?: string;
}

const cache = new Map<string, { at: number; coin: PumpCoin }>();
const TTL_MS = 30 * 1000;

let solUsdCache: { at: number; price: number } | null = null;
const SOL_TTL_MS = 60 * 1000;

async function solUsd(): Promise<number | null> {
  if (solUsdCache && Date.now() - solUsdCache.at < SOL_TTL_MS) {
    return solUsdCache.price;
  }
  const sources: Array<() => Promise<number | null>> = [
    async () => {
      const r = await fetch(`https://lite-api.jup.ag/price/v3?ids=${WSOL}`, {
        cache: "no-store",
      });
      if (!r.ok) return null;
      const j = (await r.json()) as Record<string, { usdPrice?: number }>;
      const p = j?.[WSOL]?.usdPrice;
      return typeof p === "number" && p > 0 ? p : null;
    },
    async () => {
      const r = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        { cache: "no-store" },
      );
      if (!r.ok) return null;
      const j = (await r.json()) as { solana?: { usd?: number } };
      const p = j?.solana?.usd;
      return typeof p === "number" && p > 0 ? p : null;
    },
  ];
  for (const s of sources) {
    try {
      const p = await s();
      if (p) {
        solUsdCache = { at: Date.now(), price: p };
        return p;
      }
    } catch {
      /* next source */
    }
  }
  return solUsdCache?.price ?? null;
}

function readU64(b: Uint8Array, o: number): bigint {
  let v = 0n;
  for (let i = 7; i >= 0; i--) v = (v << 8n) | BigInt(b[o + i]);
  return v;
}

export async function GET(req: NextRequest) {
  const mintStr = req.nextUrl.searchParams.get("mint");
  if (!mintStr || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mintStr)) {
    return NextResponse.json<PumpCoinResponse>(
      { ok: false, error: "Invalid mint address" },
      { status: 400 },
    );
  }

  const hit = cache.get(mintStr);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json<PumpCoinResponse>({ ok: true, coin: hit.coin, source: "cache" });
  }

  let mint: PublicKey;
  try {
    mint = new PublicKey(mintStr);
  } catch {
    return NextResponse.json<PumpCoinResponse>(
      { ok: false, error: "Invalid mint address" },
      { status: 400 },
    );
  }

  const connection = getConnection();
  const [curve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    PUMP_PROGRAM,
  );

  try {
    const [curveInfo, mintInfo, usd] = await Promise.all([
      connection.getAccountInfo(curve, "confirmed"),
      connection.getParsedAccountInfo(mint, "confirmed"),
      solUsd(),
    ]);

    if (!curveInfo || curveInfo.data.length < 49) {
      return NextResponse.json<PumpCoinResponse>(
        { ok: false, error: "Bonding curve account not found (not a pump.fun token?)" },
        { status: 404 },
      );
    }

    const d = new Uint8Array(curveInfo.data);
    const vTok = readU64(d, 8);
    const vSol = readU64(d, 16);
    const rTok = readU64(d, 24);
    const total = readU64(d, 40);
    const complete = d[48] === 1;

    // price in SOL per whole token: (vSol/1e9) / (vTok/1e6)
    const priceSol = vTok > 0n ? Number(vSol) / 1e9 / (Number(vTok) / 1e6) : 0;
    const supplyTokens = Number(total) / 1e6;
    const marketCapSol = priceSol * supplyTokens;
    const marketCapUsd = usd ? marketCapSol * usd : null;

    let bondingProgress: number | null;
    if (complete) bondingProgress = 1;
    else {
      const sold = INITIAL_REAL_TOKEN_RESERVES - rTok;
      const ratio = Number(sold) / Number(INITIAL_REAL_TOKEN_RESERVES);
      bondingProgress = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
    }

    // Token-2022 metadata extension (pump.fun CreateV2 mints).
    let name: string | null = null;
    let symbol: string | null = null;
    const parsed = mintInfo.value?.data;
    if (parsed && typeof parsed === "object" && "parsed" in parsed) {
      const exts = (parsed.parsed?.info?.extensions ?? []) as Array<{
        extension?: string;
        state?: { name?: string; symbol?: string };
      }>;
      const tm = exts.find((e) => e.extension === "tokenMetadata");
      if (tm?.state) {
        name = typeof tm.state.name === "string" ? tm.state.name : null;
        symbol = typeof tm.state.symbol === "string" ? tm.state.symbol : null;
      }
    }

    const coin: PumpCoin = {
      mint: mintStr,
      marketCapUsd,
      marketCapSol,
      bondingProgress,
      complete,
      holders: null,
      symbol,
      name,
    };
    cache.set(mintStr, { at: Date.now(), coin });
    return NextResponse.json<PumpCoinResponse>({ ok: true, coin, source: "onchain" });
  } catch (err) {
    console.error(`[pump-coin] onchain read failed for ${mintStr}:`, err);
    if (hit) {
      return NextResponse.json<PumpCoinResponse>({ ok: true, coin: hit.coin, source: "stale" });
    }
    return NextResponse.json<PumpCoinResponse>(
      { ok: false, error: `RPC read failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}

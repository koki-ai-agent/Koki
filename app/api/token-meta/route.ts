import { NextResponse, type NextRequest } from "next/server";

// /api/token-meta?uri=<metadata uri> — server-side fetch of a token's
// metadata JSON. Browsers can't read ipfs.io cross-origin (no CORS, and
// it rate-limits hard), which left every board card without a logo.
// The server tries several gateways for the same CID and rewrites the
// `image` URL onto a gateway that serves <img> reliably.

export const runtime = "nodejs";

const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

const cache = new Map<string, { at: number; body: Record<string, unknown> }>();
const TTL_MS = 10 * 60 * 1000;

function cidOf(url: string): string | null {
  const m = url.match(/\/ipfs\/([^/?#]+)(\/[^?#]*)?/);
  return m ? m[1] + (m[2] ?? "") : null;
}

function candidates(url: string): string[] {
  const cid = cidOf(url);
  if (!cid) return [url];
  return [...GATEWAYS.map((g) => g + cid), url];
}

export async function GET(req: NextRequest) {
  const uri = req.nextUrl.searchParams.get("uri");
  if (!uri || !/^https?:\/\//.test(uri)) {
    return NextResponse.json({ ok: false, error: "uri required" }, { status: 400 });
  }

  const hit = cache.get(uri);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ ok: true, ...hit.body }, {
      headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  }

  for (const url of candidates(uri)) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      clearTimeout(t);
      if (!r.ok) continue;
      const j = (await r.json()) as Record<string, unknown>;
      const image =
        typeof j.image === "string" ? rewriteImage(j.image) : null;
      const body = {
        name: typeof j.name === "string" ? j.name : null,
        symbol: typeof j.symbol === "string" ? j.symbol : null,
        description: typeof j.description === "string" ? j.description : null,
        image,
        twitter: typeof j.twitter === "string" ? j.twitter : null,
        website: typeof j.website === "string" ? j.website : null,
        telegram: typeof j.telegram === "string" ? j.telegram : null,
      };
      cache.set(uri, { at: Date.now(), body });
      return NextResponse.json({ ok: true, ...body }, {
        headers: { "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" },
      });
    } catch {
      /* next gateway */
    }
  }
  return NextResponse.json({ ok: false, error: "metadata unreachable" }, { status: 502 });
}

// Pinata's gateway serves our pinned uploads; ipfs.io is flaky for <img>.
function rewriteImage(img: string): string {
  const cid = cidOf(img);
  return cid ? GATEWAYS[0] + cid : img;
}

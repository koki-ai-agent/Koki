// ─────────────────────────────────────────────────────────────────────────
// Token metadata upload → IPFS (Pinata)
//
// Pump.fun RETIRED its public upload endpoint (pump.fun/api/ipfs is no
// longer supported). PumpPortal's official examples now upload to Pinata
// and pass the resulting ipfs.io URI to trade-local. Same shape, new host:
//
//   1. POST image file      → https://uploads.pinata.cloud/v3/files → CID
//   2. POST metadata JSON   → https://uploads.pinata.cloud/v3/files → CID
//   3. metadataUri = https://ipfs.io/ipfs/<metadata CID>
//
// Server-side only — needs PINATA_JWT (free account key). The user's
// browser never touches the upload endpoint directly.
// ─────────────────────────────────────────────────────────────────────────

const PINATA_UPLOAD = "https://uploads.pinata.cloud/v3/files";

export interface PumpIpfsMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface PumpIpfsResult {
  metadataUri: string;
  metadata: Record<string, unknown>;
}

function pinataJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error(
      "PINATA_JWT is not set. Pump.fun retired its public IPFS endpoint — " +
        "create a free key at pinata.cloud and set PINATA_JWT."
    );
  }
  return jwt;
}

async function pinataUpload(file: Blob | File, filename: string): Promise<string> {
  const form = new FormData();
  form.append("network", "public");
  form.append("file", file, filename);
  const res = await fetch(PINATA_UPLOAD, {
    method: "POST",
    headers: { Authorization: `Bearer ${pinataJwt()}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as { data?: { cid?: string } };
  const cid = json?.data?.cid;
  if (!cid) throw new Error("Pinata response missing data.cid");
  return cid;
}

/**
 * Upload an image + metadata JSON to IPFS via Pinata. Returns the metadata
 * URI we then pass to PumpPortal's `trade-local` endpoint.
 */
export async function uploadPumpIpfs(
  imageBlob: Blob,
  meta: PumpIpfsMetadata
): Promise<PumpIpfsResult> {
  const imageCid = await pinataUpload(imageBlob, "logo.png");
  const image = `https://ipfs.io/ipfs/${imageCid}`;

  const metadata: Record<string, unknown> = {
    name: meta.name,
    symbol: meta.symbol,
    description: meta.description,
    image,
    showName: true,
    createdOn: "https://pump.fun",
  };
  if (meta.twitter) metadata.twitter = meta.twitter;
  if (meta.telegram) metadata.telegram = meta.telegram;
  if (meta.website) metadata.website = meta.website;

  const metadataFile = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });
  const metadataCid = await pinataUpload(metadataFile, "metadata.json");

  return { metadataUri: `https://ipfs.io/ipfs/${metadataCid}`, metadata };
}

/**
 * Placeholder transparent PNG when the user did not upload a logo.
 * Pump.fun requires an image file; this gives a tiny 1x1 PNG so the
 * call doesn't fail. (UI nudges the user to upload a real logo.)
 */
export function placeholderLogoBlob(): Blob {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/ePEEAAAAASUVORK5CYII=";
  const binary = Buffer.from(base64, "base64");
  return new Blob([binary], { type: "image/png" });
}

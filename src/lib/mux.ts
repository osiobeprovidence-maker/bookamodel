const MUX_TOKEN_ID = import.meta.env.VITE_MUX_TOKEN_ID || "";
const MUX_TOKEN_SECRET = import.meta.env.VITE_MUX_TOKEN_SECRET || "";
const MUX_PLAYBACK_POLICY = import.meta.env.VITE_MUX_PLAYBACK_POLICY || "signed";

export interface MuxAsset {
  id: string;
  playback_ids: { id: string; policy: string }[];
  status: string;
  duration?: number;
  created_at: string;
}

export interface MuxUploadUrl {
  id: string;
  url: string;
  asset_id?: string;
  status: string;
  created_at: string;
}

export function getMuxPlaybackUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function getMuxThumbnailUrl(playbackId: string, time?: number): string {
  const base = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  return time ? `${base}?time=${time}` : base;
}

export function getMuxPosterUrl(playbackId: string): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1280&height=720`;
}

export async function createDirectUpload(): Promise<MuxUploadUrl> {
  const response = await fetch("/api/mux/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playback_policy: MUX_PLAYBACK_POLICY }),
  });
  if (!response.ok) throw new Error("Failed to create Mux upload");
  return response.json();
}

export async function getAssetStatus(assetId: string): Promise<MuxAsset> {
  const response = await fetch(`/api/mux/asset/${assetId}`);
  if (!response.ok) throw new Error("Failed to get Mux asset status");
  return response.json();
}

/**
 * NVR/DVR disk kapasitesi hesaplama — endüstride yaygın kullanılan referans
 * bit hızı tablosu yöntemiyle çalışır (Hikvision/Dahua'nın kendi hesaplama
 * araçlarıyla aynı mantık): her çözünürlük için 25fps H.264 baz bit hızı
 * alınır, FPS ve codec'e göre ölçeklenir.
 */

export const RESOLUTIONS = [
  { key: "1mp", label: "1MP / 720p" },
  { key: "2mp", label: "2MP / 1080p Full HD" },
  { key: "3mp", label: "3MP" },
  { key: "4mp", label: "4MP" },
  { key: "5mp", label: "5MP" },
  { key: "8mp", label: "8MP / 4K" },
] as const;
export type ResolutionKey = (typeof RESOLUTIONS)[number]["key"];

export const FPS_OPTIONS = [10, 15, 20, 25, 30] as const;

export const CODECS = [
  { key: "h265", label: "H.265+ (yeni cihazlar, ~%50 daha az yer kaplar)" },
  { key: "h264", label: "H.264 (klasik)" },
] as const;
export type CodecKey = (typeof CODECS)[number]["key"];

export const RETENTION_PRESETS = [7, 15, 30, 60, 90] as const;

/** 25fps, H.264, orta-yüksek kalitede referans bit hızı (kbps). */
const BASE_BITRATE_KBPS_H264_25FPS: Record<ResolutionKey, number> = {
  "1mp": 2048,
  "2mp": 4096,
  "3mp": 5120,
  "4mp": 6144,
  "5mp": 7168,
  "8mp": 12288,
};

export function estimateBitrateKbps(resolution: ResolutionKey, fps: number, codec: CodecKey): number {
  const base = BASE_BITRATE_KBPS_H264_25FPS[resolution];
  const fpsFactor = fps / 25;
  const codecFactor = codec === "h265" ? 0.5 : 1;
  return Math.round(base * fpsFactor * codecFactor);
}

export type CameraGroup = {
  id: string;
  label: string;
  count: number;
  resolution: ResolutionKey;
  fps: number;
  codec: CodecKey;
  continuous: boolean; // true: 7/24 sürekli kayıt, false: hareket algılama
  activeHoursPerDay: number; // yalnızca continuous=false iken kullanılır
  audio: boolean;
};

export function emptyGroup(id: string): CameraGroup {
  return {
    id,
    label: "",
    count: 4,
    resolution: "4mp",
    fps: 25,
    codec: "h265",
    continuous: true,
    activeHoursPerDay: 8,
    audio: false,
  };
}

export type GroupResult = {
  group: CameraGroup;
  kbpsPerCamera: number;
  gbPerCameraPerDay: number;
  totalGB: number;
};

export function calcGroup(group: CameraGroup, retentionDays: number): GroupResult {
  const kbps = estimateBitrateKbps(group.resolution, group.fps, group.codec) + (group.audio ? 64 : 0);
  const activeHours = group.continuous ? 24 : Math.min(24, Math.max(0, group.activeHoursPerDay));
  const bytesPerSecond = (kbps * 1000) / 8;
  const bytesPerDayPerCamera = bytesPerSecond * activeHours * 3600;
  const gbPerCameraPerDay = bytesPerDayPerCamera / 1024 ** 3;
  const totalGB = gbPerCameraPerDay * retentionDays * Math.max(0, group.count);
  return { group, kbpsPerCamera: kbps, gbPerCameraPerDay, totalGB };
}

export const STANDARD_HDD_SIZES_TB = [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;

export type DiskSuggestion = { count: number; sizeTb: number; totalTb: number };

export function suggestDisks(totalGB: number, raidMirror: boolean): DiskSuggestion {
  const rawTb = (totalGB / 1024) * (raidMirror ? 2 : 1);
  const largest = STANDARD_HDD_SIZES_TB[STANDARD_HDD_SIZES_TB.length - 1];
  const fit = STANDARD_HDD_SIZES_TB.find((tb) => tb >= rawTb);
  if (fit) return { count: raidMirror ? 2 : 1, sizeTb: fit, totalTb: fit * (raidMirror ? 2 : 1) };
  const count = Math.ceil(rawTb / largest) * (raidMirror ? 2 : 1);
  return { count, sizeTb: largest, totalTb: count * largest };
}

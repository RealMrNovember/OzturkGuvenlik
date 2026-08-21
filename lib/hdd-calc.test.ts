import { describe, expect, test } from "vitest";
import { estimateBitrateKbps, calcGroup, suggestDisks, emptyGroup } from "@/lib/hdd-calc";

describe("estimateBitrateKbps", () => {
  test("returns the base H.264/25fps bitrate unscaled", () => {
    expect(estimateBitrateKbps("4mp", 25, "h264")).toBe(6144);
  });

  test("scales down proportionally with fps", () => {
    expect(estimateBitrateKbps("2mp", 12.5, "h264")).toBe(2048);
  });

  test("h265 halves the bitrate versus h264 at the same fps", () => {
    const h264 = estimateBitrateKbps("8mp", 25, "h264");
    const h265 = estimateBitrateKbps("8mp", 25, "h265");
    expect(h265).toBe(h264 / 2);
  });
});

describe("calcGroup", () => {
  test("continuous recording uses 24 active hours regardless of activeHoursPerDay", () => {
    const group = { ...emptyGroup("g1"), continuous: true, activeHoursPerDay: 2, count: 1 };
    const motionGroup = { ...group, continuous: false, activeHoursPerDay: 2 };
    const continuousResult = calcGroup(group, 30);
    const motionResult = calcGroup(motionGroup, 30);
    expect(continuousResult.totalGB).toBeGreaterThan(motionResult.totalGB);
  });

  test("totalGB scales linearly with camera count and retention days", () => {
    const group = { ...emptyGroup("g1"), count: 2 };
    const oneCam30Days = calcGroup({ ...group, count: 1 }, 30);
    const twoCam30Days = calcGroup({ ...group, count: 2 }, 30);
    const oneCam60Days = calcGroup({ ...group, count: 1 }, 60);
    expect(twoCam30Days.totalGB).toBeCloseTo(oneCam30Days.totalGB * 2, 5);
    expect(oneCam60Days.totalGB).toBeCloseTo(oneCam30Days.totalGB * 2, 5);
  });

  test("audio adds a fixed 64kbps overhead", () => {
    const group = emptyGroup("g1");
    const withAudio = calcGroup({ ...group, audio: true }, 1);
    const withoutAudio = calcGroup({ ...group, audio: false }, 1);
    expect(withAudio.kbpsPerCamera - withoutAudio.kbpsPerCamera).toBe(64);
  });
});

describe("suggestDisks", () => {
  test("picks the smallest standard size that fits the requirement", () => {
    // 1.5 TB gerektiren bir kurulum 2 TB'a yuvarlanmalı.
    const result = suggestDisks(1.5 * 1024, false);
    expect(result).toEqual({ count: 1, sizeTb: 2, totalTb: 2 });
  });

  test("RAID 1 sizes each disk for the actual data (not doubled) and only doubles the disk count", () => {
    // Regresyon testi: RAID 1'de her disk verinin TAM bir kopyasını tutar,
    // bu yüzden disk boyutu 1.5 TB'a göre (2 TB'a yuvarlanarak) seçilmeli —
    // veri miktarını önce ikiye katlayıp SONRA disk boyutu seçmek yanlıştı
    // (önerilen toplam kapasiteyi gerekenin ~2 katına çıkarıyordu).
    const result = suggestDisks(1.5 * 1024, true);
    expect(result).toEqual({ count: 2, sizeTb: 2, totalTb: 4 });
  });

  test("falls back to multiple largest disks when capacity exceeds the largest standard size", () => {
    // 25 TB, en büyük standart 20 TB'ı aşıyor -> 2 adet 20 TB gerekir.
    const result = suggestDisks(25 * 1024, false);
    expect(result).toEqual({ count: 2, sizeTb: 20, totalTb: 40 });
  });

  test("RAID 1 with capacity exceeding the largest standard size doubles disk count for the mirror", () => {
    // 25 TB veri, RAID 1: veri için 2 adet 20 TB disk gerekir (ceil(25/20)=2),
    // mirror için bu adet ikiye katlanır -> 4 adet 20 TB.
    const result = suggestDisks(25 * 1024, true);
    expect(result).toEqual({ count: 4, sizeTb: 20, totalTb: 80 });
  });
});

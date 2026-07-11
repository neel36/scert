import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  let config = await db.adConfig.findFirst();
  if (!config) {
    config = await db.adConfig.create({ data: {} });
  }
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  let config = await db.adConfig.findFirst();
  const data = {
    network: body.network,
    enabled: body.enabled,
    appId: body.appId ?? null,
    bannerAdUnitId: body.bannerAdUnitId ?? null,
    interstitialAdUnitId: body.interstitialAdUnitId ?? null,
    nativeAdUnitId: body.nativeAdUnitId ?? null,
    rewardedAdUnitId: body.rewardedAdUnitId ?? null,
    appOpenAdUnitId: body.appOpenAdUnitId ?? null,
    bannerEnabled: body.bannerEnabled,
    interstitialEnabled: body.interstitialEnabled,
    nativeEnabled: body.nativeEnabled,
    rewardedEnabled: body.rewardedEnabled,
    appOpenEnabled: body.appOpenEnabled,
    interstitialInterval: body.interstitialInterval !== undefined ? Number(body.interstitialInterval) : undefined,
    testMode: body.testMode,
  };
  if (!config) {
    config = await db.adConfig.create({ data: data as any });
  } else {
    config = await db.adConfig.update({ where: { id: config.id }, data: data as any });
  }
  return NextResponse.json({ config });
}

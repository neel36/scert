"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  Megaphone,
  Save,
  Loader2,
  RefreshCw,
  Info,
  FlaskConical,
} from "lucide-react";
import { SectionHeader, Field, EmptyState } from "./_shared";
import type { AdConfig } from "@/lib/types";

interface AdType {
  key: "bannerEnabled" | "interstitialEnabled" | "nativeEnabled" | "rewardedEnabled" | "appOpenEnabled";
  idKey: keyof AdConfig;
  label: string;
  description: string;
}

const AD_TYPES: AdType[] = [
  {
    key: "bannerEnabled",
    idKey: "bannerAdUnitId",
    label: "Banner Ads",
    description: "स्क्रीन के ऊपर/नीचे दिखने वाले बैनर",
  },
  {
    key: "interstitialEnabled",
    idKey: "interstitialAdUnitId",
    label: "Interstitial Ads",
    description: "फुल-स्क्रीन विज्ञापन (नियमित अंतराल पर)",
  },
  {
    key: "nativeEnabled",
    idKey: "nativeAdUnitId",
    label: "Native Ads",
    description: "सूची में घुले-मिले विज्ञापन",
  },
  {
    key: "rewardedEnabled",
    idKey: "rewardedAdUnitId",
    label: "Rewarded Ads",
    description: "इनाम देने वाले विज्ञापन",
  },
  {
    key: "appOpenEnabled",
    idKey: "appOpenAdUnitId",
    label: "App Open Ads",
    description: "ऐप खुलने पर दिखने वाले विज्ञापन",
  },
];

export function AdsManager() {
  const [config, setConfig] = React.useState<AdConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ config: AdConfig }>("/api/admin/ads");
      setConfig(r.config);
    } catch (e: unknown) {
      toast.error(
        "लोड विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  function update<K extends keyof AdConfig>(key: K, value: AdConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const r = await adminRequest<{ config: AdConfig }>("/api/admin/ads", {
        method: "PUT",
        body: JSON.stringify(config),
      });
      setConfig(r.config);
      toast.success("विज्ञापन सेटिंग्स सेव हो गईं");
    } catch (e: unknown) {
      toast.error(
        "सेव विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="विज्ञापन सेटिंग्स"
          description="AdMob / Facebook विज्ञापन कॉन्फ़िगर करें"
          icon={Megaphone}
        />
        <div className="h-96 animate-pulse rounded-lg border bg-muted" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="विज्ञापन सेटिंग्स"
          description="AdMob / Facebook विज्ञापन कॉन्फ़िगर करें"
          icon={Megaphone}
        />
        <EmptyState
          icon={Megaphone}
          title="कॉन्फ़िग लोड नहीं हो सका"
          description="कृपया रिफ्रेश करें"
          action={
            <Button size="sm" onClick={load}>
              <RefreshCw className="mr-1 h-4 w-4" /> रिफ्रेश
            </Button>
          }
        />
      </div>
    );
  }

  const enabledAds = AD_TYPES.filter((t) => config[t.key]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="विज्ञापन सेटिंग्स"
        description="AdMob / Facebook विज्ञापन कॉन्फ़िगर करें — यह ऐप के मॉनिटाइज़ेशन को नियंत्रित करता है"
        icon={Megaphone}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1 h-4 w-4" /> रिफ्रेश
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          यहाँ सेट की गई विज्ञापन सेटिंग्स ऐप में लाइव होती हैं। AdMob/Facebook
          डैशबोर्ड से अपने App ID और Ad Unit IDs यहाँ डालें। परीक्षण के लिए
          Test Mode चालू रखें।
        </span>
      </div>

      {/* Enabled ads preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">सक्रिय विज्ञापन प्रकार</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {enabledAds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              कोई विज्ञापन प्रकार सक्रिय नहीं है
            </p>
          ) : (
            enabledAds.map((t) => (
              <Badge
                key={t.key}
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              >
                {t.label}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          {/* Network + master switch */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="विज्ञापन नेटवर्क">
              <Select
                value={config.network}
                onValueChange={(v) =>
                  update("network", v as "admob" | "facebook")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admob">AdMob</SelectItem>
                  <SelectItem value="facebook">Facebook Audience</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">विज्ञापन सक्षम</Label>
                <p className="text-xs text-muted-foreground">
                  मास्टर टॉगल
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => update("enabled", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="flex items-center gap-1 text-sm font-medium">
                  <FlaskConical className="h-3.5 w-3.5" /> Test Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  टेस्ट विज्ञापन दिखाएँ
                </p>
              </div>
              <Switch
                checked={config.testMode}
                onCheckedChange={(v) => update("testMode", v)}
              />
            </div>
          </div>

          <Field label="App ID" hint="AdMob या Facebook से प्राप्त App ID">
            <Input
              value={config.appId ?? ""}
              onChange={(e) => update("appId", e.target.value)}
              placeholder="ca-app-pub-XXXX~YYYY"
            />
          </Field>

          <Separator />

          {/* Per-ad-type config */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">विज्ञापन प्रकार सेटिंग्स</h3>
            {AD_TYPES.map((t) => (
              <div key={t.key} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Label className="text-sm font-medium">{t.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <Switch
                    checked={config[t.key] as boolean}
                    onCheckedChange={(v) =>
                      update(t.key, v as never)
                    }
                  />
                </div>
                {config[t.key] && (
                  <div className="mt-3">
                    <Input
                      value={(config[t.idKey] as string) ?? ""}
                      onChange={(e) =>
                        update(t.idKey, e.target.value as never)
                      }
                      placeholder={`${t.label} Ad Unit ID`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <Field
            label="Interstitial Interval"
            hint="कितने एक्शन के बाद interstitial दिखाएँ (0 = हर बार)"
          >
            <Input
              type="number"
              value={config.interstitialInterval}
              onChange={(e) =>
                update("interstitialInterval", Number(e.target.value))
              }
              min={0}
            />
          </Field>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={load} disabled={saving}>
              रद्द करें
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              सेव करें
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

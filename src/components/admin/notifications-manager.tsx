"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminRequest } from "@/lib/api";
import { toast } from "sonner";
import { Bell, Save, Loader2, RefreshCw, Info } from "lucide-react";
import { SectionHeader, Field, EmptyState } from "./_shared";
import type { NotificationConfig } from "@/lib/types";

export function NotificationsManager() {
  const [config, setConfig] = React.useState<NotificationConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ config: NotificationConfig }>(
        "/api/admin/notifications"
      );
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

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const r = await adminRequest<{ config: NotificationConfig }>(
        "/api/admin/notifications",
        {
          method: "PUT",
          body: JSON.stringify({
            enabled: config.enabled,
            onesignalAppId: config.onesignalAppId,
          }),
        }
      );
      setConfig(r.config);
      toast.success("नोटिफिकेशन सेटिंग्स सेव हो गईं");
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
          title="नोटिफिकेशन सेटिंग्स"
          description="OneSignal पुश नोटिफिकेशन कॉन्फ़िगर करें"
          icon={Bell}
        />
        <div className="h-64 animate-pulse rounded-lg border bg-muted" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="नोटिफिकेशन सेटिंग्स"
          description="OneSignal पुश नोटिफिकेशन कॉन्फ़िगर करें"
          icon={Bell}
        />
        <EmptyState
          icon={Bell}
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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="नोटिफिकेशन सेटिंग्स"
        description="OneSignal पुश नोटिफिकेशन कॉन्फ़िगर करें"
        icon={Bell}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1 h-4 w-4" /> रिफ्रेश
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          OneSignal आपके ऐप में फ्री पुश नोटिफिकेशन देता है।{" "}
          <a
            href="https://onesignal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            onesignal.com
          </a>{" "}
          पर अकाउंट बनाएँ, नया ऐप जोड़ें और नीचे App ID डालें।
        </span>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label className="text-sm font-medium">पुश नोटिफिकेशन सक्षम</Label>
              <p className="text-xs text-muted-foreground">
                उपयोगकर्ताओं को नोटिफिकेशन भेजने की अनुमति दें
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) =>
                setConfig((prev) => (prev ? { ...prev, enabled: v } : prev))
              }
            />
          </div>

          <Field
            label="OneSignal App ID"
            hint="OneSignal डैशबोर्ड से अपना App ID कॉपी करें"
          >
            <Input
              value={config.onesignalAppId ?? ""}
              onChange={(e) =>
                setConfig((prev) =>
                  prev ? { ...prev, onesignalAppId: e.target.value } : prev
                )
              }
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              disabled={!config.enabled}
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

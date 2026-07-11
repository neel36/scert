"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { adminRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader, Field, EmptyState } from "./_shared";

const DEFAULTS: Record<string, string> = {
  app_name: "BOOKS AND NOTES CG BOARD",
  app_tagline: "अपनी पढ़ाई, अपनी किताबें",
  primary_color: "#10b981",
  version: "1.0.0",
  contact_email: "",
  privacy_url: "",
  about_text: "",
  require_internet: "false",
};

export function SettingsManager() {
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [confirmPwd, setConfirmPwd] = React.useState("");
  const [changingPwd, setChangingPwd] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ settings: Record<string, string> }>(
        "/api/admin/settings"
      );
      setSettings({ ...DEFAULTS, ...r.settings });
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

  function set<K extends string>(key: K, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const r = await adminRequest<{ settings: Record<string, string> }>(
        "/api/admin/settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        }
      );
      setSettings({ ...DEFAULTS, ...r.settings });
      toast.success("सेटिंग्स सेव हो गईं");
    } catch (e: unknown) {
      toast.error(
        "सेव विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPwd || !newPwd) {
      toast.error("सभी फ़ील्ड भरें");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("नया पासवर्ड और पुष्टि मेल नहीं खाते");
      return;
    }
    if (newPwd.length < 4) {
      toast.error("पासवर्ड कम से कम 4 अक्षर का होना चाहिए");
      return;
    }
    setChangingPwd(true);
    try {
      const r = await adminRequest<{ settings: Record<string, string> }>(
        "/api/admin/settings",
        {
          method: "PUT",
          body: JSON.stringify({
            current_password: currentPwd,
            admin_password: newPwd,
          }),
        }
      );
      setSettings({ ...DEFAULTS, ...r.settings });
      toast.success("पासवर्ड बदला गया");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e: unknown) {
      toast.error(
        "पासवर्ड बदलने में त्रुटि: " +
          (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setChangingPwd(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="एप सेटिंग्स"
          description="ऐप की सामान्य सेटिंग्स और एडमिन पासवर्ड"
          icon={SettingsIcon}
        />
        <div className="h-96 animate-pulse rounded-lg border bg-muted" />
      </div>
    );
  }

  if (!settings || Object.keys(settings).length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="एप सेटिंग्स"
          description="ऐप की सामान्य सेटिंग्स और एडमिन पासवर्ड"
          icon={SettingsIcon}
        />
        <EmptyState
          icon={SettingsIcon}
          title="सेटिंग्स लोड नहीं हो सकीं"
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

  const requireInternet = settings.require_internet === "true";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="एप सेटिंग्स"
        description="ऐप की सामान्य सेटिंग्स और एडमिन पासवर्ड प्रबंधित करें"
        icon={SettingsIcon}
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1 h-4 w-4" /> रिफ्रेश
          </Button>
        }
      />

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">सामान्य सेटिंग्स</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ऐप का नाम" required>
              <Input
                value={settings.app_name ?? ""}
                onChange={(e) => set("app_name", e.target.value)}
                placeholder="BOOKS AND NOTES CG BOARD"
              />
            </Field>
            <Field label="ऐप टैगलाइन">
              <Input
                value={settings.app_tagline ?? ""}
                onChange={(e) => set("app_tagline", e.target.value)}
                placeholder="अपनी पढ़ाई, अपनी किताबें"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="प्राथमिक रंग">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color || "#10b981"}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-background p-1"
                />
                <Input
                  value={settings.primary_color ?? ""}
                  onChange={(e) => set("primary_color", e.target.value)}
                  placeholder="#10b981"
                />
              </div>
            </Field>
            <Field label="वर्ज़न">
              <Input
                value={settings.version ?? ""}
                onChange={(e) => set("version", e.target.value)}
                placeholder="1.0.0"
              />
            </Field>
            <Field label="संपर्क ईमेल">
              <Input
                type="email"
                value={settings.contact_email ?? ""}
                onChange={(e) => set("contact_email", e.target.value)}
                placeholder="support@example.com"
              />
            </Field>
          </div>

          <Field label="प्राइवेसी URL">
            <Input
              value={settings.privacy_url ?? ""}
              onChange={(e) => set("privacy_url", e.target.value)}
              placeholder="https://example.com/privacy"
            />
          </Field>

          <Field label="ऐप के बारे में">
            <Textarea
              value={settings.about_text ?? ""}
              onChange={(e) => set("about_text", e.target.value)}
              placeholder="इस ऐप के बारे में संक्षिप्त जानकारी…"
              rows={4}
            />
          </Field>

          <Separator />

          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <Label className="flex items-center gap-1 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" /> इंटरनेट आवश्यक
              </Label>
              <p className="text-xs text-muted-foreground">
                चालू होने पर ऐप ऑफ़लाइन काम नहीं करेगा
              </p>
            </div>
            <Switch
              checked={requireInternet}
              onCheckedChange={(v) => set("require_internet", v ? "true" : "false")}
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={load} disabled={saving}>
              रद्द करें
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              सेटिंग्स सेव करें
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            एडमिन पासवर्ड बदलें
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="वर्तमान पासवर्ड" required>
            <Input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="नया पासवर्ड" required>
              <Input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field label="नए पासवर्ड की पुष्टि" required>
              <Input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentPwd("");
                setNewPwd("");
                setConfirmPwd("");
              }}
              disabled={changingPwd}
            >
              साफ़ करें
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPwd}>
              {changingPwd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              पासवर्ड बदलें
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

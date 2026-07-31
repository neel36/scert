"use client";

import { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Rows3,
  Columns3,
  Sparkles,
  HardDrive,
  Info,
  Trash2,
  Palette,
  ChevronRight,
  Shield,
  Globe,
} from "lucide-react";
import { useLibraryStore } from "@/stores/library-store";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppConfig } from "@/lib/types";

interface SettingsScreenProps {
  config: AppConfig;
}

export function SettingsScreen({ config }: SettingsScreenProps) {
  const readerSettings = useLibraryStore((s) => s.readerSettings);
  const setReaderSettings = useLibraryStore((s) => s.setReaderSettings);
  const downloads = useLibraryStore((s) => s.downloads);
  const removeDownload = useLibraryStore((s) => s.removeDownload);
  const [clearOpen, setClearOpen] = useState(false);

  const s = config.settings;

  const totalSize = downloads.reduce((n, d) => n + (d.fileSize || 0), 0);
  const sizeText =
    totalSize > 0
      ? (totalSize / (1024 * 1024)).toFixed(1) + " MB"
      : "0 MB";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Settings className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold leading-tight">सेटिंग्स</h2>
          <p className="text-[11px] text-muted-foreground">
            रीडर, स्टोरेज और ऐप जानकारी
          </p>
        </div>
      </div>

      {/* Reader settings */}
      <Section icon={<Sparkles className="h-4 w-4" />} title="रीडर सेटिंग्स">
        <Row
          icon={readerSettings.nightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          title="नाइट मोड"
          desc="कम रोशनी में पढ़ने के लिए"
        >
          <Switch
            checked={readerSettings.nightMode}
            onCheckedChange={(v) => setReaderSettings({ nightMode: v })}
          />
        </Row>
        <Row
          icon={readerSettings.pageTurnAnim ? <Sparkles className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          title="पेज टर्न एनिमेशन"
          desc="पेज बदलते समय स्लाइड इफ़ेक्ट"
        >
          <Switch
            checked={readerSettings.pageTurnAnim}
            onCheckedChange={(v) => setReaderSettings({ pageTurnAnim: v })}
          />
        </Row>
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">
            {readerSettings.scrollMode === "vertical" ? (
              <Rows3 className="h-4 w-4" />
            ) : (
              <Columns3 className="h-4 w-4" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">स्क्रॉल मोड</p>
            <p className="text-[11px] text-muted-foreground">पेज कैसे स्क्रॉल हों</p>
          </div>
          <div className="flex gap-1 rounded-full border bg-card p-1">
            {(["horizontal", "vertical"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setReaderSettings({ scrollMode: m })}
                className={
                  "rounded-full px-3 py-1 text-[11px] font-medium transition-colors " +
                  (readerSettings.scrollMode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground")
                }
              >
                {m === "horizontal" ? "स्लाइड" : "स्क्रॉल"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">डिफ़ॉल्ट ज़ूम</p>
            <p className="text-[11px] text-muted-foreground">
              {Math.round(readerSettings.zoom * 100)}%
            </p>
          </div>
          <Slider
            value={[readerSettings.zoom]}
            min={0.6}
            max={2.5}
            step={0.1}
            onValueChange={(v) => setReaderSettings({ zoom: v[0] })}
            className="w-28"
          />
        </div>
      </Section>

      {/* Storage */}
      <Section icon={<HardDrive className="h-4 w-4" />} title="स्टोरेज">
        <div className="rounded-xl bg-muted/50 p-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">डाउनलोडेड किताबें</span>
            <span className="text-muted-foreground">
              {downloads.length} आइटम • {sizeText}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, downloads.length * 12)}%` }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => setClearOpen(true)}
            disabled={downloads.length === 0}
          >
            <Trash2 className="h-4 w-4" /> सभी डाउनलोड हटाएं
          </Button>
        </div>
      </Section>



      {/* About */}
      <Section icon={<Info className="h-4 w-4" />} title="ऐप के बारे में">
        <InfoRow label="ऐप नाम" value={s.app_name || "BOOKS AND NOTES CG BOARD"} />
        <InfoRow label="संस्करण" value={s.version || "1.0.0"} />
        {s.app_tagline && <InfoRow label="टैगलाइन" value={s.app_tagline} />}
        {s.contact_email && (
          <InfoRow label="संपर्क" value={s.contact_email} />
        )}
        {s.about_text && (
          <p className="px-1 pt-1 text-[12px] leading-relaxed text-muted-foreground">
            {s.about_text}
          </p>
        )}
      </Section>

      <Section icon={<Shield className="h-4 w-4" />} title="लिंक">
        {s.privacy_url && (
          <LinkRow icon={<Shield className="h-4 w-4" />} label="प्राइवेसी पॉलिसी" url={s.privacy_url} />
        )}
        <LinkRow
          icon={<Globe className="h-4 w-4" />}
          label="वेबसाइट"
          url="https://cgboardbooks.in"
        />
      </Section>

      <p className="pb-2 text-center text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} {s.app_name || "BOOKS AND NOTES CG BOARD"}
      </p>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>सभी डाउनलोड हटाएं?</DialogTitle>
            <DialogDescription>
              यह आपकी सभी डाउनलोड की गई किताबें, बुकमार्क और नोट्स हटा देगा। यह
              क्रिया वापस नहीं हो सकती।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              रद्द करें
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                downloads.forEach((d) => removeDownload(d.id));
                setClearOpen(false);
              }}
            >
              हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right text-xs font-medium">{value}</span>
    </div>
  );
}

function LinkRow({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  return (
    <button
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className="flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-accent rounded-lg"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
      {children}
    </span>
  );
}

export { Palette };

"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  Field,
} from "./_shared";
import type { SplashSlide } from "@/lib/types";

export function SplashManager() {
  const [items, setItems] = React.useState<SplashSlide[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<SplashSlide | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<SplashSlide | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ slides: SplashSlide[] }>(
        "/api/admin/splash"
      );
      setItems(r.slides);
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

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(s: SplashSlide) {
    setEditing(s);
    setOpen(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/splash/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/splash", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("स्लाइड जोड़ी गई");
      }
      setOpen(false);
      await load();
    } catch (e: unknown) {
      toast.error(
        "सेव विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      await adminRequest(`/api/admin/splash/${del.id}`, { method: "DELETE" });
      toast.success("हटाया गया");
      setDel(null);
      await load();
    } catch (e: unknown) {
      toast.error(
        "हटाने में त्रुटि: " +
          (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="स्प्लैश स्लाइड्स"
        description="ऐप खुलने पर दिखने वाली ऑनबोर्डिंग स्लाइड्स प्रबंधित करें"
        icon={ImageIcon}
        action={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw
                className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              रिफ्रेश
            </Button>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" />
              नई स्लाइड
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="कोई स्प्लैश स्लाइड नहीं"
          description="नई स्लाइड जोड़ें"
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" /> नई स्लाइड
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {s.imageUrl ? (
                   
                  <img
                    src={s.imageUrl}
                    alt={s.title || "splash"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity =
                        "0.3";
                    }}
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  <Badge className="bg-black/60 text-white hover:bg-black/60">
                    <Clock className="mr-1 h-3 w-3" />
                    {(s.duration / 1000).toFixed(1)}s
                  </Badge>
                  {!s.active && (
                    <Badge variant="outline" className="bg-white/90">
                      निष्क्रिय
                    </Badge>
                  )}
                </div>
                <div className="absolute left-2 top-2">
                  <Badge variant="secondary" className="bg-white/90">
                    #{s.order}
                  </Badge>
                </div>
              </div>
              <CardContent className="space-y-2 p-3">
                <div>
                  <p className="line-clamp-1 font-medium">
                    {s.title || "(बिना शीर्षक)"}
                  </p>
                  {s.subtitle && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {s.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => openEdit(s)}
                  >
                    <Edit className="mr-1 h-3.5 w-3.5" /> संपादित करें
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDel(s)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SplashDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="स्लाइड हटाएँ?"
        description="यह स्लाइड हटाई जाएगी।"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function SplashDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: SplashSlide | null;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [imageUrl, setImageUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [order, setOrder] = React.useState(0);
  const [duration, setDuration] = React.useState(3000);
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setImageUrl(editing?.imageUrl ?? "");
      setTitle(editing?.title ?? "");
      setSubtitle(editing?.subtitle ?? "");
      setOrder(editing?.order ?? 0);
      setDuration(editing?.duration ?? 3000);
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  function submit() {
    if (!imageUrl.trim()) {
      toast.error("इमेज URL आवश्यक है");
      return;
    }
    onSave({
      imageUrl: imageUrl.trim(),
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      order: Number(order),
      duration: Number(duration),
      active,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "स्लाइड संपादित करें" : "नई स्लाइड जोड़ें"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="इमेज URL" required>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/splash.jpg"
            />
          </Field>
          {imageUrl && (
            <div className="overflow-hidden rounded-md border bg-muted/30">
              { }
              <img
                src={imageUrl}
                alt="preview"
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <Field label="शीर्षक">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="स्वागत है"
            />
          </Field>
          <Field label="उपशीर्षक">
            <Textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="ऐप का संक्षिप्त विवरण"
              rows={2}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="क्रम">
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </Field>
            <Field label="अवधि (मिलीसेकंड)">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                step={500}
              />
            </Field>
          </div>
          <Field label="सक्रिय">
            <div className="flex h-10 items-center">
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            रद्द करें
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            सेव करें
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

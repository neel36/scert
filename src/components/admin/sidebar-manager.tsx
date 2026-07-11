"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminRequest } from "@/lib/api";
import { getIcon } from "@/lib/icons";
import { toast } from "sonner";
import {
  PanelLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  RowSkeleton,
  Field,
  IconPicker,
} from "./_shared";
import type { SidebarItem } from "@/lib/types";

export function SidebarManager() {
  const [items, setItems] = React.useState<SidebarItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<SidebarItem | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<SidebarItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ items: SidebarItem[] }>(
        "/api/admin/sidebar"
      );
      setItems(r.items);
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
  function openEdit(it: SidebarItem) {
    setEditing(it);
    setOpen(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/sidebar/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/sidebar", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("आइटम जोड़ा गया");
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
      await adminRequest(`/api/admin/sidebar/${del.id}`, {
        method: "DELETE",
      });
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

  async function toggleActive(it: SidebarItem, active: boolean) {
    try {
      await adminRequest(`/api/admin/sidebar/${it.id}`, {
        method: "PUT",
        body: JSON.stringify({ active }),
      });
      await load();
    } catch (e: unknown) {
      toast.error(
        "अपडेट विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="साइडबार मेन्यू"
        description="ऐप के साइडबार में दिखने वाले मेन्यू आइटम प्रबंधित करें"
        icon={PanelLeft}
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
              नया आइटम
            </Button>
          </>
        }
      />

      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          आइटम क्रमानुसार (order फ़ील्ड) दिखाए जाते हैं। छोटा क्रम पहले दिखेगा।
          linkType "screen" के लिए linkValue में स्क्रीन का नाम (जैसे home,
          library) दें; "external" के लिए पूरा URL दें।
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <RowSkeleton rows={4} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={PanelLeft}
                title="कोई साइडबार आइटम नहीं"
                description="नया आइटम जोड़ें"
                action={
                  <Button size="sm" onClick={openAdd}>
                    <Plus className="mr-1 h-4 w-4" /> नया आइटम
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>आइकन</TableHead>
                    <TableHead>लेबल</TableHead>
                    <TableHead>प्रकार</TableHead>
                    <TableHead>लिंक</TableHead>
                    <TableHead className="text-center">क्रम</TableHead>
                    <TableHead className="text-center">सक्रिय</TableHead>
                    <TableHead className="text-right">क्रियाएँ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it, i) => {
                    const Icon = getIcon(it.icon);
                    return (
                      <TableRow key={it.id}>
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="grid h-8 w-8 place-items-center rounded-md bg-muted">
                            <Icon className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{it.label}</TableCell>
                        <TableCell>
                          {it.linkType === "external" ? (
                            <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-50">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              External
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Screen</Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">
                          {it.linkValue}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {it.order}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={it.active}
                            onCheckedChange={(v) => toggleActive(it, v)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(it)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDel(it)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SidebarDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="साइडबार आइटम हटाएँ?"
        description={`"${del?.label}" हटाया जाएगा।`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

const SCREEN_OPTIONS = [
  "home",
  "library",
  "bookmarks",
  "downloads",
  "settings",
  "exit",
];

function SidebarDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: SidebarItem | null;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [label, setLabel] = React.useState("");
  const [icon, setIcon] = React.useState("Menu");
  const [linkType, setLinkType] = React.useState<"screen" | "external">(
    "screen"
  );
  const [linkValue, setLinkValue] = React.useState("home");
  const [order, setOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setLabel(editing?.label ?? "");
      setIcon(editing?.icon ?? "Menu");
      setLinkType(editing?.linkType ?? "screen");
      setLinkValue(editing?.linkValue ?? "home");
      setOrder(editing?.order ?? 0);
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  function submit() {
    if (!label.trim()) {
      toast.error("लेबल आवश्यक है");
      return;
    }
    if (!linkValue.trim()) {
      toast.error("लिंक मान आवश्यक है");
      return;
    }
    onSave({
      label: label.trim(),
      icon,
      linkType,
      linkValue: linkValue.trim(),
      order: Number(order),
      active,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "साइडबार आइटम संपादित करें" : "नया साइडबार आइटम"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="लेबल" required>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="होम"
            />
          </Field>
          <Field label="आइकन (lucide)">
            <IconPicker value={icon} onChange={setIcon} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="लिंक प्रकार" required>
              <Select
                value={linkType}
                onValueChange={(v) => {
                  setLinkType(v as "screen" | "external");
                  if (v === "screen") setLinkValue("home");
                  else setLinkValue("https://");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Screen</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="क्रम">
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </Field>
          </div>
          <Field
            label="लिंक मान"
            required
            hint={
              linkType === "screen"
                ? "स्क्रीन का नाम: home, library, bookmarks, downloads, settings, exit"
                : "पूरा URL जैसे https://example.com"
            }
          >
            {linkType === "screen" ? (
              <Select value={linkValue} onValueChange={setLinkValue}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCREEN_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder="https://example.com"
              />
            )}
          </Field>
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

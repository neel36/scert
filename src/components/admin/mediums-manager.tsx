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
import { adminRequest } from "@/lib/api";
import { toast } from "sonner";
import { Library, Plus, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
import {
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  RowSkeleton,
  Field,
  EmojiInput,
  ColorField,
} from "./_shared";
import type { Medium } from "@/lib/types";

interface MediumRow extends Medium {
  _count?: { classes: number };
}

export function MediumsManager() {
  const [items, setItems] = React.useState<MediumRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<MediumRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<MediumRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await adminRequest<{ mediums: MediumRow[] }>(
        "/api/admin/mediums"
      );
      setItems(r.mediums);
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
  function openEdit(m: MediumRow) {
    setEditing(m);
    setOpen(true);
  }

  async function handleSave(data: Partial<Medium>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/mediums/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/mediums", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("माध्यम जोड़ा गया");
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
      await adminRequest(`/api/admin/mediums/${del.id}`, { method: "DELETE" });
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
        title="माध्यम प्रबंधन"
        description="सभी माध्यम (जैसे Hindi, English) को जोड़ें, संपादित करें या हटाएँ"
        icon={Library}
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
              नया माध्यम
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <RowSkeleton rows={3} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Library}
                title="कोई माध्यम नहीं"
                description="नया माध्यम जोड़कर शुरू करें"
                action={
                  <Button size="sm" onClick={openAdd}>
                    <Plus className="mr-1 h-4 w-4" /> नया माध्यम
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
                    <TableHead>नाम</TableHead>
                    <TableHead>कोड</TableHead>
                    <TableHead>रंग</TableHead>
                    <TableHead className="text-center">कक्षाएँ</TableHead>
                    <TableHead className="text-center">क्रम</TableHead>
                    <TableHead className="text-center">सक्रिय</TableHead>
                    <TableHead className="text-right">क्रियाएँ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-xl">{m.icon || "—"}</span>
                      </TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {m.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {m.color ? (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-4 w-4 rounded border"
                              style={{ background: m.color }}
                            />
                            <span className="text-xs font-mono">{m.color}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {m._count?.classes ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {m.order}
                      </TableCell>
                      <TableCell className="text-center">
                        {m.active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            सक्रिय
                          </Badge>
                        ) : (
                          <Badge variant="outline">निष्क्रिय</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(m)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDel(m)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MediumDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="माध्यम हटाएँ?"
        description={`"${del?.name}" हटाने से इसकी सभी कक्षाएँ, विषय और बुक्स भी हट जाएँगी।`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function MediumDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: MediumRow | null;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [color, setColor] = React.useState("#10b981");
  const [order, setOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setCode(editing?.code ?? "");
      setIcon(editing?.icon ?? "");
      setColor(editing?.color ?? "#10b981");
      setOrder(editing?.order ?? 0);
      setActive(editing?.active ?? true);
    }
  }, [open, editing]);

  function submit() {
    if (!name.trim() || !code.trim()) {
      toast.error("नाम और कोड आवश्यक हैं");
      return;
    }
    onSave({
      name: name.trim(),
      code: code.trim(),
      icon,
      color,
      order: Number(order),
      active,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "माध्यम संपादित करें" : "नया माध्यम जोड़ें"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="नाम" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hindi"
            />
          </Field>
          <Field label="कोड" required hint="यूनिक कोड (जैसे hi, en)">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="hi"
            />
          </Field>
          <Field label="आइकन (इमोजी)">
            <EmojiInput value={icon} onChange={setIcon} />
          </Field>
          <Field label="रंग">
            <ColorField value={color} onChange={setColor} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="क्रम">
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </Field>
            <Field label="सक्रिय">
              <div className="flex h-10 items-center">
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </Field>
          </div>
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

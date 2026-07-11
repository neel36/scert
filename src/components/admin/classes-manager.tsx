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
import { toast } from "sonner";
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  RowSkeleton,
  Field,
  EmojiInput,
} from "./_shared";
import type { ClassLevel, Medium } from "@/lib/types";

interface ClassRow extends ClassLevel {
  _count?: { subjects: number };
  medium?: { name: string };
}

export function ClassesManager() {
  const [items, setItems] = React.useState<ClassRow[]>([]);
  const [mediums, setMediums] = React.useState<Medium[]>([]);
  const [mediumId, setMediumId] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<ClassRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<ClassRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    adminRequest<{ mediums: Medium[] }>("/api/admin/mediums").then((r) =>
      setMediums(r.mediums)
    ).catch(() => {});
  }, []);

  async function load(mid: string) {
    setLoading(true);
    try {
      const url =
        mid === "all"
          ? "/api/admin/classes"
          : `/api/admin/classes?mediumId=${mid}`;
      const r = await adminRequest<{ classes: ClassRow[] }>(url);
      setItems(r.classes);
    } catch (e: unknown) {
      toast.error(
        "लोड विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(mediumId);
  }, [mediumId]);

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c: ClassRow) {
    setEditing(c);
    setOpen(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/classes/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/classes", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("कक्षा जोड़ी गई");
      }
      setOpen(false);
      await load(mediumId);
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
      await adminRequest(`/api/admin/classes/${del.id}`, {
        method: "DELETE",
      });
      toast.success("हटाया गया");
      setDel(null);
      await load(mediumId);
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
        title="कक्षा प्रबंधन"
        description="सभी कक्षाएँ (Class 1, 2, …) प्रबंधित करें"
        icon={GraduationCap}
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(mediumId)}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              रिफ्रेश
            </Button>
            <Button size="sm" onClick={openAdd} disabled={mediums.length === 0}>
              <Plus className="mr-1 h-4 w-4" />
              नई कक्षा
            </Button>
          </>
        }
      />

      {mediums.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          पहले कोई माध्यम जोड़ें, फिर कक्षाएँ जोड़ सकते हैं।
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">माध्यम फ़िल्टर:</span>
          <Select value={mediumId} onValueChange={setMediumId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी माध्यम</SelectItem>
              {mediums.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.icon ? `${m.icon} ` : ""}
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <RowSkeleton rows={4} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={GraduationCap}
                title="कोई कक्षा नहीं"
                description={
                  mediumId === "all"
                    ? "किसी माध्यम को फ़िल्टर करें या नई कक्षा जोड़ें"
                    : "इस माध्यम में कोई कक्षा नहीं है"
                }
                action={
                  <Button size="sm" onClick={openAdd}>
                    <Plus className="mr-1 h-4 w-4" /> नई कक्षा
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
                    <TableHead>माध्यम</TableHead>
                    <TableHead className="text-center">विषय</TableHead>
                    <TableHead className="text-center">क्रम</TableHead>
                    <TableHead className="text-center">सक्रिय</TableHead>
                    <TableHead className="text-right">क्रियाएँ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c, i) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-xl">{c.icon || "—"}</span>
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {c.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.medium?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {c._count?.subjects ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {c.order}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.active ? (
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
                            onClick={() => openEdit(c)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDel(c)}
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

      <ClassDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        mediums={mediums}
        defaultMediumId={mediumId !== "all" ? mediumId : mediums[0]?.id ?? ""}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="कक्षा हटाएँ?"
        description={`"${del?.name}" हटाने से इसके सभी विषय और बुक्स भी हट जाएँगे।`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function ClassDialog({
  open,
  onOpenChange,
  editing,
  mediums,
  defaultMediumId,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: ClassRow | null;
  mediums: Medium[];
  defaultMediumId: string;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [order, setOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);
  const [mediumId, setMediumId] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setCode(editing?.code ?? "");
      setIcon(editing?.icon ?? "");
      setOrder(editing?.order ?? 0);
      setActive(editing?.active ?? true);
      setMediumId(editing?.mediumId ?? defaultMediumId);
    }
  }, [open, editing, defaultMediumId]);

  function submit() {
    if (!name.trim() || !code.trim()) {
      toast.error("नाम और कोड आवश्यक हैं");
      return;
    }
    if (!mediumId) {
      toast.error("माध्यम चुनें");
      return;
    }
    onSave({
      name: name.trim(),
      code: code.trim(),
      icon,
      order: Number(order),
      active,
      mediumId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "कक्षा संपादित करें" : "नई कक्षा जोड़ें"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="माध्यम" required>
            <Select value={mediumId} onValueChange={setMediumId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="माध्यम चुनें" />
              </SelectTrigger>
              <SelectContent>
                {mediums.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.icon ? `${m.icon} ` : ""}
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="नाम" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Class 10"
            />
          </Field>
          <Field label="कोड" required>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="c10"
            />
          </Field>
          <Field label="आइकन (इमोजी)">
            <EmojiInput value={icon} onChange={setIcon} />
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

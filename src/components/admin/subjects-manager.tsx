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
  BookMarked,
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
import type { ClassLevel, Medium, Subject } from "@/lib/types";

interface SubjectRow extends Subject {
  _count?: { books: number };
  class?: { name: string; medium?: { name: string } };
}

export function SubjectsManager() {
  const [items, setItems] = React.useState<SubjectRow[]>([]);
  const [mediums, setMediums] = React.useState<Medium[]>([]);
  const [classes, setClasses] = React.useState<ClassLevel[]>([]);
  const [mediumId, setMediumId] = React.useState<string>("all");
  const [classId, setClassId] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<SubjectRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<SubjectRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    adminRequest<{ mediums: Medium[] }>("/api/admin/mediums").then((r) =>
      setMediums(r.mediums)
    ).catch(() => {});
  }, []);

  // Load classes when mediumId changes
  React.useEffect(() => {
    if (mediumId === "all") {
      setClasses([]);
      return;
    }
    adminRequest<{ classes: ClassLevel[] }>(
      `/api/admin/classes?mediumId=${mediumId}`
    )
      .then((r) => setClasses(r.classes))
      .catch(() => setClasses([]));
  }, [mediumId]);

  // Reset classId when medium changes
  React.useEffect(() => {
    setClassId("all");
  }, [mediumId]);

  async function load(cid: string) {
    setLoading(true);
    try {
      const url =
        cid === "all" ? "/api/admin/subjects" : `/api/admin/subjects?classId=${cid}`;
      const r = await adminRequest<{ subjects: SubjectRow[] }>(url);
      setItems(r.subjects);
    } catch (e: unknown) {
      toast.error(
        "लोड विफल: " + (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(classId);
  }, [classId]);

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(s: SubjectRow) {
    setEditing(s);
    setOpen(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/subjects/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/subjects", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("विषय जोड़ा गया");
      }
      setOpen(false);
      await load(classId);
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
      await adminRequest(`/api/admin/subjects/${del.id}`, {
        method: "DELETE",
      });
      toast.success("हटाया गया");
      setDel(null);
      await load(classId);
    } catch (e: unknown) {
      toast.error(
        "हटाने में त्रुटि: " +
          (e instanceof Error ? e.message : "अज्ञात त्रुटि")
      );
    } finally {
      setDeleting(false);
    }
  }

  const canAdd = mediums.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="विषय प्रबंधन"
        description="सभी विषय (Maths, Science, …) प्रबंधित करें"
        icon={BookMarked}
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(classId)}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              रिफ्रेश
            </Button>
            <Button size="sm" onClick={openAdd} disabled={!canAdd}>
              <Plus className="mr-1 h-4 w-4" />
              नया विषय
            </Button>
          </>
        }
      />

      {mediums.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          पहले कोई माध्यम और कक्षा जोड़ें, फिर विषय जोड़ सकते हैं।
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">फ़िल्टर:</span>
          <Select value={mediumId} onValueChange={setMediumId}>
            <SelectTrigger className="w-40">
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
          <Select
            value={classId}
            onValueChange={setClassId}
            disabled={mediumId === "all"}
          >
            <SelectTrigger className="w-44">
              <SelectValue
                placeholder={
                  mediumId === "all" ? "पहले माध्यम चुनें" : "सभी कक्षाएँ"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी कक्षाएँ</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
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
                icon={BookMarked}
                title="कोई विषय नहीं"
                description={
                  classId === "all"
                    ? "विषय देखने के लिए माध्यम और कक्षा चुनें"
                    : "इस कक्षा में कोई विषय नहीं है"
                }
                action={
                  canAdd ? (
                    <Button size="sm" onClick={openAdd}>
                      <Plus className="mr-1 h-4 w-4" /> नया विषय
                    </Button>
                  ) : undefined
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
                    <TableHead>माध्यम</TableHead>
                    <TableHead>कक्षा</TableHead>
                    <TableHead className="text-center">बुक्स</TableHead>
                    <TableHead className="text-center">क्रम</TableHead>
                    <TableHead className="text-center">सक्रिय</TableHead>
                    <TableHead className="text-right">क्रियाएँ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-xl">{s.icon || "—"}</span>
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.class?.medium?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.class?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {s._count?.books ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {s.order}
                      </TableCell>
                      <TableCell className="text-center">
                        {s.active ? (
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
                            onClick={() => openEdit(s)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDel(s)}
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

      <SubjectDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        mediums={mediums}
        defaultMediumId={mediumId !== "all" ? mediumId : ""}
        defaultClassId={classId !== "all" ? classId : ""}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="विषय हटाएँ?"
        description={`"${del?.name}" हटाने से इसकी सभी बुक्स भी हट जाएँगी।`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function SubjectDialog({
  open,
  onOpenChange,
  editing,
  mediums,
  defaultMediumId,
  defaultClassId,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: SubjectRow | null;
  mediums: Medium[];
  defaultMediumId: string;
  defaultClassId: string;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [order, setOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);

  const [dMediumId, setDMediumId] = React.useState("");
  const [dClassId, setDClassId] = React.useState("");
  const [dClasses, setDClasses] = React.useState<ClassLevel[]>([]);
  const [cascading, setCascading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setIcon(editing?.icon ?? "");
      setOrder(editing?.order ?? 0);
      setActive(editing?.active ?? true);

      if (editing) {
        setDMediumId(editing.class?.mediumId ?? "");
        setDClassId(editing.classId ?? "");
      } else {
        setDMediumId(defaultMediumId);
        setDClassId(defaultClassId);
      }
    }
  }, [open, editing, defaultMediumId, defaultClassId]);

  // When dMediumId changes -> load classes
  React.useEffect(() => {
    if (!open) return;
    if (!dMediumId) {
      setDClasses([]);
      return;
    }
    setCascading(true);
    adminRequest<{ classes: ClassLevel[] }>(
      `/api/admin/classes?mediumId=${dMediumId}`
    )
      .then((r) => setDClasses(r.classes))
      .catch(() => setDClasses([]))
      .finally(() => setCascading(false));
  }, [dMediumId, open]);

  function submit() {
    if (!name.trim()) {
      toast.error("नाम आवश्यक है");
      return;
    }
    if (!dClassId) {
      toast.error("कक्षा चुनें");
      return;
    }
    onSave({
      name: name.trim(),
      icon,
      order: Number(order),
      active,
      classId: dClassId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "विषय संपादित करें" : "नया विषय जोड़ें"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="माध्यम" required>
            <Select
              value={dMediumId || "__none__"}
              onValueChange={(v) => {
                if (v !== "__none__") {
                  setDMediumId(v);
                  setDClassId("");
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="माध्यम चुनें" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" disabled>
                  चुनें…
                </SelectItem>
                {mediums.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.icon ? `${m.icon} ` : ""}
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="कक्षा" required>
            <Select
              value={dClassId || "__none__"}
              onValueChange={(v) => v !== "__none__" && setDClassId(v)}
              disabled={!dMediumId || cascading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !dMediumId ? "पहले माध्यम चुनें" : "कक्षा चुनें"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" disabled>
                  चुनें…
                </SelectItem>
                {dClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="नाम" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mathematics"
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
            disabled={saving || cascading}
          >
            रद्द करें
          </Button>
          <Button onClick={submit} disabled={saving || cascading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            सेव करें
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

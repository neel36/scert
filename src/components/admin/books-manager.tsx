"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { adminRequest, BOOK_TYPES } from "@/lib/api";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react";
import {
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  RowSkeleton,
  Field,
  EmojiInput,
  formatNumber,
  truncate,
} from "./_shared";
import type { Book, BookType, ClassLevel, Medium, Subject } from "@/lib/types";

interface BookRow extends Book {
  subject: {
    name: string;
    class: { name: string; medium: { name: string } };
  };
}

export function BooksManager() {
  const [items, setItems] = React.useState<BookRow[]>([]);
  const [mediums, setMediums] = React.useState<Medium[]>([]);
  const [classes, setClasses] = React.useState<ClassLevel[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [mediumId, setMediumId] = React.useState<string>("all");
  const [classId, setClassId] = React.useState<string>("all");
  const [subjectId, setSubjectId] = React.useState<string>("all");
  const [type, setType] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<BookRow | null>(null);
  const [open, setOpen] = React.useState(false);
  const [del, setDel] = React.useState<BookRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    adminRequest<{ mediums: Medium[] }>("/api/admin/mediums").then((r) =>
      setMediums(r.mediums)
    ).catch(() => {});
  }, []);

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

  React.useEffect(() => {
    setClassId("all");
    setSubjects([]);
  }, [mediumId]);

  React.useEffect(() => {
    if (classId === "all") {
      setSubjects([]);
      return;
    }
    adminRequest<{ subjects: Subject[] }>(
      `/api/admin/subjects?classId=${classId}`
    )
      .then((r) => setSubjects(r.subjects))
      .catch(() => setSubjects([]));
  }, [classId]);

  React.useEffect(() => {
    setSubjectId("all");
  }, [classId]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectId !== "all") params.set("subjectId", subjectId);
      if (type !== "all") params.set("type", type);
      const q = params.toString();
      const url = q ? `/api/admin/books?${q}` : "/api/admin/books";
      const r = await adminRequest<{ books: BookRow[] }>(url);
      setItems(r.books);
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
     
  }, [subjectId, type]);

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(b: BookRow) {
    setEditing(b);
    setOpen(true);
  }

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      if (editing) {
        await adminRequest(`/api/admin/books/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("अपडेट हो गया");
      } else {
        await adminRequest("/api/admin/books", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("बुक जोड़ी गई");
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
      await adminRequest(`/api/admin/books/${del.id}`, { method: "DELETE" });
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

  const canAdd = mediums.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="बुक्स / नोट्स प्रबंधन"
        description="सभी बुक्स, नोट्स और अन्य सामग्री प्रबंधित करें"
        icon={BookOpen}
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              रिफ्रेश
            </Button>
            <Button size="sm" onClick={openAdd} disabled={!canAdd}>
              <Plus className="mr-1 h-4 w-4" />
              नई बुक
            </Button>
          </>
        }
      />

      {mediums.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          पहले माध्यम, कक्षा और विषय जोड़ें, फिर बुक्स जोड़ सकते हैं।
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  माध्यम
                </label>
                <Select value={mediumId} onValueChange={setMediumId}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी</SelectItem>
                    {mediums.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.icon ? `${m.icon} ` : ""}
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  कक्षा
                </label>
                <Select
                  value={classId}
                  onValueChange={setClassId}
                  disabled={mediumId === "all"}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="सभी" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  विषय
                </label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={classId === "all"}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="सभी" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.icon ? `${s.icon} ` : ""}
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  प्रकार
                </label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी</SelectItem>
                    {BOOK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {mediums.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                नई बुक जोड़ने के लिए पहले माध्यम, कक्षा और विषय जोड़ें।
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <RowSkeleton rows={5} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={BookOpen}
                title="कोई बुक नहीं"
                description={
                  subjectId === "all"
                    ? "बुक्स देखने के लिए विषय चुनें या नई बुक जोड़ें"
                    : "इस विषय में कोई बुक नहीं है"
                }
                action={
                  canAdd ? (
                    <Button size="sm" onClick={openAdd}>
                      <Plus className="mr-1 h-4 w-4" /> नई बुक
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
                    <TableHead>शीर्षक</TableHead>
                    <TableHead>प्रकार</TableHead>
                    <TableHead>विषय / कक्षा</TableHead>
                    <TableHead className="text-center">डाउनलोड</TableHead>
                    <TableHead className="text-center">क्रम</TableHead>
                    <TableHead className="text-center">सक्रिय</TableHead>
                    <TableHead className="text-right">क्रियाएँ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((b, i) => {
                    const bt = BOOK_TYPES.find((t) => t.value === b.type);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{b.icon || bt?.icon || "📘"}</span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {b.title}
                              </p>
                              {b.author && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {b.author}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              b.type === "book"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : b.type === "notes"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-muted bg-muted text-muted-foreground"
                            }
                          >
                            {bt?.icon} {bt?.label ?? b.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{b.subject.name}</div>
                          <div>
                            {b.subject.class.medium.name} ›{" "}
                            {b.subject.class.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Download className="h-3 w-3 text-muted-foreground" />
                            {formatNumber(b.downloads)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {b.order}
                        </TableCell>
                        <TableCell className="text-center">
                          {b.active ? (
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
                              onClick={() => openEdit(b)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDel(b)}
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

      <BookDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        mediums={mediums}
        defaultMediumId={mediumId !== "all" ? mediumId : ""}
        defaultClassId={classId !== "all" ? classId : ""}
        defaultSubjectId={subjectId !== "all" ? subjectId : ""}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title="बुक हटाएँ?"
        description={`"${truncate(del?.title, 50)}" हटाई जाएगी।`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Book dialog with internal cascade                                   */
/* ------------------------------------------------------------------ */
function BookDialog({
  open,
  onOpenChange,
  editing,
  mediums,
  defaultMediumId,
  defaultClassId,
  defaultSubjectId,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: BookRow | null;
  mediums: Medium[];
  defaultMediumId: string;
  defaultClassId: string;
  defaultSubjectId: string;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  // Book fields
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [bookType, setBookType] = React.useState<BookType>("book");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [pdfUrl, setPdfUrl] = React.useState("");
  const [fileSize, setFileSize] = React.useState("");
  const [pages, setPages] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [order, setOrder] = React.useState(0);
  const [active, setActive] = React.useState(true);

  // Cascade for subject selection inside dialog
  const [dMediumId, setDMediumId] = React.useState("");
  const [dClassId, setDClassId] = React.useState("");
  const [dSubjectId, setDSubjectId] = React.useState("");
  const [dClasses, setDClasses] = React.useState<ClassLevel[]>([]);
  const [dSubjects, setDSubjects] = React.useState<Subject[]>([]);
  const [cascading, setCascading] = React.useState(false);

  // Reset / prefill on open
  React.useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setDescription(editing?.description ?? "");
    setBookType(editing?.type ?? "book");
    setCoverUrl(editing?.coverUrl ?? "");
    setPdfUrl(editing?.pdfUrl ?? "");
    setFileSize(editing?.fileSize?.toString() ?? "");
    setPages(editing?.pages?.toString() ?? "");
    setAuthor(editing?.author ?? "");
    setIcon(editing?.icon ?? "");
    setOrder(editing?.order ?? 0);
    setActive(editing?.active ?? true);

    if (editing) {
      // editing.book has subject.class.medium (full rows via Prisma include)
      const mid =
        (editing.subject.class.medium as unknown as { id?: string }).id ?? "";
      const cid =
        (editing.subject.class as unknown as { id?: string }).id ?? "";
      const sid =
        (editing.subject as unknown as { id?: string }).id ??
        editing.subjectId;
      setDMediumId(mid);
      setDClassId(cid);
      setDSubjectId(sid);
    } else {
      // Add mode: pre-fill from current filter cascade (if any)
      setDMediumId(defaultMediumId);
      setDClassId(defaultClassId);
      setDSubjectId(defaultSubjectId);
    }
  }, [open, editing, defaultMediumId, defaultClassId, defaultSubjectId]);

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

  // When dClassId changes -> load subjects
  React.useEffect(() => {
    if (!open) return;
    if (!dClassId) {
      setDSubjects([]);
      return;
    }
    setCascading(true);
    adminRequest<{ subjects: Subject[] }>(
      `/api/admin/subjects?classId=${dClassId}`
    )
      .then((r) => setDSubjects(r.subjects))
      .catch(() => setDSubjects([]))
      .finally(() => setCascading(false));
  }, [dClassId, open]);

  function onMediumChange(v: string) {
    setDMediumId(v);
    setDClassId("");
    setDSubjectId("");
  }
  function onClassChange(v: string) {
    setDClassId(v);
    setDSubjectId("");
  }

  function submit() {
    if (!title.trim()) {
      toast.error("शीर्षक आवश्यक है");
      return;
    }
    if (!pdfUrl.trim()) {
      toast.error("PDF URL आवश्यक है");
      return;
    }
    if (!dSubjectId) {
      toast.error("विषय चुनें");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      type: bookType,
      coverUrl: coverUrl.trim() || null,
      pdfUrl: pdfUrl.trim(),
      fileSize: fileSize ? Number(fileSize) : null,
      pages: pages ? Number(pages) : null,
      author: author.trim() || null,
      icon: icon || null,
      order: Number(order),
      active,
      subjectId: dSubjectId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "बुक संपादित करें" : "नई बुक जोड़ें"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">मूल जानकारी</TabsTrigger>
            <TabsTrigger value="media">मीडिया</TabsTrigger>
            <TabsTrigger value="meta">वर्गीकरण</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 py-2">
            <Field label="शीर्षक" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="NCERT Mathematics Class 10"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="प्रकार" required>
                <Select
                  value={bookType}
                  onValueChange={(v) => setBookType(v as BookType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="आइकन (इमोजी)">
                <EmojiInput value={icon} onChange={setIcon} />
              </Field>
            </div>
            <Field label="लेखक">
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="लेखक का नाम"
              />
            </Field>
            <Field label="विवरण">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="बुक का संक्षिप्त विवरण…"
                rows={3}
              />
            </Field>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 py-2">
            <Field label="PDF URL" required hint="डाउनलोड के लिए PDF का लिंक">
              <Input
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://example.com/book.pdf"
              />
            </Field>
            <Field label="कवर URL" hint="बुक कवर इमेज का लिंक">
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              {coverUrl && (
                <div className="mt-2 overflow-hidden rounded-md border bg-muted/30 p-2">
                  { }
                  <img
                    src={coverUrl}
                    alt="cover"
                    className="h-32 rounded-md object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="पृष्ठ संख्या" hint="कुल पन्ने">
                <Input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="200"
                />
              </Field>
              <Field label="फ़ाइल साइज़ (KB)" hint="KB में">
                <Input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="5000"
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4 py-2">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <FileText className="mr-1 inline h-3 w-3" />
              वर्गीकरण: माध्यम › कक्षा › विषय चुनें। यह बुक को सही स्थान पर
              दिखाता है।
            </div>
            <Field label="माध्यम" required>
              <Select
                value={dMediumId || "__none__"}
                onValueChange={(v) =>
                  v !== "__none__" && onMediumChange(v)
                }
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
                onValueChange={(v) => v !== "__none__" && onClassChange(v)}
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
            <Field label="विषय" required>
              <Select
                value={dSubjectId || "__none__"}
                onValueChange={(v) =>
                  v !== "__none__" && setDSubjectId(v)
                }
                disabled={!dClassId || cascading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !dClassId ? "पहले कक्षा चुनें" : "विषय चुनें"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" disabled>
                    चुनें…
                  </SelectItem>
                  {dSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.icon ? `${s.icon} ` : ""}
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
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

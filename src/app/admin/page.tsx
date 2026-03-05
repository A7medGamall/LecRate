"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Batch, Module, Lecture, Source, Rating } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Shield,
    Lock,
    Plus,
    Trash2,
    Pencil,
    Loader2,
    Layers,
    BookOpen,
    GraduationCap,
    FileText,
    MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AdminTab = "batches" | "modules" | "lectures" | "sources" | "ratings";

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>("batches");

    // Check session
    useEffect(() => {
        const stored = sessionStorage.getItem("admin_auth");
        if (stored === "true") setAuthenticated(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                sessionStorage.setItem("admin_auth", "true");
                setAuthenticated(true);
                toast.success("تم تسجيل الدخول بنجاح");
            } else {
                toast.error("كلمة المرور غير صحيحة");
            }
        } catch {
            toast.error("حدث خطأ");
        } finally {
            setAuthLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <Card className="w-full max-w-md animate-fade-in">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">لوحة الإدارة</CardTitle>
                        <p className="text-sm text-muted-foreground">أدخل كلمة المرور للوصول</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="password" className="mb-2 block">كلمة المرور</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    dir="ltr"
                                />
                            </div>
                            <Button type="submit" className="w-full gap-2" disabled={authLoading}>
                                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {authLoading ? "جاري التحقق..." : "دخول"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const tabs: { key: AdminTab; label: string; icon: typeof Layers }[] = [
        { key: "batches", label: "الدفعات", icon: Layers },
        { key: "modules", label: "المواد", icon: BookOpen },
        { key: "lectures", label: "المحاضرات", icon: GraduationCap },
        { key: "sources", label: "المصادر", icon: FileText },
        { key: "ratings", label: "التقييمات", icon: MessageSquare },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black gradient-text mb-2">لوحة الإدارة</h1>
                <p className="text-muted-foreground">إدارة البيانات والمحتوى</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map((tab) => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab(tab.key)}
                        className={cn("gap-2", activeTab === tab.key && "shadow-lg shadow-primary/25")}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "batches" && <BatchesAdmin />}
            {activeTab === "modules" && <ModulesAdmin />}
            {activeTab === "lectures" && <LecturesAdmin />}
            {activeTab === "sources" && <SourcesAdmin />}
            {activeTab === "ratings" && <RatingsAdmin />}
        </div>
    );
}

// ==================== BATCHES ====================
function BatchesAdmin() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("batches").select("*").order("name");
        setBatches(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setAdding(true);
        const { error } = await supabase.from("batches").insert({ name: newName.trim() });
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تمت الإضافة"); setNewName(""); fetch_(); }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟ سيتم حذف كل البيانات المرتبطة.")) return;
        const { error } = await supabase.from("batches").delete().eq("id", id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم الحذف"); fetch_(); }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>الدفعات</CardTitle>
                <div className="flex gap-2">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم الدفعة" className="w-40" />
                    <Button onClick={handleAdd} disabled={adding} size="sm" className="gap-1">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        إضافة
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead className="w-20">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-medium">{b.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {batches.length === 0 && (
                                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">لا توجد دفعات</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== MODULES ====================
function ModulesAdmin() {
    const [modules, setModules] = useState<(Module & { batches: Batch })[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [adding, setAdding] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const [{ data: mods }, { data: bats }] = await Promise.all([
            supabase.from("modules").select("*, batches(*)").order("name"),
            supabase.from("batches").select("*").order("name"),
        ]);
        setModules(mods || []);
        setBatches(bats || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleAdd = async () => {
        if (!newName.trim() || !selectedBatchId) return;
        setAdding(true);
        const { error } = await supabase.from("modules").insert({ name: newName.trim(), batch_id: selectedBatchId });
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تمت الإضافة"); setNewName(""); fetch_(); }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        const { error } = await supabase.from("modules").delete().eq("id", id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم الحذف"); fetch_(); }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-3">المواد</CardTitle>
                <div className="flex gap-2 flex-wrap">
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="الدفعة" /></SelectTrigger>
                        <SelectContent>
                            {batches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم المادة" className="w-48" />
                    <Button onClick={handleAdd} disabled={adding} size="sm" className="gap-1">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        إضافة
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>المادة</TableHead>
                                <TableHead>الدفعة</TableHead>
                                <TableHead className="w-20">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium">{m.name}</TableCell>
                                    <TableCell>{m.batches?.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {modules.length === 0 && (
                                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">لا توجد مواد</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== LECTURES ====================
function LecturesAdmin() {
    const [lectures, setLectures] = useState<(Lecture & { modules: Module & { batches: Batch } })[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [newType, setNewType] = useState<"lecture" | "section">("lecture");
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [adding, setAdding] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const [{ data: lecs }, { data: mods }] = await Promise.all([
            supabase.from("lectures").select("*, modules(*, batches(*))").order("number"),
            supabase.from("modules").select("*").order("name"),
        ]);
        setLectures(lecs || []);
        setModules(mods || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleAdd = async () => {
        if (!newTitle.trim() || !selectedModuleId || !newNumber) return;
        setAdding(true);
        const { error } = await supabase.from("lectures").insert({
            title: newTitle.trim(),
            module_id: selectedModuleId,
            type: newType,
            number: parseInt(newNumber),
        });
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تمت الإضافة"); setNewTitle(""); setNewNumber(""); fetch_(); }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        const { error } = await supabase.from("lectures").delete().eq("id", id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم الحذف"); fetch_(); }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="mb-3">المحاضرات</CardTitle>
                <div className="flex gap-2 flex-wrap">
                    <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="المادة" /></SelectTrigger>
                        <SelectContent>
                            {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={newType} onValueChange={(v) => setNewType(v as "lecture" | "section")}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lecture">محاضرة</SelectItem>
                            <SelectItem value="section">سكشن</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} type="number" placeholder="الرقم" className="w-20" />
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="العنوان" className="w-48" />
                    <Button onClick={handleAdd} disabled={adding} size="sm" className="gap-1">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        إضافة
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>العنوان</TableHead>
                                <TableHead>النوع</TableHead>
                                <TableHead>الرقم</TableHead>
                                <TableHead>المادة</TableHead>
                                <TableHead className="w-20">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lectures.map((l) => (
                                <TableRow key={l.id}>
                                    <TableCell className="font-medium">{l.title}</TableCell>
                                    <TableCell>{l.type === "lecture" ? "محاضرة" : "سكشن"}</TableCell>
                                    <TableCell>{l.number}</TableCell>
                                    <TableCell>{l.modules?.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)} className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lectures.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">لا توجد محاضرات</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== SOURCES ====================
function SourcesAdmin() {
    const [sources, setSources] = useState<(Source & { lectures: Lecture })[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editDuration, setEditDuration] = useState("");
    const [saving, setSaving] = useState(false);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("sources").select("*, lectures(*)").order("created_at", { ascending: false });
        setSources(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleEdit = (source: Source) => {
        setEditingSource(source);
        setEditTitle(source.title);
        setEditUrl(source.url || "");
        setEditDuration(source.duration_minutes.toString());
    };

    const handleSave = async () => {
        if (!editingSource) return;
        setSaving(true);
        const { error } = await supabase.from("sources").update({
            title: editTitle.trim(),
            url: editUrl.trim() || null,
            duration_minutes: parseInt(editDuration),
        }).eq("id", editingSource.id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم التحديث"); setEditingSource(null); fetch_(); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف المصدر وجميع تقييماته؟")) return;
        const { error } = await supabase.from("sources").delete().eq("id", id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم الحذف"); fetch_(); }
    };

    return (
        <Card>
            <CardHeader><CardTitle>المصادر</CardTitle></CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p> : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>العنوان</TableHead>
                                    <TableHead>المحاضرة</TableHead>
                                    <TableHead>المدة</TableHead>
                                    <TableHead className="w-28">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sources.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.title}</TableCell>
                                        <TableCell>{s.lectures?.title}</TableCell>
                                        <TableCell>{s.duration_minutes} د</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Dialog open={editingSource?.id === s.id} onOpenChange={(open) => { if (!open) setEditingSource(null); }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent dir="rtl">
                                                        <DialogHeader>
                                                            <DialogTitle>تعديل المصدر</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <Label className="mb-2 block">العنوان</Label>
                                                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <Label className="mb-2 block">الرابط</Label>
                                                                <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} dir="ltr" />
                                                            </div>
                                                            <div>
                                                                <Label className="mb-2 block">المدة (دقائق)</Label>
                                                                <Input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
                                                            </div>
                                                            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sources.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">لا توجد مصادر</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== RATINGS ====================
function RatingsAdmin() {
    const [ratings, setRatings] = useState<(Rating & { sources: Source })[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from("ratings").select("*, sources(*)").order("created_at", { ascending: false });
        setRatings(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch_(); }, [fetch_]);

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
        const { error } = await supabase.from("ratings").delete().eq("id", id);
        if (error) toast.error("خطأ: " + error.message);
        else { toast.success("تم الحذف"); fetch_(); }
    };

    return (
        <Card>
            <CardHeader><CardTitle>التقييمات</CardTitle></CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-4 text-muted-foreground">جاري التحميل...</p> : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المصدر</TableHead>
                                    <TableHead>التقييم</TableHead>
                                    <TableHead>التعليق</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead className="w-20">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ratings.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.sources?.title}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-primary">{r.score}/10</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{r.comment || "—"}</TableCell>
                                        <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString("ar-EG")}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {ratings.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">لا توجد تقييمات</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

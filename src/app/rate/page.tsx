"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lecture, Source, Rating } from "@/lib/types";
import { StepSelector } from "@/components/StepSelector";
import { RatingForm } from "@/components/RatingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Star,
    Plus,
    ArrowRight,
    Clock,
    Users,
    ExternalLink,
    Loader2,
    Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RatePage() {
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [sources, setSources] = useState<(Source & { avg: number; count: number })[]>([]);
    const [loadingSources, setLoadingSources] = useState(false);
    const [showAddSource, setShowAddSource] = useState(false);
    const [ratingSourceId, setRatingSourceId] = useState<string | null>(null);

    // New source form state
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newDuration, setNewDuration] = useState("");
    const [newScore, setNewScore] = useState(0);
    const [newHoveredScore, setNewHoveredScore] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submittingSource, setSubmittingSource] = useState(false);

    const fetchSources = async (lectureId: string) => {
        setLoadingSources(true);
        const { data: sourcesData } = await supabase
            .from("sources")
            .select("*, ratings(*)")
            .eq("lecture_id", lectureId)
            .order("created_at", { ascending: false });

        if (sourcesData) {
            const withStats = sourcesData.map((s: Source & { ratings: Rating[] }) => ({
                ...s,
                avg:
                    s.ratings.length > 0
                        ? s.ratings.reduce((sum: number, r: Rating) => sum + r.score, 0) / s.ratings.length
                        : 0,
                count: s.ratings.length,
            }));
            setSources(withStats);
        }
        setLoadingSources(false);
    };

    const handleLectureSelected = (lecture: Lecture) => {
        setSelectedLecture(lecture);
        fetchSources(lecture.id);
    };

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("يرجى إدخال عنوان المصدر");
            return;
        }
        if (!newDuration || parseInt(newDuration) <= 0) {
            toast.error("يرجى إدخال مدة صحيحة");
            return;
        }
        if (newScore === 0) {
            toast.error("يرجى اختيار تقييم");
            return;
        }

        setSubmittingSource(true);
        try {
            // Create source
            const { data: sourceData, error: sourceError } = await supabase
                .from("sources")
                .insert({
                    lecture_id: selectedLecture!.id,
                    title: newTitle.trim(),
                    url: newUrl.trim() || null,
                    duration_minutes: parseInt(newDuration),
                })
                .select()
                .single();

            if (sourceError) throw sourceError;

            // Create rating
            const { error: ratingError } = await supabase.from("ratings").insert({
                source_id: sourceData.id,
                score: newScore,
                comment: newComment.trim() || null,
            });

            if (ratingError) throw ratingError;

            toast.success("تم إضافة المصدر والتقييم بنجاح!");
            setNewTitle("");
            setNewUrl("");
            setNewDuration("");
            setNewScore(0);
            setNewComment("");
            setShowAddSource(false);
            fetchSources(selectedLecture!.id);
        } catch {
            toast.error("حدث خطأ أثناء إضافة المصدر");
        } finally {
            setSubmittingSource(false);
        }
    };

    const displayNewScore = newHoveredScore || newScore;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black gradient-text mb-2">قيّم محاضرة</h1>
                <p className="text-muted-foreground">
                    اختر المحاضرة ثم أضف تقييمك لمصادر الدراسة
                </p>
            </div>

            {/* Step Selector */}
            {!selectedLecture && (
                <Card>
                    <CardContent className="p-6">
                        <StepSelector onLectureSelected={handleLectureSelected} />
                    </CardContent>
                </Card>
            )}

            {/* Sources List */}
            {selectedLecture && (
                <div className="space-y-6 animate-fade-in">
                    {/* Selected Lecture Info */}
                    <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">المحاضرة المختارة</p>
                                <p className="font-bold text-lg">
                                    {selectedLecture.type === 'lecture' ? 'محاضرة' : 'سكشن'} {selectedLecture.number}: {selectedLecture.title}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedLecture(null);
                                    setSources([]);
                                    setShowAddSource(false);
                                    setRatingSourceId(null);
                                }}
                            >
                                <ArrowRight className="w-4 h-4 ml-1" />
                                تغيير
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Loading */}
                    {loadingSources && (
                        <div className="space-y-3">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                    )}

                    {/* Sources */}
                    {!loadingSources && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    المصادر المتاحة ({sources.length})
                                </h2>
                                <Button
                                    onClick={() => { setShowAddSource(!showAddSource); setRatingSourceId(null); }}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة مصدر جديد
                                </Button>
                            </div>

                            {/* Existing Sources */}
                            {sources.length === 0 && !showAddSource && (
                                <Card className="border-dashed">
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground mb-4">
                                            لا توجد مصادر لهذه المحاضرة بعد
                                        </p>
                                        <Button onClick={() => setShowAddSource(true)} className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            كن أول من يضيف مصدراً
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {sources.map((source) => (
                                <Card key={source.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-base">{source.title}</h3>
                                                {source.url && (
                                                    <a
                                                        href={source.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        فتح الرابط
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-bold">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {source.avg > 0 ? source.avg.toFixed(1) : "—"}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <Badge variant="secondary" className="gap-1">
                                                <Users className="w-3 h-3" />
                                                {source.count} تقييم
                                            </Badge>
                                            <Badge variant="secondary" className="gap-1">
                                                <Clock className="w-3 h-3" />
                                                {source.duration_minutes} دقيقة
                                            </Badge>
                                        </div>
                                        {ratingSourceId === source.id ? (
                                            <div className="mt-4 pt-4 border-t">
                                                <RatingForm
                                                    sourceId={source.id}
                                                    onRatingAdded={() => {
                                                        setRatingSourceId(null);
                                                        fetchSources(selectedLecture.id);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setRatingSourceId(source.id); setShowAddSource(false); }}
                                                className="gap-2 mt-1"
                                            >
                                                <Star className="w-4 h-4" />
                                                أضف تقييماً
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add New Source Form */}
                            {showAddSource && (
                                <Card className="border-primary/30 animate-fade-in">
                                    <CardHeader>
                                        <CardTitle className="text-lg">إضافة مصدر جديد</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleAddSource} className="space-y-4">
                                            <div>
                                                <Label htmlFor="title" className="mb-2 block font-semibold">
                                                    عنوان المصدر *
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={newTitle}
                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                    placeholder="مثال: شرح د. أحمد على يوتيوب"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="url" className="mb-2 block font-semibold">
                                                    رابط المصدر (اختياري)
                                                </Label>
                                                <div className="relative">
                                                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        id="url"
                                                        value={newUrl}
                                                        onChange={(e) => setNewUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="pr-10"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="duration" className="mb-2 block font-semibold">
                                                    المدة بالدقائق *
                                                </Label>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    min={1}
                                                    value={newDuration}
                                                    onChange={(e) => setNewDuration(e.target.value)}
                                                    placeholder="مثال: 45"
                                                    required
                                                />
                                            </div>

                                            <Separator />

                                            {/* Rating */}
                                            <div>
                                                <Label className="mb-3 block font-semibold">تقييمك *</Label>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                        <button
                                                            key={n}
                                                            type="button"
                                                            onClick={() => setNewScore(n)}
                                                            onMouseEnter={() => setNewHoveredScore(n)}
                                                            onMouseLeave={() => setNewHoveredScore(0)}
                                                            className="p-0.5 transition-transform hover:scale-125"
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    "w-6 h-6 transition-colors",
                                                                    n <= displayNewScore
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-muted-foreground/30"
                                                                )}
                                                            />
                                                        </button>
                                                    ))}
                                                    {displayNewScore > 0 && (
                                                        <span className="mr-2 text-lg font-bold text-primary">
                                                            {displayNewScore}/10
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="newComment" className="mb-2 block font-semibold">
                                                    تعليق (اختياري)
                                                </Label>
                                                <Textarea
                                                    id="newComment"
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="أكتب تعليقك هنا..."
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <Button type="submit" disabled={submittingSource} className="flex-1 gap-2">
                                                    {submittingSource ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                    {submittingSource ? "جاري الإضافة..." : "إضافة المصدر"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowAddSource(false)}
                                                >
                                                    إلغاء
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lecture, Rating, Source, SourceWithStats } from "@/lib/types";
import { StepSelector } from "@/components/StepSelector";
import { SourceCard } from "@/components/SourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowUpDown, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SortMode = "highest" | "most-reviewed" | "shortest";

export default function BrowsePage() {
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [sources, setSources] = useState<SourceWithStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>("highest");

    const fetchSources = async (lectureId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from("sources")
            .select("*, ratings(*)")
            .eq("lecture_id", lectureId)
            .order("created_at", { ascending: false });

        if (data) {
            const withStats: SourceWithStats[] = data.map((s: Source & { ratings: Rating[] }) => ({
                ...s,
                average_rating:
                    s.ratings.length > 0
                        ? s.ratings.reduce((sum: number, r: Rating) => sum + r.score, 0) / s.ratings.length
                        : 0,
                rating_count: s.ratings.length,
                ratings: s.ratings
                    .sort((a: Rating, b: Rating) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
            }));
            setSources(withStats);
        }
        setLoading(false);
    };

    const handleLectureSelected = (lecture: Lecture) => {
        setSelectedLecture(lecture);
        fetchSources(lecture.id);
    };

    const sortedSources = [...sources].sort((a, b) => {
        switch (sortMode) {
            case "highest":
                return b.average_rating - a.average_rating;
            case "most-reviewed":
                return b.rating_count - a.rating_count;
            case "shortest":
                return a.duration_minutes - b.duration_minutes;
            default:
                return 0;
        }
    });

    const sortButtons: { mode: SortMode; label: string; icon: typeof TrendingUp }[] = [
        { mode: "highest", label: "الأعلى تقييماً", icon: TrendingUp },
        { mode: "most-reviewed", label: "الأكثر تقييماً", icon: Users },
        { mode: "shortest", label: "الأقصر مدة", icon: Clock },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black gradient-text mb-2">تصفح التقييمات</h1>
                <p className="text-muted-foreground">
                    اكتشف أفضل المصادر التعليمية حسب تقييمات الطلاب
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

            {/* Results */}
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
                                }}
                            >
                                <ArrowRight className="w-4 h-4 ml-1" />
                                تغيير
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-4">
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                            <Skeleton className="h-32 rounded-xl" />
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Sort Controls */}
                            {sources.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-2">
                                        <ArrowUpDown className="w-4 h-4" />
                                        ترتيب:
                                    </div>
                                    {sortButtons.map((btn) => (
                                        <Button
                                            key={btn.mode}
                                            variant={sortMode === btn.mode ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSortMode(btn.mode)}
                                            className={cn("gap-1.5", sortMode === btn.mode && "shadow-lg shadow-primary/25")}
                                        >
                                            <btn.icon className="w-3.5 h-3.5" />
                                            {btn.label}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Source Cards */}
                            {sources.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">
                                            لا توجد مصادر لهذه المحاضرة بعد
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {sortedSources.map((source) => (
                                        <SourceCard key={source.id} source={source} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

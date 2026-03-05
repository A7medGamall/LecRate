"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Source, Rating } from "@/lib/types";
import { RatingForm } from "@/components/RatingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Star,
    Clock,
    Users,
    ExternalLink,
    Calendar,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default function SourceDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [source, setSource] = useState<Source | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        const [sourceRes, ratingsRes] = await Promise.all([
            supabase.from("sources").select("*").eq("id", id).single(),
            supabase
                .from("ratings")
                .select("*")
                .eq("source_id", id)
                .order("created_at", { ascending: false }),
        ]);

        if (sourceRes.data) setSource(sourceRes.data);
        if (ratingsRes.data) setRatings(ratingsRes.data);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!source) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">المصدر غير موجود</h1>
                <Link href="/browse" className="text-primary hover:underline">
                    العودة للتصفح
                </Link>
            </div>
        );
    }

    const avgRating =
        ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Source Info */}
            <div className="animate-fade-in">
                <h1 className="text-3xl font-black mb-2">{source.title}</h1>
                {source.url && (
                    <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        فتح الرابط
                    </a>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 animate-fade-in">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-black">
                            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-black">{ratings.length}</p>
                        <p className="text-xs text-muted-foreground">عدد التقييمات</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-black">{source.duration_minutes}</p>
                        <p className="text-xs text-muted-foreground">دقيقة</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rating Form */}
            <Card className="border-primary/30 animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        أضف تقييمك
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RatingForm sourceId={source.id} onRatingAdded={fetchData} />
                </CardContent>
            </Card>

            {/* Ratings List */}
            <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    جميع التقييمات ({ratings.length})
                </h2>

                {ratings.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">لا توجد تقييمات بعد — كن أول من يُقيّم!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {ratings.map((rating) => (
                            <Card key={rating.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(10)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < rating.score
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-muted-foreground/20"
                                                        }`}
                                                />
                                            ))}
                                            <span className="mr-2 text-sm font-bold text-primary">
                                                {rating.score}/10
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(rating.created_at).toLocaleDateString("ar-EG")}
                                        </div>
                                    </div>
                                    {rating.comment && (
                                        <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                                            {rating.comment}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Star, MessageSquare } from "lucide-react";

interface StatData {
    totalRatings: number;
    mostReviewedModule: { name: string; count: number } | null;
    mostReviewedSource: { title: string; count: number } | null;
}

export default function StatsPage() {
    const [stats, setStats] = useState<StatData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            // Total ratings
            const { count: totalRatings } = await supabase
                .from("ratings")
                .select("*", { count: "exact", head: true });

            // Most reviewed source
            const { data: sourcesData } = await supabase
                .from("sources")
                .select("id, title, ratings(id)");

            let mostReviewedSource: { title: string; count: number } | null = null;
            if (sourcesData) {
                const sourceStats = sourcesData.map((s: { id: string; title: string; ratings: { id: string }[] }) => ({
                    title: s.title,
                    count: s.ratings.length,
                }));
                sourceStats.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
                if (sourceStats.length > 0 && sourceStats[0].count > 0) {
                    mostReviewedSource = sourceStats[0];
                }
            }

            // Most reviewed module (by total ratings across all its lectures' sources)
            const { data: modulesData } = await supabase
                .from("modules")
                .select("id, name, lectures(sources(ratings(id)))");

            let mostReviewedModule: { name: string; count: number } | null = null;
            if (modulesData) {
                const moduleStats = modulesData.map((m: {
                    id: string;
                    name: string;
                    lectures: { sources: { ratings: { id: string }[] }[] }[];
                }) => {
                    let count = 0;
                    m.lectures.forEach((l) => {
                        l.sources.forEach((s) => {
                            count += s.ratings.length;
                        });
                    });
                    return { name: m.name, count };
                });
                moduleStats.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
                if (moduleStats.length > 0 && moduleStats[0].count > 0) {
                    mostReviewedModule = moduleStats[0];
                }
            }

            setStats({
                totalRatings: totalRatings || 0,
                mostReviewedModule,
                mostReviewedSource,
            });
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black gradient-text mb-2">الإحصائيات</h1>
                <p className="text-muted-foreground">نظرة عامة على نشاط المنصة</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-36 rounded-xl" />
                    <Skeleton className="h-36 rounded-xl" />
                    <Skeleton className="h-36 rounded-xl" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Total Ratings */}
                    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-7 h-7 text-primary" />
                            </div>
                            <p className="text-4xl font-black mb-1">{stats?.totalRatings || 0}</p>
                            <p className="text-sm text-muted-foreground">إجمالي التقييمات</p>
                        </CardContent>
                    </Card>

                    {/* Most Reviewed Module */}
                    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7 text-blue-500" />
                            </div>
                            {stats?.mostReviewedModule ? (
                                <>
                                    <p className="text-lg font-bold mb-1 line-clamp-2">{stats.mostReviewedModule.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        الأكثر تقييماً ({stats.mostReviewedModule.count} تقييم)
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Most Reviewed Source */}
                    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Star className="w-7 h-7 text-amber-500" />
                            </div>
                            {stats?.mostReviewedSource ? (
                                <>
                                    <p className="text-lg font-bold mb-1 line-clamp-2">{stats.mostReviewedSource.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        المصدر الأكثر تقييماً ({stats.mostReviewedSource.count} تقييم)
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

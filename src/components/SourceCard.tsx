"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, ExternalLink, MessageSquare } from "lucide-react";
import { SourceWithStats } from "@/lib/types";

interface SourceCardProps {
    source: SourceWithStats;
}

export function SourceCard({ source }: SourceCardProps) {
    const topComments = source.ratings
        .filter((r) => r.comment)
        .slice(0, 3);

    return (
        <Link href={`/source/${source.id}`}>
            <Card className="group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden">
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-2">
                                {source.title}
                            </h3>
                            {source.url && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{source.url}</span>
                                </div>
                            )}
                        </div>
                        {/* Rating Badge */}
                        <div className="flex-shrink-0">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${source.average_rating >= 7
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : source.average_rating >= 4
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {source.average_rating > 0 ? source.average_rating.toFixed(1) : "—"}
                                <span className="text-xs font-normal opacity-70">/10</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-4">
                        <Badge variant="secondary" className="gap-1.5 font-medium">
                            <Users className="w-3 h-3" />
                            {source.rating_count} تقييم
                        </Badge>
                        <Badge variant="secondary" className="gap-1.5 font-medium">
                            <Clock className="w-3 h-3" />
                            {source.duration_minutes} دقيقة
                        </Badge>
                    </div>

                    {/* Comments Preview */}
                    {topComments.length > 0 && (
                        <div className="space-y-2 border-t pt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                <MessageSquare className="w-3 h-3" />
                                أبرز التعليقات
                            </div>
                            {topComments.map((rating) => (
                                <p
                                    key={rating.id}
                                    className="text-xs text-muted-foreground line-clamp-1 pr-3 border-r-2 border-primary/30"
                                >
                                    &ldquo;{rating.comment}&rdquo;
                                </p>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

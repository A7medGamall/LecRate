"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RatingFormProps {
    sourceId: string;
    sourceUrl?: string | null;
    onRatingAdded?: () => void;
}

export function RatingForm({ sourceId, sourceUrl, onRatingAdded }: RatingFormProps) {
    const [score, setScore] = useState(0);
    const [hoveredScore, setHoveredScore] = useState(0);
    const [comment, setComment] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [alreadyRated, setAlreadyRated] = useState(false);

    // Check if user already rated this source
    useEffect(() => {
        const rated = localStorage.getItem(`lecrate-rated-${sourceId}`);
        if (rated) setAlreadyRated(true);
    }, [sourceId]);

    if (alreadyRated) {
        return (
            <div className="text-center py-4 px-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm font-semibold text-primary">✅ لقد قمت بتقييم هذا المصدر بالفعل</p>
                <p className="text-xs text-muted-foreground mt-1">شكراً لمساهمتك!</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (score === 0) {
            toast.error("يرجى اختيار تقييم");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from("ratings").insert({
                source_id: sourceId,
                score,
                comment: comment.trim() || null,
            });

            if (error) throw error;

            // If user provided a URL and source doesn't have one, update the source
            if (linkUrl.trim() && !sourceUrl) {
                await supabase
                    .from("sources")
                    .update({ url: linkUrl.trim() })
                    .eq("id", sourceId);
            }

            // Save to localStorage to prevent duplicate ratings
            localStorage.setItem(`lecrate-rated-${sourceId}`, "true");

            toast.success("تم إضافة التقييم بنجاح!");
            setScore(0);
            setComment("");
            setLinkUrl("");
            setAlreadyRated(true);
            onRatingAdded?.();
        } catch {
            toast.error("حدث خطأ أثناء إضافة التقييم");
        } finally {
            setSubmitting(false);
        }
    };

    const displayScore = hoveredScore || score;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
                <Label className="text-sm font-semibold mb-3 block">التقييم</Label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setScore(n)}
                            onMouseEnter={() => setHoveredScore(n)}
                            onMouseLeave={() => setHoveredScore(0)}
                            className="p-0.5 transition-transform hover:scale-125"
                        >
                            <Star
                                className={cn(
                                    "w-6 h-6 transition-colors",
                                    n <= displayScore
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                )}
                            />
                        </button>
                    ))}
                    {displayScore > 0 && (
                        <span className="mr-2 text-lg font-bold text-primary">
                            {displayScore}/10
                        </span>
                    )}
                </div>
            </div>

            {/* Add URL if source doesn't have one */}
            {!sourceUrl && (
                <div>
                    <Label htmlFor="linkUrl" className="text-sm font-semibold mb-2 block">
                        🔗 أضف رابط المصدر (اختياري)
                    </Label>
                    <div className="relative">
                        <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="linkUrl"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="pr-10"
                            dir="ltr"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">هذا المصدر ليس له رابط بعد، ساعد زملاءك بإضافته!</p>
                </div>
            )}

            {/* Comment */}
            <div>
                <Label htmlFor="comment" className="text-sm font-semibold mb-2 block">
                    تعليق (اختياري)
                </Label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="أكتب تعليقك هنا..."
                    rows={3}
                    className="resize-none"
                />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={submitting || score === 0} className="w-full gap-2">
                {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
                {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
        </form>
    );
}

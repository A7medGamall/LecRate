"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Batch, Module, Lecture } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, BookOpen, Layers, GraduationCap, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepSelectorProps {
    onLectureSelected: (lecture: Lecture) => void;
    showStepIndicator?: boolean;
}

export function StepSelector({ onLectureSelected, showStepIndicator = true }: StepSelectorProps) {
    const [step, setStep] = useState(1);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedType, setSelectedType] = useState<'lecture' | 'section' | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch batches on mount
    useEffect(() => {
        async function fetchBatches() {
            setLoading(true);
            const { data } = await supabase.from("batches").select("*").order("name");
            setBatches(data || []);
            setLoading(false);
        }
        fetchBatches();
    }, []);

    // Fetch modules when batch selected
    useEffect(() => {
        if (!selectedBatch) return;
        async function fetchModules() {
            setLoading(true);
            const { data } = await supabase
                .from("modules")
                .select("*")
                .eq("batch_id", selectedBatch!.id)
                .order("name");
            setModules(data || []);
            setLoading(false);
        }
        fetchModules();
    }, [selectedBatch]);

    // Fetch lectures when type selected
    useEffect(() => {
        if (!selectedModule || !selectedType) return;
        async function fetchLectures() {
            setLoading(true);
            const { data } = await supabase
                .from("lectures")
                .select("*")
                .eq("module_id", selectedModule!.id)
                .eq("type", selectedType!)
                .order("number");
            setLectures(data || []);
            setLoading(false);
        }
        fetchLectures();
    }, [selectedModule, selectedType]);

    const handleBatchSelect = (batch: Batch) => {
        setSelectedBatch(batch);
        setSelectedModule(null);
        setSelectedType(null);
        setStep(2);
    };

    const handleModuleSelect = (module: Module) => {
        setSelectedModule(module);
        setSelectedType(null);
        setStep(3);
    };

    const handleTypeSelect = (type: 'lecture' | 'section') => {
        setSelectedType(type);
        setStep(4);
    };

    const handleLectureSelect = (lecture: Lecture) => {
        onLectureSelected(lecture);
    };

    const goBack = () => {
        if (step === 2) {
            setSelectedBatch(null);
            setModules([]);
            setStep(1);
        } else if (step === 3) {
            setSelectedModule(null);
            setStep(2);
        } else if (step === 4) {
            setSelectedType(null);
            setLectures([]);
            setStep(3);
        }
    };

    const steps = [
        { num: 1, label: "الدفعة", icon: Layers },
        { num: 2, label: "المادة", icon: BookOpen },
        { num: 3, label: "النوع", icon: GraduationCap },
        { num: 4, label: "المحاضرة", icon: Hash },
    ];

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            {showStepIndicator && (
                <div className="flex items-center justify-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                                    step >= s.num
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                <s.icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <ChevronLeft className={cn(
                                    "w-4 h-4 transition-colors",
                                    step > s.num ? "text-primary" : "text-muted-foreground/30"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Back Button */}
            {step > 1 && (
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                    رجوع
                </button>
            )}

            {/* Loading */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </div>
            )}

            {/* Step 1: Batches */}
            {!loading && step === 1 && (
                <div>
                    <h3 className="text-lg font-bold mb-4">اختر الدفعة</h3>
                    {batches.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">لا توجد دفعات متاحة</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {batches.map((batch) => (
                                <Card
                                    key={batch.id}
                                    className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                                    onClick={() => handleBatchSelect(batch)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <Layers className="w-6 h-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                                        <p className="font-semibold">{batch.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Modules */}
            {!loading && step === 2 && (
                <div>
                    <h3 className="text-lg font-bold mb-1">اختر المادة</h3>
                    <p className="text-sm text-muted-foreground mb-4">الدفعة: {selectedBatch?.name}</p>
                    {modules.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">لا توجد مواد لهذه الدفعة</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {modules.map((module) => (
                                <Card
                                    key={module.id}
                                    className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                                    onClick={() => handleModuleSelect(module)}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                        <p className="font-semibold">{module.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Type */}
            {!loading && step === 3 && (
                <div>
                    <h3 className="text-lg font-bold mb-1">اختر النوع</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedBatch?.name} → {selectedModule?.name}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                            onClick={() => handleTypeSelect('lecture')}
                        >
                            <CardContent className="p-6 text-center">
                                <GraduationCap className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                                <p className="font-bold text-lg">محاضرة</p>
                                <p className="text-xs text-muted-foreground mt-1">Lecture</p>
                            </CardContent>
                        </Card>
                        <Card
                            className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                            onClick={() => handleTypeSelect('section')}
                        >
                            <CardContent className="p-6 text-center">
                                <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                                <p className="font-bold text-lg">سكشن</p>
                                <p className="text-xs text-muted-foreground mt-1">Section</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Step 4: Lectures */}
            {!loading && step === 4 && (
                <div>
                    <h3 className="text-lg font-bold mb-1">اختر {selectedType === 'lecture' ? 'المحاضرة' : 'السكشن'}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {selectedBatch?.name} → {selectedModule?.name} → {selectedType === 'lecture' ? 'محاضرات' : 'سكاشن'}
                    </p>
                    {lectures.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">لا توجد {selectedType === 'lecture' ? 'محاضرات' : 'سكاشن'} متاحة</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {lectures.map((lecture) => (
                                <Card
                                    key={lecture.id}
                                    className="cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
                                    onClick={() => handleLectureSelect(lecture)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <Hash className="w-5 h-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                                        <p className="font-bold">{lecture.number}</p>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lecture.title}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

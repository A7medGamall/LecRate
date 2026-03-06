"use client";

import Link from "next/link";
import { Star, Search, GraduationCap, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-32 text-center">
          {/* Logo icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl animated-gradient flex items-center justify-center shadow-2xl shadow-primary/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-white">قيّم محاضراتك</span>
            <br />
            <span className="gradient-text">واكتشف أفضل المصادر</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            منصة مجانية تتيح لطلاب الجامعة تقييم مصادر الدراسة ومشاركة آرائهم
            لمساعدة زملائهم في اختيار أفضل المحتوى التعليمي
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/rate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold animated-gradient text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
            >
              <Star className="w-6 h-6" />
              قيّم محاضرة
            </Link>
            <Link
              href="/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold bg-card border-2 border-border text-foreground shadow-xl hover:border-primary/50 hover:shadow-primary/10 hover:scale-105 transition-all duration-300"
            >
              <Search className="w-6 h-6" />
              تصفح التقييمات
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="group glass rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">قيّم بسهولة</h3>
              <p className="text-sm text-muted-foreground">
                قيّم أي مصدر دراسي من 1 إلى 10 وأضف تعليقك
              </p>
            </div>
            <div className="group glass rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">اكتشف الأفضل</h3>
              <p className="text-sm text-muted-foreground">
                تصفح التقييمات واعرف أفضل المصادر لكل محاضرة
              </p>
            </div>
            <div className="group glass rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">ساعد زملاءك</h3>
              <p className="text-sm text-muted-foreground">
                شارك رأيك لمساعدة الآخرين في اختيار مصادرهم
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

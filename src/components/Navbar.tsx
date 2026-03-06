"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GraduationCap, Star, BarChart3, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "الرئيسية", icon: GraduationCap },
    { href: "/rate", label: "قيّم محاضرة", icon: Star },
    { href: "/browse", label: "تصفح التقييمات", icon: Search },
    { href: "/stats", label: "الإحصائيات", icon: BarChart3 },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 right-0 left-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group relative w-32 h-10">
                        <Image 
                            src="/logo.svg" 
                            alt="LecRate Logo" 
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-accent transition-colors"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border/50 glass animate-fade-in">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}

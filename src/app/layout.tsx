import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "LecRate - قيّم محاضراتك",
  description: "منصة لتقييم واكتشاف مصادر الدراسة الجامعية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased min-h-screen">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Toaster
          position="top-center"
          richColors
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "'Tajawal', 'Inter', sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}

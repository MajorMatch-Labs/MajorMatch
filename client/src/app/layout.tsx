import type { Metadata } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "MajorMatch - Hệ thống Định hướng & Phân tích Kỹ năng Học tập Web 2.0",
  description:
    "Nền tảng cố vấn học tập và cá nhân hóa lộ trình đại học với Cosine Similarity, Recharts Radar đa tầng và Trợ lý AI Qwen 2.5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        {/* Ambient glow background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 -left-40 w-[450px] h-[450px] bg-cyan-600/10 blur-[130px] rounded-full" />
          <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full" />
        </div>

        <Navbar />

        <main className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}

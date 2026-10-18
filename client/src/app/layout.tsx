import type { Metadata } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "MajorMatch - Khám phá chuyên ngành và lộ trình học",
  description:
    "Khám phá chuyên ngành từ bảng điểm và khảo sát sở thích. So sánh kỹ năng và lên kế hoạch học tập cùng MajorMatch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('majormatch-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col min-h-screen transition-colors duration-200">
        {/* Ambient glow background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute top-1/3 -left-40 w-[450px] h-[450px] bg-cyan-500/10 dark:bg-cyan-600/10 blur-[130px] rounded-full" />
          <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/10 blur-[140px] rounded-full" />
        </div>

        <Navbar />

        <main className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <AuthModal />
        <Footer />
      </body>
    </html>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-slate-200 bg-white py-8 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div><strong className="text-slate-900 dark:text-white">MajorMatch</strong><p className="mt-1">Gợi ý chuyên ngành là thông tin tham khảo cho quyết định học tập của bạn.</p></div>
        <div className="flex items-center gap-5"><Link href="/upload" className="hover:text-indigo-600">Bắt đầu</Link><a href="https://github.com/MajorMatch-Labs/MajorMatch" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Mã nguồn dự án</a></div>
      </div>
    </footer>
  );
}

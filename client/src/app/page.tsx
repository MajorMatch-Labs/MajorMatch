import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, FileText, Sparkles } from "lucide-react";

const steps = [
  { icon: FileText, number: "01", title: "Thêm bảng điểm nếu có", description: "Tải PDF để hệ thống nhận diện môn học và kết quả đã đạt. Bạn vẫn có thể bắt đầu bằng khảo sát khi chưa có bảng điểm." },
  { icon: ClipboardList, number: "02", title: "Chia sẻ điều bạn quan tâm", description: "Chọn lĩnh vực muốn tìm hiểu và trả lời 10 câu hỏi về sở thích học tập, công việc." },
  { icon: BookOpen, number: "03", title: "Xem gợi ý và lộ trình", description: "So sánh các chuyên ngành, xem kỹ năng cần bổ sung rồi chọn một hướng để xây dựng lộ trình học." },
];

export default function HomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-14">
      <section className="mx-auto max-w-4xl text-center" aria-labelledby="home-title">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" aria-hidden="true" />Định hướng chuyên ngành cùng MajorMatch
        </div>
        <h1 id="home-title" className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          Hiểu năng lực của bạn. <span className="text-indigo-600 dark:text-indigo-400">Chọn hướng học phù hợp.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
          MajorMatch kết hợp bảng điểm bạn cung cấp với khảo sát sở thích để gợi ý chuyên ngành và những kỹ năng nên học tiếp. Kết quả là thông tin tham khảo để bạn tự quyết định.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/upload" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:w-auto">
            Bắt đầu với hồ sơ của tôi <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/result?demo=1" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto">
            Xem báo cáo minh họa
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Báo cáo minh họa dùng dữ liệu mẫu, không phải kết quả của bạn.</p>
      </section>

      <section aria-labelledby="how-it-works" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Cách sử dụng</p>
          <h2 id="how-it-works" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Từ thông tin của bạn đến một hướng học rõ ràng</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, number, title, description }) => (
            <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-sm font-bold text-slate-400">{number}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

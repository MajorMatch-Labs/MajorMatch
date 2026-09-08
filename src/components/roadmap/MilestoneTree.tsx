"use client";

import React from "react";
import { GitCommit, Sparkles, Trophy, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { SemesterMilestone } from "@/types/api";
import { InteractiveTask } from "./InteractiveTask";
import { useProfileStore } from "@/stores/useProfileStore";
import Link from "next/link";

interface MilestoneTreeProps {
  semesters: SemesterMilestone[];
  targetMajor: string;
}

export const MilestoneTree: React.FC<MilestoneTreeProps> = ({ semesters, targetMajor }) => {
  const { dynamicReadinessScore, completedItems } = useProfileStore();

  const totalCompleted = Object.values(completedItems).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* 1. Header & Live % Job Readiness Indicator */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Web 2.0 Dynamic State Tracking
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Lộ trình Cố vấn cho: <span className="text-indigo-400">{targetMajor}</span>
            </h3>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Job Readiness:</span>
            <span className="text-2xl font-extrabold text-indigo-300 font-mono">
              {dynamicReadinessScore}%
            </span>
          </div>
        </div>

        {/* Thanh tiến độ chuyển động mượt mà */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-md shadow-indigo-500/30"
              style={{ width: `${dynamicReadinessScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Đã tích chọn hoàn thành: {totalCompleted} đầu việc</span>
            <span>Mục tiêu sẵn sàng: 100%</span>
          </div>
        </div>
      </div>

      {/* 2. Cây phân bổ từng học kỳ (Milestones) */}
      <div className="relative border-l-2 border-indigo-500/30 ml-4 md:ml-6 pl-6 md:pl-8 space-y-10">
        {semesters.map((sem, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/30">
              <GitCommit className="w-3.5 h-3.5" />
            </div>

            {/* Semester Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  GIAI ĐOẠN {idx + 1}
                </span>
                <h4 className="text-sm md:text-base font-bold text-white tracking-tight">
                  {sem.semester_name}
                </h4>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-1">
                Trọng tâm: {sem.target_focus}
              </p>
            </div>

            {/* Content Groups */}
            <div className="space-y-3">
              {/* Môn học cốt lõi */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Môn học đề xuất bù đắp kỹ năng:
                </span>
                {sem.recommended_courses.map((course) => (
                  <InteractiveTask
                    key={course.course_code}
                    id={course.course_code}
                    type="course"
                    title={course.course_name}
                    subtitle={course.course_code}
                    credits={course.credits}
                    rationale={course.rationale}
                  />
                ))}
              </div>

              {/* Đồ án thực chiến */}
              {sem.practical_projects.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Đồ án thực chiến cá nhân (Portfolio):
                  </span>
                  {sem.practical_projects.map((proj, pIdx) => (
                    <InteractiveTask
                      key={pIdx}
                      id={proj.project_title}
                      type="project"
                      title={proj.project_title}
                      skills={proj.target_skills}
                      rationale={proj.description}
                    />
                  ))}
                </div>
              )}

              {/* Chứng chỉ quốc tế */}
              {sem.certifications && sem.certifications.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                    Chứng chỉ đề xuất:
                  </span>
                  {sem.certifications.map((cert, cIdx) => (
                    <InteractiveTask
                      key={cIdx}
                      id={cert}
                      type="cert"
                      title={cert}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA: Hỏi trợ lý ảo */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white">Bạn muốn hỏi sâu hơn về phương pháp học từng môn?</h4>
          <p className="text-[11px] text-slate-400">Trợ lý AI Qwen 2.5 luôn sẵn sàng giải đáp thắc mắc lộ trình 24/7.</p>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
        >
          Trò chuyện ngay <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

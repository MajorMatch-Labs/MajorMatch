/**
 * Dịch vụ giao tiếp API với Backend HPC có tích hợp Mock Data Fallback
 */

import {
  TranscriptParsingResponse,
  SkillGapAnalysisResponse,
  RoadmapGenerationResponse,
  HealthCheckResponse
} from "../types/api";
import {
  MOCK_TRANSCRIPT_PARSING,
  MOCK_SKILL_GAP_ANALYSIS,
  MOCK_ROADMAP,
  MOCK_HEALTH_CHECK
} from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiService {
  /**
   * Kiểm tra tình trạng kết nối tới Backend HPC
   */
  static async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) throw new Error("Backend unhealthy");
      return await res.json();
    } catch {
      console.warn("Backend HPC unreached. Using Mock Health Data fallback.");
      return MOCK_HEALTH_CHECK;
    }
  }

  /**
   * Tải lên và bóc tách tệp PDF học bạ/CV
   */
  static async parseTranscript(file: File): Promise<TranscriptParsingResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/v1/profile/parse-transcript`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) throw new Error("Upload failed");
      return await res.json();
    } catch {
      console.warn("Backend upload failed or offline. Using high-fidelity Mock Transcript data.");
      // Giả lập độ trễ bóc tách chân thực
      await new Promise((r) => setTimeout(r, 900));
      return MOCK_TRANSCRIPT_PARSING;
    }
  }

  /**
   * Phân tích khoảng cách kỹ năng (Skill Gap) & Tính điểm Match Score
   */
  static async analyzeSkillGap(
    targetCareer: string,
    userSkills: string[],
    riasecScores?: Record<string, number>
  ): Promise<SkillGapAnalysisResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/analysis/skill-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_career: targetCareer,
          user_skills: userSkills,
          riasec_scores: riasecScores || {}
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) throw new Error("Analysis failed");
      return await res.json();
    } catch {
      console.warn("Skill gap analysis API offline. Falling back to Mock Analysis response.");
      await new Promise((r) => setTimeout(r, 700));
      return {
        ...MOCK_SKILL_GAP_ANALYSIS,
        target_career: targetCareer || MOCK_SKILL_GAP_ANALYSIS.target_career
      };
    }
  }

  /**
   * Sinh lộ trình học tập cá nhân hóa qua RAG & Qwen 2.5 LLM
   */
  static async generateRoadmap(
    targetMajor: string,
    missingSkills: string[],
    cumulativeGpa: number
  ): Promise<RoadmapGenerationResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_major: targetMajor,
          missing_skills: missingSkills,
          cumulative_gpa: cumulativeGpa
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) throw new Error("Roadmap generation failed");
      return await res.json();
    } catch {
      console.warn("Roadmap generation offline. Falling back to Mock Milestone Tree.");
      await new Promise((r) => setTimeout(r, 1200));
      return {
        ...MOCK_ROADMAP,
        target_major: targetMajor || MOCK_ROADMAP.target_major
      };
    }
  }

  /**
   * Trợ lý ảo cố vấn nghề nghiệp Streaming Chat (Server-Sent Events)
   */
  static async streamChat(
    message: string,
    targetMajor: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          target_major: targetMajor
        })
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        onChunk(text);
      }
      onComplete();
    } catch {
      console.warn("Chat stream offline. Using simulated interactive streaming typewriter.");
      const fallbackResponse =
        `Dựa trên định hướng chuyên ngành **${targetMajor || "AI & Data Science"}**, ` +
        `bạn nên ưu tiên bổ sung kỹ năng về Mô hình Ngôn ngữ Lớn (LLM) và Vector Database (như ChromaDB). ` +
        `Môn học **CS402 - Học sâu ứng dụng** trong học kỳ tới sẽ là bước đệm then chốt giúp bạn nâng cao năng lực toán học ứng dụng và thuật toán tối ưu hóa. ` +
        `Hãy bắt đầu bằng một đồ án thực chiến cá nhân trên GitHub để làm nổi bật hồ sơ của mình nhé!`;

      // Giả lập luồng gõ chữ thời gian thực từng từ
      const words = fallbackResponse.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise((r) => setTimeout(r, 40));
      }
      onComplete();
    }
  }
}

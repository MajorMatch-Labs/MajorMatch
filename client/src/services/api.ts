/**
 * Dịch vụ giao tiếp API với Backend HPC có tích hợp Mock Data Fallback
 * Phụ trách: LONG NHẬT (Tech Lead & Architecture Core)
 */

import {
  TranscriptParsingResponse,
  CalculateMatchRequest,
  CalculateMatchResponse,
  RoadmapGenerationRequest,
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
   * Tải lên và bóc tách tệp PDF học bạ/CV qua endpoint chuẩn của Backend HPC
   * Endpoint: POST /api/v1/profile/upload-transcript
   */
  static async parseTranscript(file: File): Promise<TranscriptParsingResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "transcript");

      const res = await fetch(`${API_BASE_URL}/api/v1/profile/upload-transcript`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);
      const data = await res.json();
      return {
        ...data,
        profile: data.profile_data || data.profile
      };
    } catch (err) {
      console.warn("Backend upload failed or offline. Using high-fidelity Mock Transcript data.", err);
      await new Promise((r) => setTimeout(r, 800));
      return MOCK_TRANSCRIPT_PARSING;
    }
  }

  /**
   * Tính toán độ phù hợp chuyên ngành & đo lường khoảng cách kỹ năng (Skill Gap)
   * Endpoint: POST /api/v1/assessment/calculate-match
   */
  static async calculateMatch(
    requestPayload: CalculateMatchRequest
  ): Promise<CalculateMatchResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/assessment/calculate-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) throw new Error(`Calculate match failed: ${res.status}`);
      const data: CalculateMatchResponse = await res.json();
      return {
        ...data,
        top_recommendations: data.top_matches
      };
    } catch (err) {
      console.warn("Calculate match API offline. Falling back to Mock Analysis response.", err);
      await new Promise((r) => setTimeout(r, 600));
      return {
        ...MOCK_SKILL_GAP_ANALYSIS,
        target_career: requestPayload.target_career_tags[0] || MOCK_SKILL_GAP_ANALYSIS.target_career
      };
    }
  }

  /**
   * Alias tương thích ngược cho analyzeSkillGap
   */
  static async analyzeSkillGap(
    targetCareer: string,
    userSkills?: string[],
    riasecScores?: Record<string, number>
  ): Promise<CalculateMatchResponse> {
    const holland: any = {
      realistic: riasecScores?.R || 3.0,
      investigative: riasecScores?.I || 3.0,
      artistic: riasecScores?.A || 3.0,
      social: riasecScores?.S || 3.0,
      enterprising: riasecScores?.E || 3.0,
      conventional: riasecScores?.C || 3.0
    };
    return this.calculateMatch({
      holland_scores: holland,
      target_career_tags: [targetCareer || "ai_engineer"]
    });
  }

  /**
   * Sinh lộ trình học tập cá nhân hóa qua RAG & Qwen 2.5 LLM
   * Endpoint: POST /api/v1/roadmap/generate
   */
  static async generateRoadmap(
    payload: RoadmapGenerationRequest
  ): Promise<RoadmapGenerationResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) throw new Error(`Roadmap generation failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Roadmap generation offline. Falling back to Mock Milestone Tree.", err);
      await new Promise((r) => setTimeout(r, 1000));
      return {
        ...MOCK_ROADMAP,
        target_major: payload.target_major_id || MOCK_ROADMAP.target_major
      };
    }
  }

  /**
   * Trợ lý ảo cố vấn nghề nghiệp Streaming Chat (Server-Sent Events)
   * Endpoint: POST /api/v1/chat/stream
   */
  static async streamChat(
    message: string,
    targetMajor: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          major_focus: targetMajor,
          student_profile_context: `Định hướng chuyên ngành: ${targetMajor}`
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
    } catch (err) {
      console.warn("Chat stream offline. Using simulated interactive streaming typewriter.", err);
      const fallbackResponse =
        `Dựa trên định hướng chuyên ngành **${targetMajor || "AI & Data Science"}**, ` +
        `bạn nên ưu tiên bổ sung kỹ năng về Mô hình Ngôn ngữ Lớn (LLM) và Vector Database (như ChromaDB). ` +
        `Môn học **CS402 - Học sâu ứng dụng** trong học kỳ tới sẽ là bước đệm then chốt giúp bạn nâng cao năng lực toán học ứng dụng và thuật toán tối ưu hóa. ` +
        `Hãy bắt đầu bằng một đồ án thực chiến cá nhân trên GitHub để làm nổi bật hồ sơ của mình nhé!`;

      const words = fallbackResponse.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise((r) => setTimeout(r, 40));
      }
      onComplete();
    }
  }
}

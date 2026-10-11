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
  MOCK_HEALTH_CHECK
} from "./mockData";

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "");

export class ApiService {
  /**
   * Kiểm tra tình trạng kết nối tới Backend HPC
   */
  static async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000)
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "transcript");

    const res = await fetch(`${API_BASE_URL}/api/v1/profile/upload-transcript`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(30000)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Bóc tách tệp thất bại (HTTP ${res.status}): ${errorText || "Lỗi máy chủ xử lý PDF"}`);
    }

    const data = await res.json();
    return {
      ...data,
      profile: data.profile_data || data.profile
    };
  }

  /**
   * Tính toán độ phù hợp chuyên ngành & đo lường khoảng cách kỹ năng (Skill Gap)
   * Endpoint: POST /api/v1/assessment/calculate-match
   */
  static async calculateMatch(
    requestPayload: CalculateMatchRequest
  ): Promise<CalculateMatchResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/assessment/calculate-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Tính toán khoảng cách kỹ năng thất bại (HTTP ${res.status}): ${errorText}`);
    }

    const data: CalculateMatchResponse = await res.json();
    return {
      ...data,
      top_recommendations: data.top_matches
    };
  }

  /**
   * Truy vấn CSDL thật lấy kết quả đánh giá kỹ năng đã lưu của sinh viên
   * Endpoint: GET /api/v1/assessment/{student_id}
   */
  static async getSavedAssessment(studentId: string = "SV-2025001"): Promise<CalculateMatchResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/assessment/${encodeURIComponent(studentId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) return null;

      const data: CalculateMatchResponse = await res.json();
      return {
        ...data,
        top_recommendations: data.top_matches
      };
    } catch {
      return null;
    }
  }

  /**
   * Lưu hoặc cập nhật kết quả đánh giá kỹ năng vào CSDL SQLite
   * Endpoint: POST /api/v1/assessment/{student_id}
   */
  static async saveAssessment(
    studentId: string = "SV-2025001",
    assessmentData: any
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/assessment/${encodeURIComponent(studentId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
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
      realistic: riasecScores?.R || riasecScores?.r || 3.0,
      investigative: riasecScores?.I || riasecScores?.i || 3.0,
      artistic: riasecScores?.A || riasecScores?.a || 3.0,
      social: riasecScores?.S || riasecScores?.s || 3.0,
      enterprising: riasecScores?.E || riasecScores?.e || 3.0,
      conventional: riasecScores?.C || riasecScores?.c || 3.0
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
    const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(35000)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Sinh lộ trình học tập thất bại (HTTP ${res.status}): ${errorText}`);
    }

    const data: any = await res.json();
    const readiness = data.job_readiness_percentage ?? data.readiness_score ?? 72.5;
    const rawList = data.phases || data.semesters || [];
    const phases = rawList.map((item: any, idx: number) => {
      const phaseNum = item.phase_number || item.semester_number || (idx + 1);
      const cleanTitle = (item.phase_title || item.semester_title || item.semester_name || `Giai đoạn ${phaseNum}`)
        .replace(/Học kỳ \d+:?/gi, `Giai đoạn ${phaseNum}:`)
        .replace(/Kỳ \d+:?/gi, `Giai đoạn ${phaseNum}:`);

      return {
        phase_number: phaseNum,
        phase_title: cleanTitle,
        semester_name: cleanTitle,
        target_focus: item.target_focus || "Phát triển năng lực chuyên môn và đồ án thực chiến",
        milestone_skills: item.milestone_skills || [],
        recommended_courses: item.recommended_courses || [],
        certifications: item.certifications || [],
        practical_projects: item.practical_projects || (item.practical_project ? [item.practical_project] : [])
      };
    });

    return {
      status: "success",
      student_id: data.student_id || payload.student_id,
      target_major: data.target_major,
      target_major_id: data.target_major_id || payload.target_major_id,
      readiness_score: readiness,
      total_milestones: phases.length,
      semesters: phases,
      phases,
      completed_items: data.completed_items || {}
    };
  }

  /**
   * Truy vấn CSDL thật lấy lộ trình đã lưu của sinh viên
   * Endpoint: GET /api/v1/roadmap/{student_id}
   */
  static async getSavedRoadmap(studentId: string = "SV-2025001"): Promise<RoadmapGenerationResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/${encodeURIComponent(studentId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) return null;

      const data: any = await res.json();
      const rawList = data.phases || data.semesters || [];
      const phases = rawList.map((item: any, idx: number) => {
        const phaseNum = item.phase_number || item.semester_number || (idx + 1);
        const cleanTitle = (item.phase_title || item.semester_title || item.semester_name || `Giai đoạn ${phaseNum}`)
          .replace(/Học kỳ \d+:?/gi, `Giai đoạn ${phaseNum}:`)
          .replace(/Kỳ \d+:?/gi, `Giai đoạn ${phaseNum}:`);

        return {
          phase_number: phaseNum,
          phase_title: cleanTitle,
          semester_name: cleanTitle,
          target_focus: item.target_focus || "Phát triển năng lực chuyên môn và đồ án thực chiến",
          milestone_skills: item.milestone_skills || [],
          recommended_courses: item.recommended_courses || [],
          certifications: item.certifications || [],
          practical_projects: item.practical_projects || (item.practical_project ? [item.practical_project] : [])
        };
      });

      return {
        status: "success",
        student_id: data.student_id,
        target_major: data.target_major,
        target_major_id: data.target_major_id,
        readiness_score: data.readiness_score || data.job_readiness_percentage || 70,
        total_milestones: phases.length,
        semesters: phases,
        phases,
        completed_items: data.completed_items || {}
      };
    } catch {
      return null;
    }
  }

  /**
   * Cập nhật tiến độ hoàn thành các checkbox môn học/đồ án vào CSDL thật
   * Endpoint: POST /api/v1/roadmap/{student_id}/progress
   */
  static async saveRoadmapProgress(
    studentId: string = "SV-2025001",
    completedItems: Record<string, boolean>,
    readinessScore: number
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roadmap/${encodeURIComponent(studentId)}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          completed_items: completedItems,
          readiness_score: readinessScore
        }),
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    } catch {
      return false;
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
    onError: (err: any) => void,
    skillsContext?: { mastered?: string[]; missing?: string[] },
    gpa?: number
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify({
          conversation_id: `conv-${Date.now()}`,
          message,
          major_focus: targetMajor,
          gpa: gpa || 3.2,
          mastered_skills: skillsContext?.mastered || [],
          missing_skills: skillsContext?.missing || [],
          student_profile_context: `Định hướng: ${targetMajor} | Kỹ năng cần bù đắp: ${skillsContext?.missing?.join(", ") || "Chưa xác định"}`,
          context: {
            target_major: targetMajor,
            current_gpa: gpa || 3.2,
            missing_skills: skillsContext?.missing || []
          }
        })
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP_${res.status}: Lỗi kết nối luồng chat`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        buffer += text;

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.slice(5).trim();
            if (dataContent === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataContent);
              const token = parsed.token || parsed.delta || "";
              if (token) onChunk(token);
            } catch {
              if (dataContent) onChunk(dataContent + " ");
            }
          }
        }
      }
      onComplete();
    } catch (err) {
      console.warn("Chat stream offline. Using simulated interactive streaming typewriter.", err);
      const missingList = skillsContext?.missing?.slice(0, 3).join(", ") || "Hệ thống phân tán, MLOps";
      const fallbackResponse =
        `Dựa trên định hướng chuyên ngành **${targetMajor || "AI & Data Science"}** và các kỹ năng bạn đang cần bù đắp (${missingList}), ` +
        `bạn nên ưu tiên xây dựng đồ án thực chiến kết hợp mô hình ngôn ngữ lớn (LLM) và Vector Database (như ChromaDB). ` +
        `Các môn học tiên quyết trong học kỳ tới sẽ là bước đệm then chốt giúp bạn nâng cao năng lực giải thuật và tối ưu hóa hệ thống. ` +
        `Hãy bắt đầu bằng việc giải quyết các bài toán thực tế trên GitHub để làm nổi bật hồ sơ nhé!`;

      const words = fallbackResponse.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise((r) => setTimeout(r, 35));
      }
      onComplete();
    }
  }

  /**
   * Lấy lịch sử đoạn chat từ CSDL SQLite
   * Endpoint: GET /api/v1/chat/history/{student_id}
   */
  static async getChatHistory(studentId: string = "SV-2025001"): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/history/${encodeURIComponent(studentId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.messages || []).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));
    } catch {
      return [];
    }
  }

  /**
   * Lưu tin nhắn vào CSDL SQLite
   * Endpoint: POST /api/v1/chat/history/{student_id}
   */
  static async saveChatMessage(studentId: string = "SV-2025001", role: "user" | "assistant", content: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chat/history/${encodeURIComponent(studentId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}


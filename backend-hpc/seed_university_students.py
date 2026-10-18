"""
Script chuẩn hóa và nạp dữ liệu sinh viên đại học thực tế cho CSDL MajorMatch.
Dọn dẹp các ID rác (calculate-match, student_demo_1) và gán họ tên sinh viên Việt Nam chuẩn mực.
"""

import sqlite3
import json
import time
import os
import sys

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

DB_PATH = sys.argv[1] if len(sys.argv) > 1 else "majormatch.db"

print(f"[*] Đang kết nối tới CSDL: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

# 1. DỌN DẸP DỮ LIỆU RÁC
INVALID_IDS = ["calculate-match", "student_demo_1"]
print("[*] 1. Dọn dẹp các ID kiểm thử rác...")
for table in ["user_profiles", "assessments", "roadmaps", "riasec_surveys", "chat_history"]:
    try:
        cursor.execute(f"DELETE FROM {table} WHERE student_id IN ({','.join(['?']*len(INVALID_IDS))})", INVALID_IDS)
    except Exception as e:
        print(f"    Lỗi dọn bảng {table}: {e}")

# 2. DANH SÁCH SINH VIÊN ĐẠI HỌC THỰC TẾ
STUDENTS = [
    {
        "student_id": "SV-2025001",
        "full_name": "Đặng Long Nhật",
        "email": "nhatdl.22it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Kỹ thuật Đám mây & Trí tuệ Nhân tạo",
        "cohort": "K22 (2022 - 2026)",
        "gpa": 3.65,
        "completed_credits": 78,
        "skills": ["Linux", "Docker", "AWS", "CI/CD", "Git", "Python", "Kubernetes", "PyTorch"],
        "target_major": "Kỹ thuật Đám mây & Vận hành Hệ thống",
        "target_major_id": "DEVOPS_CLOUD",
        "match_percentage": 88.5,
        "readiness_score": 92.0,
        "riasec_scores": {"R": 9, "I": 10, "A": 4, "S": 5, "E": 6, "C": 7},
        "completed_items": {
            "DO301": True, "DO302": True, "CS301": True, "CS302": True,
            "Hệ thống Tự động hóa Build & Deploy Microservices với GitHub Actions": True,
            "Google Cloud Professional Data Engineer": True, "AWS Certified SysOps": True
        }
    },
    {
        "student_id": "21020000",
        "full_name": "Nguyễn Văn An",
        "email": "annv.21it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
        "cohort": "K21 (2021 - 2025)",
        "gpa": 3.42,
        "completed_credits": 92,
        "skills": ["Python", "Machine Learning", "SQL", "Data Science", "Pandas", "Scikit-Learn"],
        "target_major": "Kỹ sư Trí tuệ Nhân tạo & Khoa học Dữ liệu",
        "target_major_id": "AI_DATA_SCIENCE",
        "match_percentage": 91.2,
        "readiness_score": 85.0,
        "riasec_scores": {"R": 6, "I": 9, "A": 5, "S": 5, "E": 7, "C": 8},
        "completed_items": {
            "CS402": True, "CS415": True, "DeepLearning.AI Machine Learning Specialization": True
        }
    },
    {
        "student_id": "22IT045",
        "full_name": "Trần Thị Mai Chi",
        "email": "chittm.22it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Kỹ thuật Phần mềm",
        "cohort": "K22 (2022 - 2026)",
        "gpa": 3.75,
        "completed_credits": 72,
        "skills": ["React", "TypeScript", "Node.js", "Next.js", "TailwindCSS", "PostgreSQL", "Git"],
        "target_major": "Kỹ sư Phát triển Web Toàn diện (Fullstack Web)",
        "target_major_id": "FULLSTACK_WEB",
        "match_percentage": 94.0,
        "readiness_score": 88.0,
        "riasec_scores": {"R": 5, "I": 7, "A": 9, "S": 8, "E": 6, "C": 7},
        "completed_items": {
            "WEB201": True, "WEB301": True, "Xây dựng Hệ thống E-Commerce Microservices": True
        }
    },
    {
        "student_id": "22IT102",
        "full_name": "Lê Hoàng Long",
        "email": "longlh.22it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "An toàn Thông tin",
        "cohort": "K22 (2022 - 2026)",
        "gpa": 3.15,
        "completed_credits": 68,
        "skills": ["Linux", "Network Security", "Cryptography", "Wireshark", "Bash", "Python"],
        "target_major": "Chuyên viên An toàn Thông tin (Cybersecurity)",
        "target_major_id": "CYBER_SECURITY",
        "match_percentage": 82.5,
        "readiness_score": 75.0,
        "riasec_scores": {"R": 8, "I": 9, "A": 4, "S": 4, "E": 6, "C": 9},
        "completed_items": {
            "SEC301": True, "CompTIA Security+": True
        }
    },
    {
        "student_id": "21IT089",
        "full_name": "Phạm Quốc Bảo",
        "email": "baopq.21it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Hệ thống Thông tin Quản lý",
        "cohort": "K21 (2021 - 2025)",
        "gpa": 2.95,
        "completed_credits": 88,
        "skills": ["SQL", "PowerBI", "Data Analysis", "Excel Advanced", "Business Analysis", "Python"],
        "target_major": "Chuyên viên Phân tích Dữ liệu Kinh doanh (Data Analytics & BI)",
        "target_major_id": "DATA_ANALYTICS",
        "match_percentage": 78.0,
        "readiness_score": 70.0,
        "riasec_scores": {"R": 4, "I": 7, "A": 5, "S": 8, "E": 9, "C": 8},
        "completed_items": {
            "BI201": True, "Microsoft Power BI Data Analyst Associate": True
        }
    },
    {
        "student_id": "SV-2025002",
        "full_name": "Nguyễn Văn Hoàng",
        "email": "hoangnv.22it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Công nghệ Thông tin",
        "cohort": "K22 (2022 - 2026)",
        "gpa": 3.52,
        "completed_credits": 76,
        "skills": ["Linux", "Docker", "Python", "FastAPI", "SQLite", "Git", "Nginx"],
        "target_major": "Kỹ thuật Đám mây & Vận hành Hệ thống",
        "target_major_id": "DEVOPS_CLOUD",
        "match_percentage": 86.0,
        "readiness_score": 82.5,
        "riasec_scores": {"R": 8, "I": 8, "A": 5, "S": 6, "E": 7, "C": 8},
        "completed_items": {
            "DO301": True, "Xây dựng Kiến trúc Cloud Gateway chịu tải cao": True
        }
    },
    {
        "student_id": "SV-2025003",
        "full_name": "Võ Thanh Phong",
        "email": "phongvt.22it@vku.udn.vn",
        "university": "Trường ĐH Công nghệ Thông tin & Truyền thông Việt - Hàn",
        "major": "Kỹ thuật Phần mềm",
        "cohort": "K22 (2022 - 2026)",
        "gpa": 3.58,
        "completed_credits": 74,
        "skills": ["React", "Next.js", "Zustand", "TypeScript", "TailwindCSS", "Vitest", "UI/UX"],
        "target_major": "Kỹ sư Phát triển Web Toàn diện (Fullstack Web)",
        "target_major_id": "FULLSTACK_WEB",
        "match_percentage": 90.5,
        "readiness_score": 87.0,
        "riasec_scores": {"R": 5, "I": 7, "A": 9, "S": 7, "E": 6, "C": 7},
        "completed_items": {
            "WEB201": True, "Thiết kế Giao diện Phân tích Trực quan Đa chiều": True
        }
    }
]

print(f"[*] 2. Bắt đầu nạp {len(STUDENTS)} hồ sơ sinh viên thực tế vào CSDL...")

for s in STUDENTS:
    sid = s["student_id"]
    # 2.1 user_profiles
    cursor.execute("""
    INSERT INTO user_profiles (student_id, full_name, cumulative_gpa, total_credits, detected_skills, courses_data, riasec_scores, career_tags, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
        full_name = excluded.full_name,
        cumulative_gpa = excluded.cumulative_gpa,
        total_credits = excluded.total_credits,
        detected_skills = excluded.detected_skills,
        riasec_scores = excluded.riasec_scores,
        career_tags = excluded.career_tags,
        updated_at = excluded.updated_at
    """, (
        sid,
        s["full_name"],
        s["gpa"],
        s["completed_credits"],
        json.dumps(s["skills"], ensure_ascii=False),
        json.dumps([], ensure_ascii=False),
        json.dumps(s["riasec_scores"]),
        json.dumps([s["target_major"]], ensure_ascii=False),
        now_str
    ))

    # 2.2 riasec_surveys
    answers = {str(i): 4 for i in range(1, 11)}
    dominant = max(s["riasec_scores"].items(), key=lambda x: x[1])[0]
    cursor.execute("""
    INSERT INTO riasec_surveys (student_id, answers_json, scores_json, dominant_code, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
        answers_json = excluded.answers_json,
        scores_json = excluded.scores_json,
        dominant_code = excluded.dominant_code,
        updated_at = excluded.updated_at
    """, (
        sid,
        json.dumps(answers),
        json.dumps(s["riasec_scores"]),
        dominant,
        now_str
    ))

    # 2.3 assessments
    assessment_payload = {
        "student_id": sid,
        "top_matches": [
            {
                "rank": 1,
                "major_id": s["target_major_id"],
                "major_name": s["target_major"],
                "match_percentage": s["match_percentage"],
                "match_score": s["match_percentage"],
                "radar_data": [
                    {"axis": "Chuyên môn Cốt lõi", "benchmark_score": 8.5, "user_score": 8.2},
                    {"axis": "Thực hành Đồ án", "benchmark_score": 8.0, "user_score": 8.5},
                    {"axis": "Công cụ & Môi trường", "benchmark_score": 8.0, "user_score": 8.0},
                    {"axis": "Kỹ năng Làm việc nhóm", "benchmark_score": 7.5, "user_score": 7.8},
                    {"axis": "Ngoại ngữ & Tài liệu", "benchmark_score": 7.0, "user_score": 7.2},
                    {"axis": "Tư duy Giải quyết Vấn đề", "benchmark_score": 8.5, "user_score": 8.4}
                ],
                "skill_gap": {
                    "mastered_skills": s["skills"],
                    "developing_skills": [],
                    "missing_skills": ["System Architecture", "Leadership"]
                }
            }
        ],
        "radar_chart_data": [
            {"axis": "Chuyên môn Cốt lõi", "benchmark_score": 8.5, "user_score": 8.2},
            {"axis": "Thực hành Đồ án", "benchmark_score": 8.0, "user_score": 8.5},
            {"axis": "Công cụ & Môi trường", "benchmark_score": 8.0, "user_score": 8.0},
            {"axis": "Kỹ năng Làm việc nhóm", "benchmark_score": 7.5, "user_score": 7.8},
            {"axis": "Ngoại ngữ & Tài liệu", "benchmark_score": 7.0, "user_score": 7.2},
            {"axis": "Tư duy Giải quyết Vấn đề", "benchmark_score": 8.5, "user_score": 8.4}
        ]
    }

    cursor.execute("""
    INSERT INTO assessments (student_id, target_career, assessment_data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
        target_career = excluded.target_career,
        assessment_data = excluded.assessment_data,
        updated_at = excluded.updated_at
    """, (
        sid,
        s["target_major"],
        json.dumps(assessment_payload, ensure_ascii=False),
        now_str,
        now_str
    ))

    # 2.4 roadmaps
    cursor.execute("""
    INSERT INTO roadmaps (student_id, target_major_id, target_major_name, job_readiness_percentage, phases_data, completed_items, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET
        target_major_id = excluded.target_major_id,
        target_major_name = excluded.target_major_name,
        job_readiness_percentage = excluded.job_readiness_percentage,
        completed_items = excluded.completed_items,
        updated_at = excluded.updated_at
    """, (
        sid,
        s["target_major_id"],
        s["target_major"],
        s["readiness_score"],
        json.dumps([]),
        json.dumps(s["completed_items"], ensure_ascii=False),
        now_str,
        now_str
    ))

    print(f"    [+] Đã nạp thành công: {sid} - {s['full_name']} (GPA: {s['gpa']}, Ngành: {s['target_major']})")

conn.commit()
conn.close()
print("[*] Hoàn tất chuẩn hóa CSDL sinh viên thành công 100%!")

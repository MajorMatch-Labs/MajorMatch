"""
Module Quản trị Cơ sở Dữ liệu SQLite - MajorMatch Persistent Storage.
Lưu trữ hồ sơ sinh viên, kết quả đánh giá kỹ năng và cây lộ trình học tập theo giai đoạn.
Đảm bảo dữ liệu bền vững (ACID) không bị mất khi khởi động lại ứng dụng.
"""

import os
import sqlite3
import json
import time
import hashlib
import secrets
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "majormatch.db")


def get_db_connection():
    """Tạo kết nối tới SQLite Database với chế độ WAL cho hiệu năng cao."""
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn


def init_db():
    """Khởi tạo cấu trúc các bảng dữ liệu nếu chưa tồn tại."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Bảng lưu trữ cây lộ trình học tập cá nhân hóa theo giai đoạn
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roadmaps (
        student_id TEXT PRIMARY KEY,
        target_major_id TEXT NOT NULL,
        target_major_name TEXT NOT NULL,
        job_readiness_percentage REAL NOT NULL,
        phases_data TEXT NOT NULL,
        completed_items TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # 2. Bảng lưu trữ kết quả phân tích khoảng cách kỹ năng (Skill Gap)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        student_id TEXT PRIMARY KEY,
        target_career TEXT NOT NULL,
        assessment_data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # 3. Bảng lưu trữ hồ sơ bảng điểm và thiên hướng sinh viên
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        student_id TEXT PRIMARY KEY,
        full_name TEXT,
        cumulative_gpa REAL,
        total_credits INTEGER,
        courses_data TEXT,
        detected_skills TEXT,
        riasec_scores TEXT,
        career_tags TEXT,
        updated_at TEXT NOT NULL
    );
    """)

    # 4. Bảng lưu trữ lịch sử đoạn chat với trợ lý AI
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        session_id TEXT DEFAULT 'default',
        created_at TEXT NOT NULL
    );
    """)

    # 5. Bảng lưu trữ kết quả và tiến trình khảo sát RIASEC
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS riasec_surveys (
        student_id TEXT PRIMARY KEY,
        answers_json TEXT NOT NULL,
        scores_json TEXT NOT NULL,
        dominant_code TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # 6. Bảng lưu trữ tài khoản người dùng / sinh viên (Authentication)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        student_id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        university TEXT DEFAULT 'Trường Đại học CNTT & TT Việt - Hàn (VKU)',
        major TEXT DEFAULT 'Khoa học Dữ liệu & Trí tuệ Nhân tạo',
        cohort TEXT DEFAULT 'K23',
        role TEXT DEFAULT 'student',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)

    # Nâng cấp bảng chat_history nếu chưa có cột session_id
    try:
        cursor.execute("ALTER TABLE chat_history ADD COLUMN session_id TEXT DEFAULT 'default';")
    except Exception:
        pass

    # Nâng cấp bảng users nếu chưa có cột role
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';")
    except Exception:
        pass

    # Tự động khởi tạo tài khoản Admin mặc định chuẩn (admin / admin123)
    try:
        cursor.execute("SELECT student_id FROM users WHERE student_id = 'admin';")
        if not cursor.fetchone():
            admin_pwd = hash_password("admin123")
            now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            cursor.execute("""
            INSERT INTO users (student_id, email, password_hash, full_name, university, major, cohort, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                "admin",
                "admin@majormatch.vku.udn.vn",
                admin_pwd,
                "Quản trị viên Hệ thống (Site Admin)",
                "VKU - MajorMatch Core Team",
                "Hệ thống Quản trị Đào tạo",
                "ADMIN",
                "admin",
                now_iso,
                now_iso
            ))
    except Exception:
        pass

    conn.commit()
    conn.close()


# =============================================================================
# CÁC THAO TÁC CRUD CHO LỘ TRÌNH (ROADMAP)
# =============================================================================

def save_roadmap(
    student_id: str,
    target_major_id: str,
    target_major_name: str,
    job_readiness: float,
    phases: List[Dict[str, Any]],
    completed_items: Optional[Dict[str, bool]] = None
) -> None:
    """Lưu mới hoặc cập nhật toàn bộ lộ trình học tập vào CSDL."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    completed_str = json.dumps(completed_items or {})
    phases_str = json.dumps(phases, ensure_ascii=False)

    with conn:
        conn.execute("""
        INSERT INTO roadmaps (
            student_id, target_major_id, target_major_name, job_readiness_percentage,
            phases_data, completed_items, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
            target_major_id = excluded.target_major_id,
            target_major_name = excluded.target_major_name,
            job_readiness_percentage = excluded.job_readiness_percentage,
            phases_data = excluded.phases_data,
            updated_at = excluded.updated_at;
        """, (
            student_id, target_major_id, target_major_name, job_readiness,
            phases_str, completed_str, now_str, now_str
        ))
    conn.close()


def get_roadmap(student_id: str) -> Optional[Dict[str, Any]]:
    """Truy vấn lộ trình đã lưu của sinh viên từ CSDL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT student_id, target_major_id, target_major_name, job_readiness_percentage,
           phases_data, completed_items, created_at, updated_at
    FROM roadmaps
    WHERE student_id = ?;
    """, (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    try:
        phases = json.loads(row["phases_data"])
    except Exception:
        phases = []

    try:
        completed = json.loads(row["completed_items"])
    except Exception:
        completed = {}

    return {
        "student_id": row["student_id"],
        "target_major": row["target_major_name"],
        "target_major_id": row["target_major_id"],
        "job_readiness_percentage": row["job_readiness_percentage"],
        "readiness_score": row["job_readiness_percentage"],
        "semesters": phases,  # Tương thích ngược với UI
        "phases": phases,
        "completed_items": completed,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


def update_roadmap_progress(
    student_id: str,
    completed_items: Dict[str, bool],
    readiness_score: float
) -> bool:
    """Cập nhật tiến độ hoàn thành các checkbox môn học/đồ án và điểm sẵn sàng vào CSDL & tự động đồng bộ sang bảng assessments."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    completed_str = json.dumps(completed_items)

    with conn:
        cursor = conn.execute("""
        UPDATE roadmaps
        SET completed_items = ?,
            job_readiness_percentage = ?,
            updated_at = ?
        WHERE student_id = ?;
        """, (completed_str, readiness_score, now_str, student_id))
        updated = cursor.rowcount > 0

        # Tự động hòa trộn tiến độ vào bảng assessments nếu có
        try:
            r_row = conn.execute("SELECT target_major_id FROM roadmaps WHERE student_id = ?", (student_id,)).fetchone()
            a_row = conn.execute("SELECT assessment_data, target_career FROM assessments WHERE student_id = ?", (student_id,)).fetchone()
            if r_row and a_row:
                target_major_id = r_row["target_major_id"]
                data = json.loads(a_row["assessment_data"])
                matches = data.get("top_matches", [])
                for m in matches:
                    if m.get("major_id") == target_major_id:
                        m["match_percentage"] = round(readiness_score, 1)
                        m["match_score"] = round(readiness_score, 1)
                        sg = m.get("skill_gap", {})
                        raw_missing = sg.get("missing_skills", [])
                        raw_mastered = sg.get("mastered_skills", [])

                        if readiness_score >= 99.5:
                            all_s = raw_mastered + raw_missing
                            sg["mastered_skills"] = list(dict.fromkeys(all_s))
                            sg["missing_skills"] = []
                            for axis in m.get("radar_data", []):
                                axis["user_score"] = max(axis.get("benchmark_score", 8.0), 9.5)
                            # Đưa lên xếp hạng #1
                            matches.remove(m)
                            matches.insert(0, m)
                            for idx, item in enumerate(matches):
                                item["rank"] = idx + 1
                            data["skill_breakdown"] = sg
                            data["radar_chart_data"] = m.get("radar_data", [])
                        else:
                            total_s = max(len(raw_missing) + len(raw_mastered), 1)
                            frac = min(1.0, max(0.0, readiness_score / 100.0))
                            target_mastered_count = int(frac * total_s)
                            all_skills = list(dict.fromkeys(raw_mastered + raw_missing))
                            sg["mastered_skills"] = all_skills[:target_mastered_count]
                            sg["missing_skills"] = all_skills[target_mastered_count:]

                        m["skill_gap"] = sg
                        break
                data["top_matches"] = matches
                conn.execute(
                    "UPDATE assessments SET assessment_data = ?, updated_at = ? WHERE student_id = ?",
                    (json.dumps(data, ensure_ascii=False), now_str, student_id)
                )
        except Exception:
            pass

    conn.close()
    return updated


# =============================================================================
# CÁC THAO TÁC CRUD CHO ĐÁNH GIÁ KỸ NĂNG (ASSESSMENT)
# =============================================================================

def save_assessment(student_id: str, target_career: str, assessment_dict: Dict[str, Any]) -> None:
    """Lưu kết quả phân tích khoảng cách kỹ năng (Skill Gap) vào CSDL."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    data_str = json.dumps(assessment_dict, ensure_ascii=False)

    with conn:
        conn.execute("""
        INSERT INTO assessments (student_id, target_career, assessment_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
            target_career = excluded.target_career,
            assessment_data = excluded.assessment_data,
            updated_at = excluded.updated_at;
        """, (student_id, target_career, data_str, now_str, now_str))
    conn.close()


def get_assessment(student_id: str) -> Optional[Dict[str, Any]]:
    """Lấy kết quả đánh giá kỹ năng đã lưu gần nhất của sinh viên."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT student_id, target_career, assessment_data, updated_at
    FROM assessments
    WHERE student_id = ?;
    """, (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    try:
        data = json.loads(row["assessment_data"])
    except Exception:
        data = {}

    return {
        "student_id": row["student_id"],
        "target_career": row["target_career"],
        "assessment": data,
        "updated_at": row["updated_at"]
    }


# =============================================================================
# CÁC THAO TÁC CRUD CHO LỊCH SỬ CHAT (CHAT HISTORY)
# =============================================================================

def save_chat_message(student_id: str, role: str, content: str, session_id: str = "default") -> None:
    """Lưu một tin nhắn hội thoại vào CSDL SQLite kèm session_id."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with conn:
        try:
            conn.execute("""
            INSERT INTO chat_history (student_id, role, content, session_id, created_at)
            VALUES (?, ?, ?, ?, ?);
            """, (student_id, role, content, session_id, now_str))
        except Exception:
            conn.execute("""
            INSERT INTO chat_history (student_id, role, content, created_at)
            VALUES (?, ?, ?, ?);
            """, (student_id, role, content, now_str))
    conn.close()


def get_chat_history(student_id: str, session_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Truy xuất lịch sử hội thoại của sinh viên theo session_id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if session_id:
            cursor.execute("""
            SELECT role, content, session_id, created_at
            FROM chat_history
            WHERE student_id = ? AND session_id = ?
            ORDER BY id ASC
            LIMIT ?;
            """, (student_id, session_id, limit))
        else:
            cursor.execute("""
            SELECT role, content, session_id, created_at
            FROM chat_history
            WHERE student_id = ?
            ORDER BY id ASC
            LIMIT ?;
            """, (student_id, limit))
        rows = cursor.fetchall()
        messages = [
            {
                "role": row["role"],
                "content": row["content"],
                "session_id": row["session_id"] if "session_id" in row.keys() else "default",
                "created_at": row["created_at"]
            }
            for row in rows
        ]
    except Exception:
        cursor.execute("""
        SELECT role, content, created_at
        FROM chat_history
        WHERE student_id = ?
        ORDER BY id ASC
        LIMIT ?;
        """, (student_id, limit))
        rows = cursor.fetchall()
        messages = [
            {
                "role": row["role"],
                "content": row["content"],
                "session_id": "default",
                "created_at": row["created_at"]
            }
            for row in rows
        ]
    conn.close()
    return messages


def get_chat_sessions(student_id: str) -> List[Dict[str, Any]]:
    """Lấy danh sách các phiên tư vấn AI của sinh viên."""
    conn = get_db_connection()
    cursor = conn.cursor()
    sessions = []
    try:
        cursor.execute("""
        SELECT session_id, COUNT(*) as msg_count, MAX(created_at) as last_activity
        FROM chat_history
        WHERE student_id = ?
        GROUP BY session_id
        ORDER BY last_activity DESC;
        """, (student_id,))
        for row in cursor.fetchall():
            sid = row["session_id"] or "default"
            c2 = conn.cursor()
            c2.execute("SELECT content FROM chat_history WHERE student_id = ? AND session_id = ? ORDER BY id DESC LIMIT 1;", (student_id, sid))
            last_msg_row = c2.fetchone()
            last_msg = last_msg_row["content"] if last_msg_row else ""
            if len(last_msg) > 80:
                last_msg = last_msg[:80] + "..."
            sessions.append({
                "session_id": sid,
                "message_count": row["msg_count"],
                "last_message": last_msg,
                "updated_at": row["last_activity"]
            })
    except Exception:
        cursor.execute("SELECT COUNT(*), MAX(created_at) FROM chat_history WHERE student_id = ?;", (student_id,))
        r = cursor.fetchone()
        if r and r[0] > 0:
            sessions.append({
                "session_id": "default",
                "message_count": r[0],
                "last_message": "Phiên trò chuyện mặc định",
                "updated_at": r[1]
            })
    conn.close()
    return sessions


def clear_chat_history(student_id: str) -> None:
    """Xóa lịch sử chat của sinh viên."""
    conn = get_db_connection()
    with conn:
        conn.execute("DELETE FROM chat_history WHERE student_id = ?;", (student_id,))
    conn.close()


# =============================================================================
# CÁC THAO TÁC CRUD CHO KHẢO SÁT RIASEC (RIASEC SURVEY)
# =============================================================================

def save_riasec_survey(
    student_id: str,
    answers: Dict[str, Any],
    scores: Dict[str, float],
    dominant_code: str
) -> None:
    """Lưu toàn bộ câu trả lời và điểm trắc nghiệm RIASEC vào CSDL SQLite."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    answers_str = json.dumps(answers, ensure_ascii=False)
    scores_str = json.dumps(scores)

    with conn:
        conn.execute("""
        INSERT INTO riasec_surveys (student_id, answers_json, scores_json, dominant_code, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
            answers_json = excluded.answers_json,
            scores_json = excluded.scores_json,
            dominant_code = excluded.dominant_code,
            updated_at = excluded.updated_at;
        """, (student_id, answers_str, scores_str, dominant_code, now_str))

        try:
            conn.execute("""
            UPDATE user_profiles
            SET riasec_scores = ?, updated_at = ?
            WHERE student_id = ?;
            """, (scores_str, now_str, student_id))
        except Exception:
            pass
    conn.close()


def get_riasec_survey(student_id: str) -> Optional[Dict[str, Any]]:
    """Truy xuất bài khảo sát RIASEC đã lưu của sinh viên."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT student_id, answers_json, scores_json, dominant_code, updated_at
    FROM riasec_surveys
    WHERE student_id = ?;
    """, (student_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    try:
        answers = json.loads(row["answers_json"])
    except Exception:
        answers = {}

    try:
        scores = json.loads(row["scores_json"])
    except Exception:
        scores = {}

    return {
        "student_id": row["student_id"],
        "answers": answers,
        "scores": scores,
        "dominant_code": row["dominant_code"],
        "updated_at": row["updated_at"]
    }


# =============================================================================
# CÁC THAO TÁC CÁ NHÂN HÓA & QUẢN TRỊ ADMIN (PERSONALIZATION & ADMIN AGGREGATION)
# =============================================================================

def get_user_full_state(student_id: str) -> Dict[str, Any]:
    """Tổng hợp toàn bộ trạng thái cá nhân của sinh viên từ mọi bảng dữ liệu."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Profile
    cursor.execute("SELECT * FROM user_profiles WHERE student_id = ?", (student_id,))
    p_row = cursor.fetchone()
    profile = None
    if p_row:
        try:
            courses = json.loads(p_row["courses_data"]) if p_row["courses_data"] else []
        except Exception:
            courses = []
        try:
            skills = json.loads(p_row["detected_skills"]) if p_row["detected_skills"] else []
        except Exception:
            skills = []
        try:
            r_scores = json.loads(p_row["riasec_scores"]) if p_row["riasec_scores"] else {}
        except Exception:
            r_scores = {}
        try:
            tags = json.loads(p_row["career_tags"]) if p_row["career_tags"] else []
        except Exception:
            tags = []
        profile = {
            "student_id": p_row["student_id"],
            "full_name": p_row["full_name"],
            "cumulative_gpa": p_row["cumulative_gpa"],
            "total_credits": p_row["total_credits"],
            "courses": courses,
            "detected_skills": skills,
            "riasec_scores": r_scores,
            "career_tags": tags,
            "updated_at": p_row["updated_at"]
        }

    # 2. RIASEC Survey
    cursor.execute("SELECT * FROM riasec_surveys WHERE student_id = ?", (student_id,))
    s_row = cursor.fetchone()
    survey = None
    if s_row:
        try:
            survey = {
                "student_id": s_row["student_id"],
                "answers": json.loads(s_row["answers_json"]),
                "scores": json.loads(s_row["scores_json"]),
                "dominant_code": s_row["dominant_code"],
                "updated_at": s_row["updated_at"]
            }
        except Exception:
            pass

    # 3. Assessment
    cursor.execute("SELECT * FROM assessments WHERE student_id = ?", (student_id,))
    a_row = cursor.fetchone()
    assessment = None
    if a_row:
        try:
            assessment = {
                "student_id": a_row["student_id"],
                "target_career": a_row["target_career"],
                "assessment": json.loads(a_row["assessment_data"]),
                "updated_at": a_row["updated_at"]
            }
        except Exception:
            pass

    # 4. Roadmap
    cursor.execute("SELECT * FROM roadmaps WHERE student_id = ?", (student_id,))
    r_row = cursor.fetchone()
    roadmap = None
    if r_row:
        try:
            roadmap = {
                "student_id": r_row["student_id"],
                "target_major": r_row["target_major_name"],
                "target_major_id": r_row["target_major_id"],
                "job_readiness_percentage": r_row["job_readiness_percentage"],
                "completed_items": json.loads(r_row["completed_items"]),
                "updated_at": r_row["updated_at"]
            }
        except Exception:
            pass

    # 5. Chat message count
    cursor.execute("SELECT COUNT(*) FROM chat_history WHERE student_id = ?", (student_id,))
    chat_count = cursor.fetchone()[0]

    conn.close()

    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return {
        "student_id": student_id,
        "profile": profile,
        "riasec_survey": survey,
        "assessment": assessment,
        "roadmap": roadmap,
        "chat_message_count": chat_count,
        "updated_at": now_str
    }


def get_all_students_admin() -> List[Dict[str, Any]]:
    """Lấy danh sách tất cả sinh viên tổng hợp phục vụ giao diện Site Admin và xuất báo cáo CSV/JSON."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT DISTINCT student_id FROM (
        SELECT student_id FROM user_profiles
        UNION
        SELECT student_id FROM assessments
        UNION
        SELECT student_id FROM roadmaps
        UNION
        SELECT student_id FROM riasec_surveys
    )
    ORDER BY student_id ASC;
    """)
    student_ids = [r[0] for r in cursor.fetchall()]
    conn.close()

    result = []
    for sid in student_ids:
        state = get_user_full_state(sid)
        p = state.get("profile") or {}
        a = state.get("assessment") or {}
        r = state.get("roadmap") or {}
        s = state.get("riasec_survey") or {}

        top_match = "Chưa đánh giá"
        match_score = 0.0
        if a and "assessment" in a and isinstance(a["assessment"], dict):
            matches = a["assessment"].get("top_matches", [])
            if matches and len(matches) > 0:
                top_match = matches[0].get("major_name", "Chưa xác định")
                match_score = matches[0].get("match_percentage", 0.0)

        result.append({
            "student_id": sid,
            "full_name": p.get("full_name") or f"Sinh viên {sid}",
            "cumulative_gpa": p.get("cumulative_gpa", 0.0),
            "total_credits": p.get("total_credits", 0),
            "top_recommended_major": top_match,
            "match_score": match_score,
            "readiness_score": r.get("job_readiness_percentage", 0.0),
            "dominant_riasec": s.get("dominant_code", "N/A"),
            "has_survey": bool(s),
            "has_roadmap": bool(r),
            "chat_count": state.get("chat_message_count", 0),
            "updated_at": state.get("updated_at")
        })

    return result


# =============================================================================
# CÁC HÀM XÁC THỰC VÀ QUẢN TRỊ NGƯỜI DÙNG (REAL AUTHENTICATION)
# =============================================================================

def hash_password(password: str) -> str:
    """Băm mật khẩu an toàn với Salt ngẫu nhiên bằng SHA-256."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Xác thực mật khẩu đối chiếu với chuỗi hash đã lưu."""
    if not stored_hash or "$" not in stored_hash:
        return False
    salt, hashed = stored_hash.split("$", 1)
    test_hash = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(hashed, test_hash)


def create_user(
    student_id: str,
    email: str,
    password: str,
    full_name: str,
    university: str = "Trường Đại học CNTT & TT Việt - Hàn (VKU)",
    major: str = "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
    cohort: str = "K23"
) -> Dict[str, Any]:
    """Tạo người dùng mới trong CSDL SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    clean_student_id = student_id.strip()
    clean_email = email.strip().lower()

    # Chặn đăng ký tài khoản có định danh hoặc quyền admin
    if clean_student_id.lower() in ["admin", "root", "administrator"] or clean_email.startswith("admin@"):
        conn.close()
        raise ValueError("Không được phép đăng ký tài khoản với định danh Quản trị viên (Admin). Vui lòng sử dụng tài khoản admin được cấp sẵn.")

    # Kiểm tra trùng lặp MSSV hoặc Email
    cursor.execute(
        "SELECT student_id, email FROM users WHERE student_id = ? OR email = ?",
        (clean_student_id, clean_email)
    )
    existing = cursor.fetchone()
    if existing:
        conn.close()
        if existing["student_id"] == clean_student_id:
            raise ValueError(f"Mã số sinh viên '{student_id}' đã tồn tại trong hệ thống.")
        else:
            raise ValueError(f"Email '{email}' đã được đăng ký.")

    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    pwd_hash = hash_password(password)

    cursor.execute("""
    INSERT INTO users (student_id, email, password_hash, full_name, university, major, cohort, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        clean_student_id,
        clean_email,
        pwd_hash,
        full_name.strip(),
        university.strip(),
        major.strip(),
        cohort.strip(),
        "student",
        now,
        now
    ))
    conn.commit()
    conn.close()

    return {
        "student_id": clean_student_id,
        "email": clean_email,
        "full_name": full_name.strip(),
        "university": university.strip(),
        "major": major.strip(),
        "cohort": cohort.strip(),
        "role": "student",
        "created_at": now
    }


def authenticate_user(identifier: str, password: str) -> Optional[Dict[str, Any]]:
    """Xác thực người dùng bằng MSSV hoặc Email."""
    conn = get_db_connection()
    cursor = conn.cursor()
    clean_id = identifier.strip().lower()

    cursor.execute("""
    SELECT student_id, email, password_hash, full_name, university, major, cohort, role, created_at
    FROM users
    WHERE LOWER(student_id) = ? OR LOWER(email) = ?;
    """, (clean_id, clean_id))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    if not verify_password(password, row["password_hash"]):
        return None

    user_role = row["role"] if "role" in row.keys() and row["role"] else ("admin" if row["student_id"] == "admin" else "student")

    return {
        "student_id": row["student_id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "university": row["university"] or "Trường Đại học CNTT & TT Việt - Hàn (VKU)",
        "major": row["major"] or "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
        "cohort": row["cohort"] or "K23",
        "role": user_role,
        "created_at": row["created_at"]
    }


def get_user_by_id(student_id: str) -> Optional[Dict[str, Any]]:
    """Truy xuất thông tin công khai của người dùng theo MSSV."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT student_id, email, full_name, university, major, cohort, role, created_at
    FROM users
    WHERE student_id = ?;
    """, (student_id.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    user_role = row["role"] if "role" in row.keys() and row["role"] else ("admin" if row["student_id"] == "admin" else "student")

    return {
        "student_id": row["student_id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "university": row["university"] or "Trường Đại học CNTT & TT Việt - Hàn (VKU)",
        "major": row["major"] or "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
        "cohort": row["cohort"] or "K23",
        "role": user_role,
        "created_at": row["created_at"]
    }


# =============================================================================
# CÁC THAO TÁC LƯU TRỮ HỒ SƠ BẢNG ĐIỂM (USER PROFILES PERSISTENCE)
# =============================================================================

def save_user_profile(
    student_id: str,
    full_name: str,
    cumulative_gpa: float,
    total_credits: int,
    courses: List[Dict[str, Any]],
    detected_skills: List[str],
    riasec_scores: Optional[Dict[str, float]] = None,
    career_tags: Optional[List[str]] = None
) -> None:
    """Lưu mới hoặc cập nhật toàn bộ thông tin hồ sơ bảng điểm/CV vào CSDL SQLite."""
    conn = get_db_connection()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    courses_json = json.dumps(courses)
    skills_json = json.dumps(detected_skills)
    riasec_json = json.dumps(riasec_scores or {})
    tags_json = json.dumps(career_tags or [])

    with conn:
        conn.execute("""
        INSERT INTO user_profiles (student_id, full_name, cumulative_gpa, total_credits, courses_data, detected_skills, riasec_scores, career_tags, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
            full_name = excluded.full_name,
            cumulative_gpa = excluded.cumulative_gpa,
            total_credits = excluded.total_credits,
            courses_data = excluded.courses_data,
            detected_skills = excluded.detected_skills,
            riasec_scores = CASE WHEN excluded.riasec_scores != '{}' THEN excluded.riasec_scores ELSE user_profiles.riasec_scores END,
            career_tags = CASE WHEN excluded.career_tags != '[]' THEN excluded.career_tags ELSE user_profiles.career_tags END,
            updated_at = excluded.updated_at;
        """, (
            student_id.strip(),
            full_name.strip(),
            float(cumulative_gpa),
            int(total_credits),
            courses_json,
            skills_json,
            riasec_json,
            tags_json,
            now_str
        ))
    conn.close()


def get_user_profile(student_id: str) -> Optional[Dict[str, Any]]:
    """Truy xuất hồ sơ bảng điểm và kỹ năng của sinh viên theo student_id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profiles WHERE student_id = ?;", (student_id.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    try:
        courses = json.loads(row["courses_data"]) if row["courses_data"] else []
    except Exception:
        courses = []
    try:
        skills = json.loads(row["detected_skills"]) if row["detected_skills"] else []
    except Exception:
        skills = []
    try:
        r_scores = json.loads(row["riasec_scores"]) if row["riasec_scores"] else {}
    except Exception:
        r_scores = {}
    try:
        tags = json.loads(row["career_tags"]) if row["career_tags"] else []
    except Exception:
        tags = []

    return {
        "student_id": row["student_id"],
        "full_name": row["full_name"],
        "cumulative_gpa": row["cumulative_gpa"],
        "total_credits": row["total_credits"],
        "courses": courses,
        "detected_skills": skills,
        "riasec_scores": r_scores,
        "career_tags": tags,
        "updated_at": row["updated_at"]
    }




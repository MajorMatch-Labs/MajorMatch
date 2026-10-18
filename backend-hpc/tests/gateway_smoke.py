"""Exercise the EC2 gateway against an isolated, temporary SQLite database."""

import os
import sqlite3
import sys
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="majormatch-gateway-smoke-") as temp_dir:
        temp_home = Path(temp_dir)
        (temp_home / "data").mkdir()
        os.environ["MAJORMATCH_DB_PATH"] = str(temp_home / "data" / "majormatch.db")
        os.environ["MAJORMATCH_BACKUP_DIR"] = str(temp_home / "data" / "backups")
        os.environ["HPC_BASE_URL"] = "http://127.0.0.1:1"
        os.environ.pop("MAJORMATCH_ADMIN_PASSWORD", None)
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

        import cloud_gateway

        assert Path(cloud_gateway.DB_PATH) == temp_home / "data" / "majormatch.db"
        with sqlite3.connect(cloud_gateway.DB_PATH) as database:
            assert database.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0
        database.close()

        with TestClient(cloud_gateway.app) as client:
            health = client.get("/api/v1/health")
            assert health.status_code == 200, health.text
            assert health.json()["status"] == "healthy"
            assert client.get("/api/v1/admin/table/users").status_code == 401
            assert client.get("/api/v1/admin/stats").status_code == 401
            assert client.get("/api/v1/admin/students").status_code == 401
            assert client.get("/api/v1/admin/export").status_code == 401
            assert client.get("/api/v1/admin/audit").status_code == 401
            assert client.post("/api/v1/admin/backup").status_code == 401
            assert client.delete("/api/v1/admin/table/user_profiles/SMOKE-001").status_code == 401

            user = {
                "student_id": "SMOKE-001",
                "email": "smoke@example.invalid",
                "password": "temporary-test-password",
                "full_name": "Smoke Test",
            }
            register = client.post("/api/v1/auth/register", json=user)
            assert register.status_code == 200, register.text
            login = client.post(
                "/api/v1/auth/login",
                json={"identifier": user["email"], "password": user["password"]},
            )
            assert login.status_code == 200, login.text
            assert login.json()["user"]["student_id"] == user["student_id"]
            student_headers = {"Authorization": f"Bearer {login.json()['token']}"}
            assert client.get("/api/v1/admin/stats", headers=student_headers).status_code == 401
            assert client.post("/api/v1/auth/register", json={**user, "student_id": "admin", "email": "another@example.invalid"}).status_code == 400

            with sqlite3.connect(cloud_gateway.DB_PATH) as database:
                database.execute(
                    "INSERT INTO users (student_id, email, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    ("admin", "admin@example.invalid", cloud_gateway.hash_password("test-admin-password"), "Admin", "admin", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"),
                )
                database.commit()
            database.close()

            admin_login = client.post(
                "/api/v1/auth/login", json={"identifier": "admin", "password": "test-admin-password"}
            )
            assert admin_login.status_code == 200, admin_login.text
            assert admin_login.json()["token"].startswith("mm_admin_v1.")
            admin_headers = {"Authorization": f"Bearer {admin_login.json()['token']}"}
            assert client.get("/api/v1/admin/stats", headers=admin_headers).status_code == 200
            assert client.get("/api/v1/admin/stats", headers={"Authorization": "Bearer mm_admin_v1.0.invalid.invalid"}).status_code == 401
            students = client.get("/api/v1/admin/students", headers=admin_headers)
            assert students.status_code == 200, students.text
            assert students.json()["total"] == 1
            smoke_student = next(item for item in students.json()["students"] if item["student_id"] == user["student_id"])
            assert smoke_student["full_name"] == user["full_name"]
            assert smoke_student["has_account"] is True
            assert smoke_student["has_profile"] is False
            assert smoke_student["has_assessment"] is False
            assert smoke_student["cumulative_gpa"] is None
            assert smoke_student["match_score"] is None
            users_table = client.get("/api/v1/admin/table/users", headers=admin_headers)
            assert users_table.status_code == 200, users_table.text
            assert "password_hash" not in str(users_table.json())
            users_export = client.get("/api/v1/admin/export?format=json&table=users", headers=admin_headers)
            assert users_export.status_code == 200, users_export.text
            assert "password_hash" not in str(users_export.json())
            users_csv = client.get("/api/v1/admin/export?format=csv&table=users", headers=admin_headers)
            assert users_csv.status_code == 200, users_csv.text
            assert "password_hash" not in users_csv.text
            backup = client.post("/api/v1/admin/backup", headers=admin_headers)
            assert backup.status_code == 200, backup.text
            backup_path = temp_home / "data" / "backups" / backup.json()["filename"]
            assert backup_path.is_file()
            snapshot = sqlite3.connect(backup_path)
            try:
                assert snapshot.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 2
            finally:
                snapshot.close()
            assert client.get("/api/v1/admin/stats", headers=admin_headers).json()["backup_count"] == 1
            audit = client.get("/api/v1/admin/audit", headers=admin_headers)
            assert audit.status_code == 200, audit.text
            assert {entry["action"] for entry in audit.json()["events"]} >= {"login", "export", "backup"}
            assert "password_hash" not in str(audit.json())
            assert client.delete("/api/v1/admin/table/users/admin", headers=admin_headers).status_code == 400
            with sqlite3.connect(cloud_gateway.DB_PATH) as database:
                database.execute(
                    "UPDATE users SET password_hash = ? WHERE student_id = 'admin'",
                    (cloud_gateway.hash_password("rotated-test-password"),),
                )
                database.commit()
            database.close()
            assert client.get("/api/v1/admin/stats", headers=admin_headers).status_code == 401

        with sqlite3.connect(cloud_gateway.DB_PATH) as database:
            assert database.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 2
        database.close()

    print("Gateway smoke test passed")


if __name__ == "__main__":
    main()

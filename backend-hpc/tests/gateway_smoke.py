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
        os.environ["HOME"] = str(temp_home)
        os.environ["HPC_BASE_URL"] = "http://127.0.0.1:1"
        os.environ.pop("MAJORMATCH_ADMIN_PASSWORD", None)
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

        import cloud_gateway

        assert Path(cloud_gateway.DB_PATH) == temp_home / "data" / "majormatch.db"
        with sqlite3.connect(cloud_gateway.DB_PATH) as database:
            assert database.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0

        with TestClient(cloud_gateway.app) as client:
            health = client.get("/api/v1/health")
            assert health.status_code == 200, health.text
            assert health.json()["status"] == "healthy"
            assert client.get("/api/v1/admin/table/users").status_code == 400

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

        with sqlite3.connect(cloud_gateway.DB_PATH) as database:
            assert database.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1

    print("Gateway smoke test passed")


if __name__ == "__main__":
    main()

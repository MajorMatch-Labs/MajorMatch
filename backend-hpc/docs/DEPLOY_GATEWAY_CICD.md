# EC2 gateway CI/CD

The EC2 gateway is the FastAPI process managed by `majormatch-gateway.service` at
`127.0.0.1:8001`. Its live source is `/home/ubuntu/gateway/cloud_gateway.py`.
The SQLite database remains at `/home/ubuntu/data/majormatch.db`.

## Delivery flow

1. A pull request touching the gateway, its smoke test, requirements, deploy
   script, or workflow runs syntax and isolated API checks. Pull requests never
   deploy to EC2.
2. After review and merge to `main`, the same checks run again. GitHub Actions
   packages the gateway files and sends the package to EC2 over SSH.
3. EC2 verifies dependencies and runs the smoke test against a temporary
   SQLite database. The deploy script makes a consistent SQLite backup using
   `sqlite3.Connection.backup()`, saves the previous Python file, installs the
   candidate file, and restarts `majormatch-gateway.service`.
4. The deploy succeeds only after `/api/v1/health` reports `healthy`. On a
   failed restart or health check, the previous Python file is restored and
   the service is restarted. Database snapshots are retained for manual
   recovery; automatic database rollback is intentionally avoided because
   requests could have written new records during the deploy.

The workflow uses repository Actions secrets `EC2_HOST`, `EC2_USER`,
`EC2_SSH_KEY`, and `EC2_SSH_HOST_KEY`. The last secret contains the trusted
public SSH host key line for the EC2 host. The deployment user needs
passwordless `sudo` for `systemctl restart majormatch-gateway.service`.

The EC2 installation keeps its existing virtual environment. The minimal
gateway dependencies are in `requirements-gateway.txt`; heavy HPC packages
are deliberately excluded from the EC2 install.

## Verify a deployment

```bash
cat /home/ubuntu/gateway/deployed-sha
systemctl is-active majormatch-gateway.service
curl --fail http://127.0.0.1:8001/api/v1/health
ls -lh /home/ubuntu/gateway/backups/code /home/ubuntu/data/backups
```

The `deployed-sha` file is written only after a successful health check. A
healthy gateway can report the private HPC node as `offline`; the EC2 fallback
still serves requests in that state.

Admin account creation requires `MAJORMATCH_ADMIN_PASSWORD` in the gateway
service environment. No default admin password is embedded in the source.

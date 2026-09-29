# Sandbox deploy runbook

- **What:** Next.js app (`web/`) built by root `Dockerfile` (standalone output, port 3000).
- **Where:** docker-sandbox (`root@192.168.0.213`), https://icos.sandbox.thestarrynight.dev
- **Files on host:** checkout `/opt/sandbox/apps/image_consultant_os`, compose `/opt/sandbox/compose/image-consultant-os/compose.yml`
- **Routing:** covered by the `sandbox-wildcard` Traefik route via the Coolify proxy (no `homelab.*` labels, no SSO). Synthetic data only — do not put real client data here.
- **Deployed:** 2026-09-28 with `homelab-ops/scripts/sandbox/deploy-demo`.

## Redeploy after a push
```bash
cd ~/projects/homelab-ops
scripts/sandbox/deploy-demo --repo https://github.com/AdrianRomo/image_consultant_os.git \
  --name image-consultant-os --checkout-name image_consultant_os \
  --template generic-web --container-port 3000 \
  --domain icos.sandbox.thestarrynight.dev --apply
```
(Omit `--apply` for a dry run.)

## Revert / remove
```bash
ssh root@192.168.0.213 'docker compose -f /opt/sandbox/compose/image-consultant-os/compose.yml down'
# optional: rm -r /opt/sandbox/compose/image-consultant-os /opt/sandbox/apps/image_consultant_os
```
No volumes, secrets or backups involved; nothing else was changed.

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

## 2026-09-29 — deployed from PR branch
- Deployed `atelier-visual-iteration` (PR #2) with `--branch atelier-visual-iteration`; the host checkout is on that branch until you redeploy `main` (default `--branch main`) after merging.
- Host had an untracked `.env` that made the checkout "dirty"; I added `.env` to `/opt/sandbox/apps/image_consultant_os/.git/info/exclude` (revert: delete that line) and to the repo `.gitignore`. `.env` itself was not read or changed.
- Roll back to the previous build: redeploy with `--branch main` from before the merge (commit `d8cde1b`).

## 2026-09-29 — temporary public demo via Cloudflare Tunnel
- `main` (PR #2 merged) is deployed on docker-sandbox; the host checkout is back on `main`.
- Tunnel connector: container `cloudflared-icos-cloudflared-1`, compose `/opt/sandbox/compose/cloudflared-icos/compose.yml` on the `coolify` network. Token is in `/opt/sandbox/compose/cloudflared-icos/.env` (root-only, 600) — never commit it.
- Cloudflare dashboard (Zero Trust → Networks → Tunnels): public hostname `icos.thestarrynight.dev` → HTTP → `image-consultant-os-web-1:3000`.
- The app has no auth. Recommended: a Cloudflare Access policy (one-time PIN, allowed emails) on that hostname while it is public.
- **Turn off:** `ssh root@192.168.0.213 'docker compose -f /opt/sandbox/compose/cloudflared-icos/compose.yml down'`, then delete the public hostname (and its DNS record) in the dashboard. Optional cleanup: delete the tunnel and `rm -r /opt/sandbox/compose/cloudflared-icos`.
- The tunnel is outbound-only: no router or firewall changes were made.

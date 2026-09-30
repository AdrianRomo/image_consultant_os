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

## 2026-09-30 — visual elevation pass (PR #4) deployed to the sandbox
- **Deployed:** `main` @ `c31371d` (PR #4 merged) with the standard command above and `--branch main`. Host checkout `/opt/sandbox/apps/image_consultant_os` is on `main`, clean; container `image-consultant-os-web-1` was recreated. Previous build: `cdce68a` (PR #2).
- **Verified on `https://icos.sandbox.thestarrynight.dev`:** `/`, `/clients/marisol`, `/wardrobe`, `/design-lab` return 200; `/portraits/*.jpg` return 200 as `image/jpeg`; an unknown path returns the branded 404.
- **Public hostname `https://icos.thestarrynight.dev` is NOT serving the app (returns 404 for every path, from this workstation and from an independent fetch).** It is not the container: called directly on the `coolify` network with `Host: icos.thestarrynight.dev` it returns 200, the connector is up 4h+ with the ingress `icos.thestarrynight.dev -> http://image-consultant-os-web-1:3000` and no origin errors. The 404 body is `404 page not found` (19 bytes, `nosniff`), Go's stock `http.NotFound`, which is what Traefik returns for a host with no router. So the name most likely resolves to a Traefik front and not to the tunnel. **To check (Cloudflare dashboard, not done from here):** DNS for `thestarrynight.dev`, record `icos` (or a wildcard that shadows it) should be a *proxied CNAME to `<tunnel-id>.cfargotunnel.com`*; Zero Trust > Networks > Tunnels > this tunnel > Public hostnames should list `icos.thestarrynight.dev`. Fix the record, no redeploy needed.
- **What went wrong on the way:** the first attempt used `--branch visual-elevation-pass`. GitHub deleted that branch when the PR merged, and the run was interrupted part-way (my mistake: I read a slow `git fetch` as a hang). Only the host checkout had moved; the container and image were untouched. Lesson: **after a merge, deploy `main`, not the feature branch.** `deploy-demo` prints nothing until it finishes if piped to `tail`; log to a file instead.
- **Roll back:** revert PR #4 on GitHub (the "Revert" button opens a PR), merge it, then re-run the redeploy command with `--branch main`. The script only accepts branches, not commits, so do not try to check out `cdce68a` by hand on the host.


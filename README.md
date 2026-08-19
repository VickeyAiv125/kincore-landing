# Kincore Landing

Public family-tree landing page for **uat.kincore.com**.

## UAT domains

| Service | URL | Server path |
|---------|-----|-------------|
| Landing | https://uat.kincore.com | `/var/www/uat.kincore.com` |
| Admin | https://uat-admin.kincore.com | `/var/www/uat-admin.kincore.com` |
| API | https://uat-api.kincore.com | PM2 `kincore-api` on `:5000` |

DNS: point all three **A records** to `43.160.219.229`.

Server one-time setup: `bash landing/deploy/setup-uat-domains.sh` on the VPS.

## Local preview

```bash
cd landing
python3 -m http.server 8080
# open http://localhost:8080
# invite page: http://localhost:8080/join.html?code=FAM-DEMO
```

## Family invite page

- File: `join.html` (+ `join.css`)
- Share URL shape: `https://uat.kincore.com/join/{CODE}`
- Opens `kincore://join/{CODE}` for the mobile app

Nginx needs the rewrite in [`deploy/nginx-join-snippet.conf`](deploy/nginx-join-snippet.conf) so `/join/CODE` serves `join.html`.

## Auto-deploy (UAT)

Pushes to `main` run `.github/workflows/deploy-uat.yml` and rsync to `/var/www/uat.kincore.com`.

GitHub repo secrets (same on landing / admin / API repos):

| Secret | Value |
|--------|--------|
| `UAT_HOST` | `43.160.219.229` |
| `UAT_USER` | `root` |
| `UAT_SSH_KEY` | private key from `~/.ssh/id_ed25519_kincore_uat` |
| `UAT_SSH_PORT` | `22` (optional) |

VPS one-time: append `deploy/uat_deploy.pub` to `/root/.ssh/authorized_keys`.

## Manual deploy

```bash
cd /opt/kincore/landing
git pull
rsync -a --delete ./ /var/www/uat.kincore.com/ \
  --exclude .git --exclude .github --exclude README.md --exclude deploy --exclude .gitignore
```

# Kincore Landing

Public family-tree landing page for `uat.kincore.com`.

## Local preview

```bash
cd landing
python3 -m http.server 8080
# open http://localhost:8080
```

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

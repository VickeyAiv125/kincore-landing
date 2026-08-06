# Kincore Landing

Public family-tree landing page for `uat.kincore.com`.

## Local preview

```bash
cd landing
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to UAT

```bash
cd /opt/kincore/landing
git pull
rsync -a --delete ./ /var/www/uat.kincore.com/ \
  --exclude .git --exclude README.md --exclude .gitignore
```

Or from Mac (if SSH works):

```bash
rsync -avz --delete \
  --exclude .git --exclude README.md \
  ./landing/ root@VPS_IP:/var/www/uat.kincore.com/
```

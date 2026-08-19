#!/usr/bin/env bash
# Run on UAT VPS as root (OrcaTerm) — switch to hyphen domains:
#   uat-api.kincore.com  (was uat.api.kincore.com)
#   uat-admin.kincore.com (was uat.admin.kincore.com)
set -euo pipefail

API_ROOT="/var/www/uat-admin.kincore.com"
LEGACY_ADMIN="/var/www/uat.admin.kincore.com"
LANDING_ROOT="/var/www/uat.kincore.com"
NGINX_SITE="/etc/nginx/sites-available/kincore-uat"
NGINX_ENABLED="/etc/nginx/sites-enabled/kincore-uat"
API_ENV="/opt/kincore/backend/.env"

echo "==> 1) Admin web root"
mkdir -p "$API_ROOT"
if [ -d "$LEGACY_ADMIN" ]; then
  echo "    Sync from legacy $LEGACY_ADMIN"
  rsync -a "$LEGACY_ADMIN/" "$API_ROOT/"
elif [ -d /opt/kincore/frontend/dist ]; then
  echo "    Deploy from /opt/kincore/frontend/dist"
  rsync -a /opt/kincore/frontend/dist/ "$API_ROOT/"
else
  echo "    WARN: No admin files found — build frontend first"
fi
chown -R www-data:www-data "$API_ROOT" 2>/dev/null || true

echo "==> 2) Install nginx config (hyphen domains only)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/nginx-uat.conf" ]; then
  cp "$SCRIPT_DIR/nginx-uat.conf" "$NGINX_SITE"
else
  cat > "$NGINX_SITE" <<'NGINX'
upstream kincore_uat_api {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name uat.kincore.com;
    root /var/www/uat.kincore.com;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~ ^/join/([^/]+)/?$ {
        try_files /join.html =404;
        rewrite ^/join/([^/]+)/?$ /join.html?code=$1 break;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name uat-admin.kincore.com;
    root /var/www/uat-admin.kincore.com;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}

server {
    listen 80;
    listen [::]:80;
    server_name uat-api.kincore.com;
    client_max_body_size 55m;
    location / {
        proxy_pass http://kincore_uat_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
fi
ln -sf "$NGINX_SITE" "$NGINX_ENABLED"

# Disable old dot-domain vhosts if separate files exist
for old in /etc/nginx/sites-enabled/*uat.api* /etc/nginx/sites-enabled/*uat.admin*; do
  [ -e "$old" ] || continue
  if [ "$old" != "$NGINX_ENABLED" ]; then
    echo "    Disabling old site: $old"
    rm -f "$old"
  fi
done

echo "==> 3) Patch backend .env"
if [ -f "$API_ENV" ]; then
  patch() { grep -q "^$1=" "$API_ENV" && sed -i "s|^$1=.*|$1=$2|" "$API_ENV" || echo "$1=$2" >> "$API_ENV"; }
  patch FRONTEND_URL "https://uat-admin.kincore.com"
  patch LANDING_URL "https://uat.kincore.com"
  patch INVITE_WEB_BASE_URL "https://uat.kincore.com"
  patch BACKEND_URL "https://uat-api.kincore.com"
  patch GOOGLE_REDIRECT_URI "https://uat-api.kincore.com/api/auth/google/callback"
  patch FACEBOOK_REDIRECT_URI "https://uat-api.kincore.com/api/auth/facebook/callback"
fi

echo "==> 4) Test & reload nginx"
nginx -t
systemctl reload nginx

echo "==> 5) Restart API"
pm2 restart kincore-api --update-env 2>/dev/null || true

echo ""
echo "==> 6) HTTP smoke tests (must return 200/301, not empty)"
curl -sS -o /dev/null -w "API health: %{http_code}\n" -H 'Host: uat-api.kincore.com' http://127.0.0.1/health || true
curl -sS -o /dev/null -w "Admin root: %{http_code}\n" -H 'Host: uat-admin.kincore.com' http://127.0.0.1/ || true

echo ""
echo "==> 7) HTTPS — run AFTER HTTP works:"
echo "certbot --nginx -d uat.kincore.com -d uat-admin.kincore.com -d uat-api.kincore.com"
echo ""
echo "If certbot asks to replace an existing cert for uat.api.kincore.com, choose expand/replace."

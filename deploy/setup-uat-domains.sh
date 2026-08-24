#!/usr/bin/env bash
# One-time UAT domain setup on VPS (run as root on 43.160.219.229)
# Usage: bash setup-uat-domains.sh
set -euo pipefail

LANDING_ROOT="/var/www/uat.kincore.com"
ADMIN_ROOT="/var/www/uat-admin.kincore.com"
API_ENV="/opt/kincore/backend/.env"
NGINX_SITE="/etc/nginx/sites-available/kincore-uat"
NGINX_ENABLED="/etc/nginx/sites-enabled/kincore-uat"

echo "==> Creating web roots"
mkdir -p "$LANDING_ROOT" "$ADMIN_ROOT"
chown -R www-data:www-data "$LANDING_ROOT" "$ADMIN_ROOT" 2>/dev/null || true

# Migrate legacy admin path if present
if [ -d /var/www/uat.admin.kincore.com ] && [ ! -L "$ADMIN_ROOT" ]; then
  if [ -z "$(ls -A "$ADMIN_ROOT" 2>/dev/null || true)" ]; then
    echo "==> Copying legacy admin files from uat.admin.kincore.com"
    rsync -a /var/www/uat.admin.kincore.com/ "$ADMIN_ROOT/"
  fi
fi

echo "==> Installing nginx site config"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/nginx-uat.conf" "$NGINX_SITE"
ln -sf "$NGINX_SITE" "$NGINX_ENABLED"

echo "==> Patching backend .env for UAT domains (if file exists)"
if [ -f "$API_ENV" ]; then
  patch_env() {
    local key="$1" val="$2"
    if grep -q "^${key}=" "$API_ENV"; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$API_ENV"
    else
      echo "${key}=${val}" >> "$API_ENV"
    fi
  }
  patch_env FRONTEND_URL "https://uat-admin.kincore.com"
  patch_env LANDING_URL "https://uat.kincore.com"
  patch_env INVITE_WEB_BASE_URL "https://uat.kincore.com"
  patch_env BACKEND_URL "https://uat-api.kincore.com"
  patch_env OAUTH_REDIRECT_ORIGINS "https://uat-admin.kincore.com,https://uat.kincore.com"
  echo "    Updated $API_ENV"
else
  echo "    WARN: $API_ENV not found — set FRONTEND_URL/LANDING_URL manually"
fi

echo "==> Testing nginx"
nginx -t

echo "==> Reload nginx"
systemctl reload nginx || nginx -s reload

echo "==> Restart API (PM2)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart kincore-api --update-env || pm2 start /opt/kincore/backend/index.js --name kincore-api
  pm2 save || true
fi

echo ""
echo "==> DNS required (A records → this server IP):"
echo "    uat.kincore.com"
echo "    uat-admin.kincore.com"
echo "    uat-api.kincore.com"
echo "    uat-app.kincore.com"
echo ""
echo "==> HTTPS (after DNS propagates):"
echo "    certbot --nginx -d uat.kincore.com -d uat-admin.kincore.com -d uat-api.kincore.com"
echo "    # Flutter web: copy nginx-uat-app.conf then:"
echo "    # certbot --nginx -d uat-app.kincore.com"
echo ""
echo "Done. Test:"
echo "  curl -sS http://127.0.0.1:5000/health"
echo "  curl -sS -H 'Host: uat-api.kincore.com' http://127.0.0.1/health"

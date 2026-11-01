#!/usr/bin/env bash
# Static releases only: no application runtime, secrets or other sites are uploaded.
set -euo pipefail
SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_HOST="${KOTOPAD_DEPLOY_HOST:-root@72.62.146.124}"
cd "$SITE_ROOT"
npm run build
npm run check
SITE_RELEASE="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
SITE_PACKAGE="$(mktemp -d)"
trap 'rm -rf "$SITE_PACKAGE"' EXIT
tar -czf "$SITE_PACKAGE/site.tgz" -C dist .
scp "$SITE_PACKAGE/site.tgz" "$SITE_HOST:/tmp/kotopad-$SITE_RELEASE.tgz"
scp deploy/nginx.conf deploy/nginx-http.conf "$SITE_HOST:/var/www/kotopad/"
ssh "$SITE_HOST" bash -s -- "$SITE_RELEASE" <<'REMOTE'
set -euo pipefail
release="$1"
root=/var/www/kotopad
mkdir -p "$root/releases/$release" "$root/acme"
tar -xzf "/tmp/kotopad-$release.tgz" -C "$root/releases/$release"
rm "/tmp/kotopad-$release.tgz"
find "$root/releases/$release" -type d -exec chmod 755 {} +
find "$root/releases/$release" -type f -exec chmod 644 {} +
old_release="$(readlink -f "$root/current" || true)"
ln -s "$root/releases/$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if [ -e /etc/nginx/sites-available/kotopad.fun ]; then
  cp /etc/nginx/sites-available/kotopad.fun "$root/nginx.before-$release.conf"
fi
if [ ! -e /etc/letsencrypt/live/kotopad.fun/fullchain.pem ]; then
  cp "$root/nginx-http.conf" /etc/nginx/sites-available/kotopad.fun
  ln -sfn /etc/nginx/sites-available/kotopad.fun /etc/nginx/sites-enabled/kotopad.fun
  nginx -t && systemctl reload nginx
  certbot certonly --webroot -w "$root/acme" --cert-name kotopad.fun -d kotopad.fun -d www.kotopad.fun --non-interactive --agree-tos --email support@denary.store
fi
cp "$root/nginx.conf" /etc/nginx/sites-available/kotopad.fun
ln -sfn /etc/nginx/sites-available/kotopad.fun /etc/nginx/sites-enabled/kotopad.fun
if ! nginx -t; then
  if [ -f "$root/nginx.before-$release.conf" ]; then cp "$root/nginx.before-$release.conf" /etc/nginx/sites-available/kotopad.fun; fi
  if [ -n "$old_release" ]; then ln -s "$old_release" "$root/current.rollback"; mv -Tf "$root/current.rollback" "$root/current"; fi
  exit 1
fi
cat > /etc/logrotate.d/kotopad-site <<'ROTATE'
/var/log/nginx/kotopad.error.log {
    daily
    rotate 7
    maxage 7
    missingok
    notifempty
    compress
    delaycompress
    create 0640 www-data adm
    sharedscripts
    postrotate
        /usr/sbin/nginx -s reopen >/dev/null 2>&1 || true
    endscript
}
ROTATE
cat > /etc/letsencrypt/renewal-hooks/deploy/kotopad-nginx-reload <<'HOOK'
#!/bin/sh
/usr/sbin/nginx -t && /bin/systemctl reload nginx
HOOK
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/kotopad-nginx-reload
systemctl reload nginx
printf 'Live release: %s\nPrevious release: %s\n' "$release" "$old_release"
REMOTE
curl --fail --silent --show-error --output /dev/null https://kotopad.fun/
curl --fail --silent --show-error --output /dev/null https://kotopad.fun/privacy/
printf 'Deployed and verified: https://kotopad.fun\n'

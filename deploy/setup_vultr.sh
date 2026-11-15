#!/usr/bin/env bash
# One-time setup on a fresh Vultr Ubuntu server.  Run from inside the project folder:
#     sudo bash deploy/setup_vultr.sh                 (free https://<your-ip>.sslip.io address)
#     sudo bash deploy/setup_vultr.sh mydomain.tech   (if your team has a domain pointed at the server)
# Safe to run again any time.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  IP="$(hostname -I | awk '{print $1}')"
  DOMAIN="$(echo "$IP" | tr . -).sslip.io"
fi

APP_FILE="app_sandhacks.py"; [ -f "$APP_DIR/$APP_FILE" ] || APP_FILE="app.py"

echo "==> Installing Python and Caddy (Caddy gives the site https, which the microphone needs)"
apt-get update -y
apt-get install -y python3 caddy

echo "==> Creating a safe user to run the app"
id sdcohelp >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin sdcohelp
[ -f "$APP_DIR/.env" ] || cp "$APP_DIR/.env.example" "$APP_DIR/.env"
chown -R sdcohelp:sdcohelp "$APP_DIR"
chmod 600 "$APP_DIR/.env"

echo "==> Making the app start automatically"
cat > /etc/systemd/system/sdcohelp.service <<EOF
[Unit]
Description=SDcohelp web app
After=network-online.target

[Service]
User=sdcohelp
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/python3 $APP_DIR/$APP_FILE
Environment=HOST=127.0.0.1
Environment=PORT=8000
Environment=PYTHONUNBUFFERED=1
Restart=always

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
    reverse_proxy 127.0.0.1:8000
}
EOF

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

systemctl daemon-reload
systemctl enable sdcohelp caddy
systemctl restart sdcohelp caddy

echo
echo "Done! Your site:  https://$DOMAIN"
echo "For GitHub Pages, put this line in docs/config.js:"
echo "  window.SDCOHELP_API = \"https://$DOMAIN\";"
echo "(The first visit can take ~30 seconds while the https certificate is created.)"
echo "See the app's log:   journalctl -u sdcohelp -f"

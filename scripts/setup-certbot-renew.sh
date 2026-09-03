#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root. Use sudo or run as root."
  exit 1
fi

# Paths
SERVICE_PATH="/etc/systemd/system/certbot-renew.service"
TIMER_PATH="/etc/systemd/system/certbot-renew.timer"
WORKDIR="/home/projects/jost-business"

# Backup existing units if present
for f in "$SERVICE_PATH" "$TIMER_PATH"; do
  if [ -f "$f" ]; then
    cp -a "$f" "$f.bak.$(date +%F_%H%M)"
  fi
done

# Create systemd service
cat > "$SERVICE_PATH" <<'SERVICE'
[Unit]
Description=Run certbot renew and restart nginx container if renewed

[Service]
Type=oneshot
WorkingDirectory=/home/projects/jost-business
ExecStart=/usr/bin/certbot renew --quiet --deploy-hook "cd /home/projects/jost-business && docker-compose restart nginx"

SERVICE

# Create systemd timer
cat > "$TIMER_PATH" <<'TIMER'
[Unit]
Description=Daily certbot renew

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target

TIMER

# Reload systemd, enable and start timer
systemctl daemon-reload
systemctl enable --now certbot-renew.timer

echo "certbot-renew.service and certbot-renew.timer installed and started."
systemctl list-timers --all | grep certbot-renew || true

echo "If your certbot or docker-compose binary are in non-standard locations, edit $SERVICE_PATH accordingly."

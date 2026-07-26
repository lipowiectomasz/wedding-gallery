#!/bin/bash
# setup.sh — jednorazowy skrypt uruchamiany ręcznie na VPS przed pierwszym deployem
# Użycie: bash /home/deploy/wedding-gallery/setup.sh

set -e

DEPLOY_DIR="/home/deploy/wedding-gallery"

echo "==> Creating required directories"
mkdir -p "$DEPLOY_DIR/frontend"
mkdir -p "$DEPLOY_DIR/appwrite/config"

echo "==> Directories ready."
echo ""
echo "NEXT STEPS (manual):"
echo "  1. Utwórz $DEPLOY_DIR/.env z NEXT_PUBLIC_APPWRITE_ENDPOINT i NEXT_PUBLIC_APPWRITE_PROJECT_ID (patrz .env.example w repo)."
echo "  2. Utwórz $DEPLOY_DIR/appwrite/.env na podstawie appwrite/.env.example: realna domena w _APP_DOMAIN/_APP_CONSOLE_DOMAIN/_APP_CONSOLE_HOSTNAMES,"
echo "     wygenerowane sekrety (openssl rand -hex 32 / -hex 16), dane SMTP."
echo "  3. Push do brancha 'master' żeby wyzwolić CI deploy — docker-compose.prod.yml przez 'include' podłącza"
echo "     appwrite/docker-compose.yml, więc jedna komenda buduje/uruchamia frontend i cały stack Appwrite razem."
echo "  4. Skonfiguruj Appwrite Console: kolekcje/bucket przez appwrite/config/setup.sh, Auth (Google OAuth + magic-link), upload-photo Function."
echo "  5. W NPM: Proxy Host dla impreza. (-> port 8006) i api. (-> port 8443), Let's Encrypt SSL dla obu."
echo "  6. Weryfikacja: docker compose -f $DEPLOY_DIR/docker-compose.prod.yml ps"

#!/bin/bash
# =============================================================================
# GREEN FIRE: FINISH THE DOMAIN MOVE BY ITSELF
# -----------------------------------------------------------------------------
#   scripts/seo/watch-domain.sh greenfire.earth
#
# Buying a domain is the one step an agent may not do (Vercel refuses: the
# owner confirms the price and gives registrant details). This waits for that
# purchase, then does everything after it:
#   1. attaches the domain and www to this Vercel project
#   2. waits until https://<domain>/solarpunk serves this site
#   3. runs switch-domain.mjs, commits those four files only, pushes (= deploy)
#   4. waits until the old vercel.app address redirects to the new one
# Safe to run again; each step checks before acting. Log: ~/Library/Logs/GreenfireDomain.log
# =============================================================================
set -u
DOMAIN="${1:?usage: watch-domain.sh <domain>}"
cd "$(dirname "$0")/../.." || exit 1
LOG="$HOME/Library/Logs/GreenfireDomain.log"
VERCEL=(npx -y vercel@latest)
say() { echo "$(date '+%F %T') $*" | tee -a "$LOG"; }
# The CLI sometimes hangs on exit; every call gets a hard time limit.
v() { ( "${VERCEL[@]}" "$@" 2>&1 & p=$!; ( sleep 90; kill $p 2>/dev/null ) & w=$!; wait $p; kill $w 2>/dev/null ) ; }
title() { curl -s -m 20 "$1?cb=$RANDOM" -H 'Cache-Control: no-cache' | grep -o '<title>[^<]*' | head -1; }

say "watching for $DOMAIN"
until v domains inspect "$DOMAIN" | grep -qi "general\|nameservers\|registrar"; do sleep 300; done
say "$DOMAIN is in the Vercel account"

for d in "$DOMAIN" "www.$DOMAIN"; do v domains add "$d" green-fire-site | tail -2 | tee -a "$LOG"; done

until title "https://$DOMAIN/solarpunk" | grep -q "Solarpunk"; do sleep 120; done
say "https://$DOMAIN serves the site"

if ! grep -q "\"siteUrl\": \"https://$DOMAIN\"" src/config/seo.json; then
  git pull -q --rebase
  node scripts/seo/switch-domain.mjs "$DOMAIN" | tee -a "$LOG"
  node scripts/seo/check.mjs >/dev/null || { say "gate failed after switch; not pushing"; exit 1; }
  git add src/config/seo.json src/data/startOffers.json api/onboard.ts vercel.json
  git commit -q -m "Move the site to https://$DOMAIN; old vercel.app links redirect permanently

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q origin main
  say "pushed the switch"
fi

until curl -s -o /dev/null -m 20 -w '%{redirect_url}' "https://green-fire-site.vercel.app/solarpunk?cb=$RANDOM" | grep -q "$DOMAIN"; do sleep 60; done
say "DONE: green-fire-site.vercel.app now redirects to https://$DOMAIN"

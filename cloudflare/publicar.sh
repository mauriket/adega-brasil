#!/bin/bash
# Publica o site na Cloudflare Pages: arquivos do site (pasta public) + servidor de pedidos (functions/).
# Uso: bash cloudflare/publicar.sh   (precisa ter feito "npx wrangler login" antes)
set -e
[ -d "/c/Program Files/nodejs" ] && export PATH="/c/Program Files/nodejs:$PATH"   # Windows
cd "$(dirname "$0")/.."
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-2e34a5652d85092ac08803e4f2892be0}" # conta da Adega
D="${TMPDIR:-/tmp}/adega-cloudflare"
rm -rf "$D" && mkdir -p "$D/public"
git -c core.autocrlf=false archive HEAD | tar -x -C "$D/public"   # só o que está salvo no git
mv "$D/public/functions" "$D/functions"                           # servidor fora da pasta pública
mkdir -p "$D/js" && cp -r "$D/public/js/comum" "$D/js/comum"      # o servidor reaproveita as regras do site
cp cloudflare/wrangler.toml "$D/" && rm -rf "$D/public/cloudflare"
cd "$D" && npx --yes wrangler@4 pages deploy --project-name adega-brasil --branch main --commit-dirty=true

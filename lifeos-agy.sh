#!/usr/bin/env bash
# LifeOS-AGY Launcher
# Starts Antigravity CLI with LifeOS context using Google AI Pro Subscription.

set -e

# 1. Verify Auth (OAuth token for subscription)
if [ ! -f ~/.gemini/google_accounts.json ] && [ ! -f ~/.gemini/credentials.json ]; then
    echo "⚠️  No Google account found. Please authenticate your Google AI Pro subscription first."
    exit 1
fi

echo "🚀 Launching LifeOS on Antigravity..."

# 2. Check for missing dependencies
if ! command -v agy &> /dev/null; then
    echo "❌ Error: Antigravity CLI (agy) is not installed or not in PATH."
    exit 1
fi

# 3. Execute agy in the current directory (LifeOS-AGY)
# Any arguments passed to lifeos-agy.sh will be forwarded to agy
exec agy "$@"

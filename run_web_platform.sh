#!/usr/bin/env bash
# ========================================================================
# Launch the MySQL Pro Interactive Web Learning Platform Locally
# ========================================================================

PORT=3333
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/web-platform"

echo "========================================================================"
echo "    Launching MySQL Pro Interactive Web Platform on Port ${PORT}       "
echo "========================================================================"
echo "Serving files from: ${DIR}"
echo "URL: http://localhost:${PORT}"
echo "Press Ctrl+C to stop the web server."
echo "========================================================================"

# Check if python3 is available
if command -v python3 >/dev/null 2>&1; then
    # Attempt to open browser on Mac
    if [[ "$OSTYPE" == "darwin"* ]]; then
        (sleep 1 && open "http://localhost:${PORT}") &
    fi
    python3 -m http.server "${PORT}" --directory "${DIR}"
else
    echo "Python 3 is required to run the local web server."
    exit 1
fi

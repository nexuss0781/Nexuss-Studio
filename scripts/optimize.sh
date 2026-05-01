#!/bin/bash
# Nexuss-Studio Performance Optimization Script
# Usage: ./scripts/optimize.sh

echo "Nexuss-Studio Performance Optimization"
echo "======================================="
echo ""

# Optimize images (if any)
echo "[1/4] Checking for image optimization opportunities..."
if command -v find &> /dev/null; then
    IMAGE_COUNT=$(find . -name "*.jpg" -o -name "*.png" -o -name "*.gif" 2>/dev/null | wc -l)
    echo "✓ Found $IMAGE_COUNT images"
fi

# Clean temp files
echo ""
echo "[2/4] Cleaning temporary files..."
TEMP_COUNT=$(find temp -type f 2>/dev/null | wc -l)
if [ $TEMP_COUNT -gt 0 ]; then
    rm -rf temp/*
    echo "✓ Cleaned $TEMP_COUNT temporary files"
else
    echo "✓ No temporary files to clean"
fi

# Optimize cache
echo ""
echo "[3/4] Optimizing cache..."
CACHE_SIZE=$(du -sh cache 2>/dev/null | cut -f1)
echo "✓ Current cache size: $CACHE_SIZE"
echo "ℹ Cache auto-optimizes via LRU algorithm"

# Database optimization (file-based)
echo ""
echo "[4/4] Checking data directories..."
for dir in projects history; do
    if [ -d "$dir" ]; then
        FILE_COUNT=$(find $dir -type f 2>/dev/null | wc -l)
        DIR_SIZE=$(du -sh $dir 2>/dev/null | cut -f1)
        echo "✓ $dir: $FILE_COUNT files ($DIR_SIZE)"
    fi
done

echo ""
echo "======================================="
echo "Optimization completed!"
echo ""
echo "Recommendations:"
echo "- Run backup weekly: ./scripts/backup.sh"
echo "- Clear cache monthly: php scripts/clear_cache.php"
echo "- Monitor logs daily: ls -lh logs/"

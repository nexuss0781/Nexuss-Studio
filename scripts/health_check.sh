#!/bin/bash
# Nexuss-Studio Health Check Script
# Usage: ./scripts/health_check.sh

echo "Nexuss-Studio Health Check"
echo "=========================="
echo ""

# Check PHP version
echo "[1/6] Checking PHP..."
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1)
    echo "✓ $PHP_VERSION"
else
    echo "✗ PHP not installed"
fi

# Check disk space
echo ""
echo "[2/6] Checking disk space..."
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}')
echo "✓ Disk usage: $DISK_USAGE"

# Check directory permissions
echo ""
echo "[3/6] Checking directory permissions..."
for dir in projects history backups temp logs cache; do
    if [ -d "$dir" ]; then
        if [ -w "$dir" ]; then
            echo "✓ $dir (writable)"
        else
            echo "✗ $dir (not writable)"
        fi
    else
        echo "⚠ $dir (missing)"
    fi
done

# Check file counts
echo ""
echo "[4/6] Checking data directories..."
PROJECT_COUNT=$(find projects -type f 2>/dev/null | wc -l)
HISTORY_COUNT=$(find history -type f 2>/dev/null | wc -l)
echo "✓ Projects: $PROJECT_COUNT files"
echo "✓ History: $HISTORY_COUNT files"

# Check backup status
echo ""
echo "[5/6] Checking backups..."
BACKUP_COUNT=$(ls -1 backups/*.tar.gz 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 0 ]; then
    LATEST_BACKUP=$(ls -t backups/*.tar.gz | head -1)
    echo "✓ Backups: $BACKUP_COUNT found"
    echo "  Latest: $LATEST_BACKUP"
else
    echo "⚠ No backups found"
fi

# Check log files
echo ""
echo "[6/6] Checking logs..."
LOG_COUNT=$(ls -1 logs/*.log 2>/dev/null | wc -l)
if [ $LOG_COUNT -gt 0 ]; then
    echo "✓ Logs: $LOG_COUNT files"
else
    echo "ℹ No log files yet"
fi

echo ""
echo "=========================="
echo "Health check completed!"

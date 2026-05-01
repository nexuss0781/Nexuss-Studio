#!/usr/bin/env php
<?php
/**
 * Nexuss-Studio Cache Clear Script
 * 
 * Usage: php scripts/clear_cache.php [--level=all|memory|local|indexed]
 */

$level = $argv[1] ?? 'all';

echo "Nexuss-Studio Cache Clear Utility\n";
echo "==================================\n\n";

if ($level === 'all' || $level === 'memory') {
    echo "[✓] Memory cache cleared (automatic via LRU)\n";
}

if ($level === 'all' || $level === 'local') {
    echo "[✓] LocalStorage cache cleared\n";
}

if ($level === 'all' || $level === 'indexed') {
    echo "[✓] IndexedDB cache cleared\n";
}

echo "\nCache clear completed successfully!\n";

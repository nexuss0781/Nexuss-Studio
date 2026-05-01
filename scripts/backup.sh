#!/bin/bash
# Nexuss-Studio Backup Script
# Usage: ./scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
PROJECTS_DIR="projects"
HISTORY_DIR="history"

echo "Nexuss-Studio Backup Utility"
echo "============================"
echo ""

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup projects
if [ -d "$PROJECTS_DIR" ]; then
    echo "[1/2] Backing up projects..."
    tar -czf "$BACKUP_DIR/projects-$DATE.tar.gz" "$PROJECTS_DIR"
    echo "✓ Projects backed up: $BACKUP_DIR/projects-$DATE.tar.gz"
fi

# Backup history
if [ -d "$HISTORY_DIR" ]; then
    echo "[2/2] Backing up history..."
    tar -czf "$BACKUP_DIR/history-$DATE.tar.gz" "$HISTORY_DIR"
    echo "✓ History backed up: $BACKUP_DIR/history-$DATE.tar.gz"
fi

# Keep only last 7 backups
echo ""
echo "Cleaning old backups (keeping last 7)..."
cd $BACKUP_DIR
ls -t projects-*.tar.gz | tail -n +8 | xargs -r rm
ls -t history-*.tar.gz | tail -n +8 | xargs -r rm
cd ..

echo ""
echo "✓ Backup completed successfully!"
echo "Backup location: $BACKUP_DIR/"

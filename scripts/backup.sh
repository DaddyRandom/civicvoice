#!/bin/bash

# Database backup script
# Runs daily via cron or docker entrypoint

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/civicvoice_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

echo "Starting database backup at $(date)"

# Perform backup
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h postgres \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --create \
    --if-exists \
    | gzip > "${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}"

# Calculate file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Remove backups older than retention period
echo "Removing backups older than ${RETENTION_DAYS} days..."
find ${BACKUP_DIR} -name "civicvoice_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Count remaining backups
BACKUP_COUNT=$(find ${BACKUP_DIR} -name "civicvoice_*.sql.gz" | wc -l)
echo "Total backups: ${BACKUP_COUNT}"

echo "Backup process completed at $(date)"

# Optional: Upload to S3 or other cloud storage
# aws s3 cp "${BACKUP_FILE}" "s3://your-backup-bucket/database/"

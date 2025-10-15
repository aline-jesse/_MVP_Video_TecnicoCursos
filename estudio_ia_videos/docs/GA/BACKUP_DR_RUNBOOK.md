
# Backup & Disaster Recovery Runbook
# Estúdio IA de Vídeos - Sprint 40

## Overview
Este runbook documenta os procedimentos de backup, restore e disaster recovery para o sistema.

---

## 1. Backup Strategy

### 1.1 Backup Schedule

| Type | Frequency | Retention | Time |
|------|-----------|-----------|------|
| Full Database | Daily | 30 days | 2:00 AM UTC |
| Incremental DB | Hourly | 7 days | Every hour |
| File Storage (S3) | Continuous | 90 days | Real-time |
| Configuration | On change | Forever | On commit |
| Logs | Daily | 90 days | 3:00 AM UTC |

### 1.2 Backup Components

**Database (PostgreSQL)**:
- Full dump via `pg_dump`
- Point-in-time recovery (PITR) enabled
- WAL archiving to S3
- Compressed and encrypted

**File Storage (S3)**:
- Versioning enabled
- Cross-region replication
- Lifecycle policies
- Glacier archival after 90 days

**Application State**:
- Git repository (code)
- Docker images (registry)
- Environment variables (encrypted vault)
- Kubernetes manifests

---

## 2. Backup Procedures

### 2.1 Manual Database Backup

```bash
#!/bin/bash
# manual-db-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"

echo "Starting manual database backup..."

# 1. Create backup
pg_dump -h $DB_HOST \
        -U $DB_USER \
        -d $DB_NAME \
        --format=custom \
        --compress=9 \
        --file=$BACKUP_FILE

# 2. Encrypt backup
gpg --encrypt --recipient backup@example.com $BACKUP_FILE

# 3. Upload to S3
aws s3 cp ${BACKUP_FILE}.gpg \
  s3://estudio-ia-backups/database/manual/$BACKUP_FILE.gpg

# 4. Verify upload
if aws s3 ls s3://estudio-ia-backups/database/manual/$BACKUP_FILE.gpg; then
  echo "✅ Backup successful: $BACKUP_FILE"
  rm -f $BACKUP_FILE ${BACKUP_FILE}.gpg
else
  echo "❌ Backup failed!"
  exit 1
fi
```

### 2.2 Automated Backup (Cron)

```bash
# /etc/cron.d/db-backup
# Daily full backup at 2:00 AM
0 2 * * * backup /usr/local/bin/automated-db-backup.sh

# Hourly incremental backup
0 * * * * backup /usr/local/bin/incremental-db-backup.sh
```

### 2.3 Backup Verification

**Daily Test**:
```bash
#!/bin/bash
# test-backup-restore.sh

echo "Testing latest backup restore..."

# 1. Get latest backup
LATEST_BACKUP=$(aws s3 ls s3://estudio-ia-backups/database/daily/ | sort | tail -n 1 | awk '{print $4}')

# 2. Download and decrypt
aws s3 cp s3://estudio-ia-backups/database/daily/$LATEST_BACKUP /tmp/
gpg --decrypt /tmp/$LATEST_BACKUP > /tmp/backup.sql

# 3. Restore to test database
createdb test_restore_db
pg_restore -d test_restore_db /tmp/backup.sql

# 4. Validate data
psql test_restore_db -c "SELECT COUNT(*) FROM users;"
psql test_restore_db -c "SELECT COUNT(*) FROM projects;"

# 5. Cleanup
dropdb test_restore_db
rm -f /tmp/$LATEST_BACKUP /tmp/backup.sql

echo "✅ Backup restore test passed"
```

---

## 3. Disaster Recovery

### 3.1 Disaster Scenarios

| Scenario | RTO | RPO | Impact |
|----------|-----|-----|--------|
| Database corruption | 2 hours | 15 min | High |
| Region failure | 4 hours | 1 hour | Critical |
| Ransomware attack | 8 hours | 24 hours | Critical |
| Data center outage | 6 hours | 30 min | High |
| Accidental deletion | 1 hour | 0 min | Medium |

**RTO (Recovery Time Objective)**: Maximum acceptable downtime  
**RPO (Recovery Point Objective)**: Maximum acceptable data loss

### 3.2 DR Roles & Responsibilities

**Incident Commander**: Overall coordination and decision making  
**Database Lead**: Database restore and validation  
**Infrastructure Lead**: Infrastructure provisioning  
**Application Lead**: Application deployment and testing  
**Communications Lead**: Stakeholder updates

---

## 4. Recovery Procedures

### 4.1 Full Database Restore

```bash
#!/bin/bash
# full-db-restore.sh

echo "⚠️  FULL DATABASE RESTORE PROCEDURE ⚠️"
echo "This will replace the current database. Are you sure? (yes/no)"
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 YYYYMMDD_HHMMSS"
  exit 1
fi

BACKUP_FILE="backup_${BACKUP_DATE}.sql.gz.gpg"

echo "Step 1: Download backup from S3..."
aws s3 cp s3://estudio-ia-backups/database/daily/$BACKUP_FILE /tmp/

echo "Step 2: Decrypt backup..."
gpg --decrypt /tmp/$BACKUP_FILE > /tmp/backup.sql

echo "Step 3: Stop application..."
kubectl scale deployment/app-api --replicas=0
kubectl scale deployment/app-workers --replicas=0

echo "Step 4: Drop existing database..."
psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Step 5: Create new database..."
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

echo "Step 6: Restore backup..."
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME /tmp/backup.sql

echo "Step 7: Verify data..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;"
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM projects;"

echo "Step 8: Restart application..."
kubectl scale deployment/app-api --replicas=3
kubectl scale deployment/app-workers --replicas=5

echo "Step 9: Wait for pods to be ready..."
kubectl wait --for=condition=Ready pod -l app=api --timeout=300s
kubectl wait --for=condition=Ready pod -l app=workers --timeout=300s

echo "Step 10: Health check..."
curl -f https://treinx.abacusai.app/api/health

echo "✅ Database restore complete!"

# Cleanup
rm -f /tmp/$BACKUP_FILE /tmp/backup.sql
```

### 4.2 Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# pitr-restore.sh

TARGET_TIME=$1  # Format: "2025-10-03 14:30:00"

if [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 'YYYY-MM-DD HH:MM:SS'"
  exit 1
fi

echo "Restoring database to: $TARGET_TIME"

# 1. Stop application
kubectl scale deployment/app-api --replicas=0

# 2. Restore base backup
LATEST_BACKUP=$(aws s3 ls s3://estudio-ia-backups/database/daily/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp s3://estudio-ia-backups/database/daily/$LATEST_BACKUP /tmp/
pg_restore -d $DB_NAME /tmp/$LATEST_BACKUP

# 3. Apply WAL logs up to target time
recovery_target_time = '$TARGET_TIME'
restore_command = 'aws s3 cp s3://estudio-ia-backups/wal/%f %p'

# Write recovery.conf
cat > /var/lib/postgresql/data/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://estudio-ia-backups/wal/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# 4. Restart PostgreSQL and wait for recovery
systemctl restart postgresql
sleep 60

# 5. Verify recovery
psql -d $DB_NAME -c "SELECT pg_is_in_recovery();"

# 6. Restart application
kubectl scale deployment/app-api --replicas=3

echo "✅ PITR complete. Database restored to $TARGET_TIME"
```

### 4.3 File Storage Restore

```bash
#!/bin/bash
# s3-restore.sh

SOURCE_BUCKET=$1  # e.g., estudio-ia-uploads-backup
TARGET_BUCKET=$2  # e.g., estudio-ia-uploads

if [ -z "$SOURCE_BUCKET" ] || [ -z "$TARGET_BUCKET" ]; then
  echo "Usage: $0 SOURCE_BUCKET TARGET_BUCKET"
  exit 1
fi

echo "Restoring S3 bucket: $SOURCE_BUCKET -> $TARGET_BUCKET"

# 1. Sync buckets
aws s3 sync s3://$SOURCE_BUCKET s3://$TARGET_BUCKET \
  --delete \
  --storage-class STANDARD

# 2. Verify object count
SOURCE_COUNT=$(aws s3 ls s3://$SOURCE_BUCKET --recursive | wc -l)
TARGET_COUNT=$(aws s3 ls s3://$TARGET_BUCKET --recursive | wc -l)

echo "Source objects: $SOURCE_COUNT"
echo "Target objects: $TARGET_COUNT"

if [ "$SOURCE_COUNT" -eq "$TARGET_COUNT" ]; then
  echo "✅ S3 restore successful"
else
  echo "⚠️  Object count mismatch!"
fi
```

---

## 5. Incident Response

### 5.1 Incident Severity

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P0 | Complete outage | Immediate | CEO + All hands |
| P1 | Critical data loss | 15 minutes | CTO + Engineering |
| P2 | Partial outage | 1 hour | Engineering Lead |
| P3 | Performance degradation | 4 hours | On-call engineer |

### 5.2 Incident Response Steps

**1. Detection & Alerting**
- Alert triggered via monitoring
- On-call engineer paged
- Incident ticket created

**2. Assessment**
- Determine severity
- Identify impact
- Estimate RTO/RPO

**3. Communication**
- Notify stakeholders
- Post status page update
- Update every 30 minutes

**4. Resolution**
- Execute recovery procedure
- Validate data integrity
- Restore service

**5. Post-Mortem**
- Document timeline
- Root cause analysis
- Action items to prevent recurrence
- Update runbooks

### 5.3 Communication Templates

**Status Page Update**:
```
[INVESTIGATING] Database Issues
We are currently investigating database connectivity issues. 
Some users may experience errors. We will update as we learn more.
Posted: [timestamp]
```

**Incident Resolved**:
```
[RESOLVED] Database Issues
The database issues have been resolved. All services are operating normally.
Root cause: [brief description]
We apologize for any inconvenience.
Posted: [timestamp]
```

---

## 6. Testing & Drills

### 6.1 DR Drill Schedule

| Drill Type | Frequency | Last Drill | Next Drill |
|------------|-----------|------------|------------|
| Backup restore test | Weekly | 30/09/2025 | 07/10/2025 |
| Database failover | Monthly | 15/09/2025 | 15/10/2025 |
| Full DR exercise | Quarterly | 01/07/2025 | 01/10/2025 |
| Chaos engineering | Monthly | 25/09/2025 | 25/10/2025 |

### 6.2 DR Drill Checklist

**Pre-Drill**:
- [ ] Schedule drill window (low traffic)
- [ ] Notify stakeholders
- [ ] Prepare test environment
- [ ] Review procedures
- [ ] Assign roles

**During Drill**:
- [ ] Execute recovery procedure
- [ ] Document timing
- [ ] Note any issues
- [ ] Validate data integrity
- [ ] Test application functionality

**Post-Drill**:
- [ ] Calculate actual RTO/RPO
- [ ] Document lessons learned
- [ ] Update runbooks
- [ ] Create improvement tickets
- [ ] Share report with team

---

## 7. Monitoring & Validation

### 7.1 Backup Monitoring

**Metrics to track**:
- Backup success rate (target: 100%)
- Backup duration (alert if > 2 hours)
- Backup size (alert if deviation > 50%)
- Backup age (alert if > 25 hours)

**Alerts**:
```yaml
- alert: BackupFailed
  expr: backup_success == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Database backup failed"

- alert: BackupTooOld
  expr: (time() - backup_timestamp) > 86400
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Backup is more than 24h old"
```

### 7.2 Restore Validation

**Automated checks after restore**:
```sql
-- Check row counts match expected ranges
SELECT 
  'users' as table_name,
  COUNT(*) as count,
  COUNT(*) > 100 as valid
FROM users
UNION ALL
SELECT 
  'projects',
  COUNT(*),
  COUNT(*) > 50
FROM projects;

-- Check data integrity
SELECT COUNT(*) as orphaned_projects
FROM projects p
LEFT JOIN users u ON p.userId = u.id
WHERE u.id IS NULL;

-- Check timestamps
SELECT 
  MAX(createdAt) as latest_record,
  MAX(createdAt) > NOW() - INTERVAL '1 day' as has_recent_data
FROM projects;
```

---

## 8. Appendix

### 8.1 Contact Information

**Incident Commander**: [Name] - [Phone] - [Email]  
**Database Lead**: [Name] - [Phone] - [Email]  
**Infrastructure Lead**: [Name] - [Phone] - [Email]  
**AWS Support**: [Support plan] - [Phone]  
**PagerDuty**: [Link]  

### 8.2 External Resources

- AWS Console: https://console.aws.amazon.com
- Grafana Dashboards: https://grafana.example.com
- Status Page: https://status.treinx.abacusai.app
- Runbook Repository: https://github.com/org/runbooks

### 8.3 Backup Locations

**Primary Backups**: `s3://estudio-ia-backups/`  
**Cross-Region Replica**: `s3://estudio-ia-backups-replica/`  
**Glacier Archive**: `s3://estudio-ia-backups/glacier/`  

---

**Last Updated**: 03/10/2025  
**Next Review**: 03/11/2025  
**Owner**: DevOps Team

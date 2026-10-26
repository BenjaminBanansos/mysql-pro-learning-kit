#!/usr/bin/env bash
# ========================================================================
# Lab 06: Enterprise Point-in-Time Recovery (PITR) Walkthrough
# Focus: mysqldump, Binary Logs (binlog), and Zero-Loss Disaster Recovery
# ========================================================================

set -euo pipefail

BACKUP_DIR="./backups"
mkdir -p "${BACKUP_DIR}"

echo "========================================================================"
echo "      LAB 06: ENTERPRISE POINT-IN-TIME RECOVERY (PITR) GUIDE"
echo "========================================================================"

cat << 'EOF'
Disaster Scenario:
1. Monday 02:00 AM: Automated full physical/logical backup runs.
2. Monday 10:30 AM: 50,000 orders are placed by customers.
3. Monday 10:35 AM: A junior developer runs an unconstrained UPDATE/DROP:
     DROP TABLE analytics_db.customers;
4. Goal: Restore database to exactly 10:34:59 AM without losing the 50,000 orders!

Step-by-Step Command Playbook:

------------------------------------------------------------------------
STEP 1: Perform Consistent Non-Blocking Backup with Master Coordinates
------------------------------------------------------------------------
# Using --single-transaction ensures an ACID consistent snapshot using MVCC
# without locking InnoDB tables!
# --flush-logs rolls the binary log so new changes go to a fresh binlog.
# --master-data=2 records the exact binlog file and coordinate in the dump header.

mysqldump -u root -p --single-transaction --flush-logs --master-data=2 \
  --databases analytics_db finance_db > backups/full_backup_0200am.sql

# Inspect the coordinates recorded in the dump:
head -n 30 backups/full_backup_0200am.sql | grep "CHANGE MASTER TO"
# Output example:
# -- CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000004', MASTER_LOG_POS=157;

------------------------------------------------------------------------
STEP 2: The Disaster Occurs (Simulated)
------------------------------------------------------------------------
# A fatal mistake occurs at 10:35:00 AM:
mysql -u root -p -e "DROP TABLE analytics_db.customers;"

------------------------------------------------------------------------
STEP 3: Inspect Binary Logs to Locate the Exact Disaster Position
------------------------------------------------------------------------
# Flush current binlog so we can read it safely:
mysql -u root -p -e "FLUSH LOGS;"

# Find the exact coordinates of the DROP TABLE statement using mysqlbinlog:
mysqlbinlog --base64-output=DECODE-ROWS -v /var/log/mysql/mysql-bin.000004 \
  | grep -B 5 -A 5 -i "DROP TABLE"

# Output will display the End_log_pos of the statement right BEFORE the DROP.
# Suppose:
#   Valid transaction ended at: end_log_pos 784210
#   DROP TABLE occurred at:     start_log_pos 784210, end_log_pos 784400

------------------------------------------------------------------------
STEP 4: Restore the Base Full Backup
------------------------------------------------------------------------
# Restore Monday 02:00 AM state:
mysql -u root -p < backups/full_backup_0200am.sql

------------------------------------------------------------------------
STEP 5: Replay Binary Log Up to the Precise Stop Position (PITR)
------------------------------------------------------------------------
# Replay all legitimate transactions that happened between 02:00 AM and 10:34:59 AM,
# stopping precisely BEFORE the DROP command at position 784210:

mysqlbinlog --start-position=157 --stop-position=784210 /var/log/mysql/mysql-bin.000004 \
  | mysql -u root -p

# Result: 
# All 50,000 orders placed throughout the morning are preserved, 
# and the catastrophic DROP TABLE is completely bypassed!
EOF

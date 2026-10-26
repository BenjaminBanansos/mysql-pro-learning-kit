# Month 5: High Availability, Replication & Security (Weeks 17 - 20)

## Objective
Design and operate resilient, enterprise-grade cloud database architectures with automated replication, read/write splitting, point-in-time disaster recovery, and hardened security controls.

---

### Week 17: MySQL Replication Architectures
- **Binary Log Fundamentals**:
  - Binlog Formats: `STATEMENT`, `ROW`, `MIXED`. Why `ROW` format is required for modern HA and data consistency.
  - Three-Thread Architecture: Binlog Dump Thread (Source), I/O Thread (Replica), SQL Thread (Replica Worker).
- **GTID-Based Replication (Global Transaction Identifiers)**:
  - Eliminating binlog file and coordinate offset mapping.
  - Automatic failover and repointing: `CHANGE MASTER TO MASTER_AUTO_POSITION = 1`.
  - Semi-Synchronous Replication: Guaranteeing zero data loss.

### Week 18: ProxySQL & Read/Write Splitting
- **Proxy Layer Fundamentals**:
  - Decoupling application connection pools from backend database instances.
  - Connection multiplexing: Serving thousands of application threads with minimal backend memory.
- **Intelligent Query Routing**:
  - Routing writes and `SELECT ... FOR UPDATE` to Master (Hostgroup 10).
  - Load-balancing read queries across horizontal read replicas (Hostgroup 20).
  - Handling replication lag: Dynamically shunning lagging nodes.
- **Hands-On Exercises**:
  - Review configuration in `04-portfolio-projects/project-3-cloud-ha-proxysql/proxysql.cnf`.

### Week 19: Enterprise Backup & Point-in-Time Recovery (PITR)
- **Backup Methodologies**:
  - Logical: `mysqldump` with `--single-transaction --flush-logs --master-data=2`.
  - Fast Parallel Dumps: `mydumper` / `myloader`.
  - Physical: `Percona XtraBackup` / `mysqlbackup` for zero-impact binary snapshot backups on 500GB+ databases.
- **Zero-Loss Point-in-Time Recovery**:
  - Restoring baseline snapshot and replaying binary logs up to exact transactions.
- **Hands-On Exercises**:
  - Run `03-labs-and-exercises/lab06_pitr_backup_recovery.sh`.

### Week 20: Hardened Enterprise Security & Compliance
- **Role-Based Access Control (RBAC)**:
  - Creating roles: `analyst_read`, `app_rw`, `db_admin`.
  - Applying principle of least privilege.
- **Data Protection & Compliance**:
  - Data-in-transit encryption (TLS / SSL enforcement).
  - Data-at-rest encryption (InnoDB tablespace encryption).
  - Preventing SQL Injection at the engine layer (Prepared Statements, parameter binding).
  - Enterprise Audit logging.

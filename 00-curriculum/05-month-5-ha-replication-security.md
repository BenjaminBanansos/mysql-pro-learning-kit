# Month 5: High Availability, Cloud Replication & AWS S3 Integration (Weeks 17 - 20)

## Objective
Design and operate resilient, enterprise-grade cloud database architectures with automated replication, ProxySQL read/write splitting, point-in-time disaster recovery, and native AWS S3 integration.

---

### Week 17: MySQL Replication Architectures & GTID
- **Binary Log Fundamentals**:
  - Binlog Formats: `STATEMENT`, `ROW`, `MIXED`. Why `ROW` format is required for modern HA and data consistency.
  - Three-Thread Architecture: Binlog Dump Thread (Source), I/O Thread (Replica), SQL Thread (Replica Worker).
- **GTID-Based Replication (Global Transaction Identifiers)**:
  - Eliminating binlog file and coordinate offset mapping.
  - Automatic failover and repointing: `CHANGE MASTER TO MASTER_AUTO_POSITION = 1`.
  - Semi-Synchronous Replication: Guaranteeing zero data loss.

### Week 18: ProxySQL & Automated Read/Write Splitting
- **Proxy Layer Fundamentals**:
  - Decoupling application connection pools from backend database instances.
  - Connection multiplexing: Serving thousands of application threads with minimal backend memory.
- **Intelligent Query Routing**:
  - Routing writes and `SELECT ... FOR UPDATE` to Master (Hostgroup 10).
  - Load-balancing read queries across horizontal read replicas (Hostgroup 20).
  - Handling replication lag: Dynamically shunning lagging nodes.

### Week 19: Enterprise Backups & Point-in-Time Recovery (PITR)
- **Backup Methodologies**:
  - Logical: `mysqldump` with `--single-transaction --flush-logs --master-data=2`.
  - Physical: `Percona XtraBackup` / `mysqlbackup` for zero-impact binary snapshot backups.
- **Zero-Loss Point-in-Time Recovery**:
  - Restoring baseline snapshot and replaying binary logs up to exact transactions.

### Week 20: Native AWS Aurora S3 Ingestion & Cloud Security
- **Native AWS S3 Integration**:
  - Ingesting directly across AWS's internal 100 Gbps network without downloading files to local machines:
    `LOAD DATA FROM S3 PREFIX 's3://nyc-tlc/...' INTO TABLE ...`.
- **Hardened Enterprise Security**:
  - Role-Based Access Control (RBAC): `app_readonly`, `app_write`, `db_admin`.
  - Data-in-transit encryption (TLS / SSL enforcement).
  - Data-at-rest encryption (InnoDB tablespace encryption).

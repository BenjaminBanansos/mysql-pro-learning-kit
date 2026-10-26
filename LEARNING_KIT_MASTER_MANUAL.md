# 📘 MySQL Intermediate to Pro: Master Engineering Manual & Complete Learning Kit

> **Author**: MySQL Pro Academy  
> **Target Audience**: Mid-Level Engineers, Data Engineers, Software Architects, Database Administrators  
> **Course Duration**: 6 Months (24 Weekly Intensive Modules)  
> **Data Scale**: 5.6 Million Standard Active Rows to Petabytes (AWS Open Data, Google Cloud, Hugging Face Hub)  
> **Live Platform**: [BenjaminBanansos.github.io/mysql-pro-learning-kit](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)  
> **Cloud Docker**: [Launch in GitHub Codespaces](https://codespaces.new/BenjaminBanansos/mysql-pro-learning-kit)  

---

## 📑 Table of Contents
1. [Course Architecture & Learning Philosophy](#1-course-architecture--learning-philosophy)
2. [Module 1: Advanced Analytical SQL on Cloud Big Data (Weeks 1 - 4)](#2-module-1-advanced-analytical-sql-on-cloud-big-data)
3. [Module 2: InnoDB Internals & Deep Indexing (Weeks 5 - 8)](#3-module-2-innodb-internals--deep-indexing)
4. [Module 3: Concurrency, MVCC & Transaction Tuning (Weeks 9 - 12)](#4-module-3-concurrency-mvcc--transaction-tuning)
5. [Module 4: Big Data Scaling, Partitioning & Petabytes (Weeks 13 - 16)](#5-module-4-big-data-scaling-partitioning--petabytes)
6. [Module 5: High Availability, Cloud Replication & AI Pretraining Pipelines (Weeks 17 - 20)](#6-module-5-high-availability-cloud-replication--ai-pretraining-pipelines)
7. [Module 6: Capstone Portfolio Projects & Staff-Level Interview Drills (Weeks 21 - 24)](#7-module-6-capstone-portfolio-projects--staff-level-interview-drills)
8. [Production SQL Syntax & Pattern Quick Reference](#8-production-sql-syntax--pattern-quick-reference)

---

## 1. Course Architecture & Learning Philosophy

Most database courses teach naive `SELECT * FROM table WHERE id = 1` queries on toy datasets containing 50 rows. In the real world, production databases handle tens of millions to billions of rows across high-concurrency cloud environments.

This Learning Kit bridges the gap between **writing basic queries** and **architecting, optimizing, and securing enterprise-grade databases**:

```
                                  6-MONTH MASTERY PROGRESSION
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Month 1: Advanced Analytical SQL  ► Execution Order, Window Functions, Recursive CTEs, FTS   │
│ Month 2: InnoDB Internals         ► B+ Trees, Buffer Pool LRU, Covering Indexes, EXPLAIN     │
│ Month 3: Concurrency & MVCC       ► Snapshot Isolation, Deadlock Elimination, Server Tuning │
│ Month 4: Big Data & Partitioning  ► RANGE Partitioning, Pruning, Spatial GIS, Bulk Streaming │
│ Month 5: High Availability & AI   ► GTID Replication, ProxySQL Routing, PITR, LLM Staging   │
│ Month 6: Capstone Repositories    ► 3 Standout GitHub Projects, Resume Polishing, 50 Q&As    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Module 1: Advanced Analytical SQL on Cloud Big Data

### 2.1 The True 10-Step Query Execution Pipeline
While SQL syntax begins with `SELECT`, the database engine evaluates queries in an entirely different 10-step sequence:

```
  Step 1: FROM                 (Identifies source tables)
     │
  Step 2: ON                   (Evaluates join conditions per row pair)
     │
  Step 3: JOIN                 (Produces combined virtual table)
     │
  Step 4: WHERE                (Filters individual rows before grouping)
     │
  Step 5: GROUP BY             (Aggregates filtered rows into distinct buckets)
     │
  Step 6: WITH ROLLUP / CUBE   (Adds dimensional super-aggregates)
     │
  Step 7: HAVING               (Filters aggregated groups)
     │
  Step 8: SELECT               (Evaluates projections, window functions & aliases)
     │
  Step 9: DISTINCT             (Deduplicates identical output tuples)
     │
  Step 10: ORDER BY            (Sorts the result set - can access SELECT aliases)
     │
  Step 11: LIMIT / OFFSET      (Paginates and truncates the stream)
```

> [!IMPORTANT]
> **The Senior Interview Trap**: Why does `WHERE total_price > 100` fail when `(unit_price * qty) AS total_price` is aliased in `SELECT`?  
> **Answer**: `WHERE` (Step 4) evaluates *before* `SELECT` (Step 8). At Step 4, the alias does not exist in memory yet. Solve using a CTE or repeating the arithmetic expression in `WHERE`.

### 2.2 Self-Joins & Market Basket Co-Occurrence
When finding pairs of items (e.g. Stack Overflow tags frequently co-occurring on the same question), join the table to itself using strict inequality:

```sql
SELECT 
    p1.tags AS tag_a,
    p2.tags AS tag_b,
    COUNT(*) AS shared_questions
FROM so_posts p1
JOIN so_posts p2 
    ON p1.post_id = p2.post_id 
   AND p1.tags < p2.tags -- CRITICAL: Prevents duplicate pairs (A,B) and (B,A) and self-pairs (A,A)
GROUP BY p1.tags, p2.tags
HAVING shared_questions >= 5
ORDER BY shared_questions DESC;
```

### 2.3 Window Functions Compared
Window functions evaluate aggregations across a defined partition of rows without collapsing the underlying row set:

| Feature | `ROW_NUMBER()` | `RANK()` | `DENSE_RANK()` | `NTILE(n)` |
| :--- | :--- | :--- | :--- | :--- |
| **Tie Handling** | Increments arbitrarily (1, 2, 3) | Same rank, leaves gaps (1, 1, 3) | Same rank, no gaps (1, 1, 2) | Buckets into $n$ equal quantiles |
| **Primary Use Case**| Pagination & Deduplication | Olympic-style leaderboards | Top-N business reporting | RFM customer segmentation |

```sql
-- Month-over-Month (MoM) Growth Rate via LAG():
WITH monthly_revenue AS (
    SELECT 
        DATE_FORMAT(pickup_datetime, '%Y-%m') AS trip_month,
        ROUND(SUM(total_amount), 2) AS revenue
    FROM nyc_yellow_taxi_trips
    GROUP BY DATE_FORMAT(pickup_datetime, '%Y-%m')
)
SELECT 
    trip_month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY trip_month) AS prev_month_revenue,
    ROUND((revenue - LAG(revenue, 1) OVER (ORDER BY trip_month)) / LAG(revenue, 1) OVER (ORDER BY trip_month) * 100.0, 2) AS mom_growth_pct
FROM monthly_revenue;
```

### 2.4 Recursive CTEs (Git DAG & Hierarchical Trees)
Recursive CTEs traverse parent-child Directed Acyclic Graphs (DAGs) like Git commit histories:

```sql
WITH RECURSIVE git_history AS (
    -- 1. Anchor Member: Current commit
    SELECT commit_sha, parent_sha, author_name, message, 1 AS depth
    FROM github_commits
    WHERE commit_sha = 'c3d4e5f6'

    UNION ALL

    -- 2. Recursive Member: Join on parent_sha
    SELECT c.commit_sha, c.parent_sha, c.author_name, c.message, gh.depth + 1
    FROM github_commits c
    JOIN git_history gh ON c.commit_sha = gh.parent_sha
    WHERE gh.depth < 10 -- 3. Termination Condition
)
SELECT depth, commit_sha, author_name, message FROM git_history;
```

---

## 3. Module 2: InnoDB Internals & Deep Indexing

### 3.1 InnoDB Memory & Disk Anatomy
InnoDB organizes physical storage in a strict structural hierarchy:
- **16KB Page** (`innodb_page_size`): The smallest atomic unit of disk I/O.
- **Extent**: 64 contiguous pages (1 MB).
- **Segment**: Dedicated extent allocation for leaf vs non-leaf B+ tree nodes.
- **Tablespace** (`.ibd`): The physical file storing table segments.

```
                         INNODB BUFFER POOL (70-80% RAM)
┌────────────────────────────────────────────────────────────────────────┐
│  Young Sublist (New 5/8)                      Old Sublist (Old 3/8)    │
│  [Hot Pages (Frequent Reads)] ◄─────────────► [Candidates for Eviction]│
└────────────────────────────────────────────────────────────────────────┘
                                    │
                    Write-Ahead Logging (WAL) Flush
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Redo Log Buffer ──► Redo Log Ring Files (ib_logfile0, ib_logfile1)   │
│  Doublewrite Buffer (DWB) ──► Tablespaces (.ibd Files on Disk)        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 The High-Cardinality Hash Indexing Pitfall
When indexing random hashes (e.g. SHA-1 commit hashes or Bitcoin transaction hashes):
1. **Sequential Keys (`AUTO_INCREMENT`)**: Append to the rightmost leaf with **15/16 page fill factor (~93.75% density)**.
2. **Random Hash Keys (SHA / UUIDv4)**: Land randomly in the middle of pages. Full pages trigger a **50-50 Page Split**, cutting storage density to **~50%** and causing severe buffer pool churn.
3. **The Solution**: Use a sequential integer clustered Primary Key (`id BIGINT AUTO_INCREMENT`), and store hashes in a secondary index packed with `BINARY(32)` instead of `CHAR(64)`.

### 3.3 Covering Indexes (Eliminating Clustered Bookmark Lookups)
A **Covering Index** contains all columns requested by a query, allowing MySQL to satisfy the entire result set directly from the secondary B+ tree index (`Using index` in `EXPLAIN Extra`):

```sql
-- SLOW: Scans secondary index, then performs 1,000,000 clustered index lookups (1,850ms)
SELECT pickup_location_id, pickup_datetime, total_amount
FROM nyc_yellow_taxi_trips
WHERE pickup_location_id = 132;

-- OPTIMIZATION: Composite Covering Index
CREATE INDEX idx_covering_trip ON nyc_yellow_taxi_trips (pickup_location_id, pickup_datetime, total_amount);

-- FAST: All data retrieved directly from secondary index leaves in 12ms (150x speedup!)
```

---

## 4. Module 3: Concurrency, MVCC & Transaction Tuning

### 4.1 Multi-Version Concurrency Control (MVCC)
In InnoDB, readers never block writers, and writers never block readers. Every physical clustered row contains three hidden system columns:
- `DB_TRX_ID` (6 Bytes): ID of the transaction that last modified the row.
- `DB_ROLL_PTR` (7 Bytes): Pointer backward along the **Undo Log Version Chain**.
- `DB_ROW_ID` (6 Bytes): Surrogate row ID (generated only if no explicit PK exists).

### 4.2 Row-Level Locking Types
1. **Record Lock**: Locks the index record itself.
2. **Gap Lock**: Locks the empty space between index records (prevents phantom inserts).
3. **Next-Key Lock**: Record Lock + Gap Lock (default locking mechanism in `REPEATABLE READ`).

### 4.3 The Canonical Deadlock Elimination Pattern
Deadlocks occur when two concurrent transactions acquire locks in opposing orders:
- Transaction 1: Locks Account A -> Waits for Account B.
- Transaction 2: Locks Account B -> Waits for Account A.

**The Mathematical Fix**: Sort account IDs canonically using `LEAST()` and `GREATEST()`:
```sql
-- 100% Deadlock Immune Transfer Stored Procedure Pattern:
SET @first_acct  = LEAST(p_from_acct, p_to_acct);
SET @second_acct = GREATEST(p_from_acct, p_to_acct);

-- Always lock in ascending order regardless of transfer direction:
SELECT current_balance FROM accounts WHERE account_id = @first_acct FOR UPDATE;
SELECT current_balance FROM accounts WHERE account_id = @second_acct FOR UPDATE;
```

---

## 5. Module 4: Big Data Scaling, Partitioning & Petabytes

### 5.1 The Primary Key Partitioning Constraint
> [!IMPORTANT]
> Every `PRIMARY KEY` and `UNIQUE KEY` on a partitioned table **MUST contain every column used in the partition function**.

```sql
CREATE TABLE nyc_yellow_taxi_trips (
    trip_id BIGINT NOT NULL AUTO_INCREMENT,
    pickup_datetime DATETIME NOT NULL,
    total_amount DECIMAL(10, 2),
    PRIMARY KEY (trip_id, pickup_datetime) -- MUST include pickup_datetime!
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(pickup_datetime)) (
    PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),
    PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),
    PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),
    PARTITION p2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_future  VALUES LESS THAN MAXVALUE
);
```

### 5.2 Zero-Downtime Data Lifecycle Aging (`DROP PARTITION`)
- `DELETE FROM table WHERE pickup_datetime < '2018-01-01';` acquires millions of row locks, thrashes undo logs, and takes hours.
- `ALTER TABLE nyc_yellow_taxi_trips DROP PARTITION p2017_q4;` deletes the underlying `.ibd` file directly from the filesystem in **under 15 milliseconds** with zero redo/undo log bloat.

---

## 6. Module 5: High Availability, Cloud Replication & AI Pretraining Pipelines

### 6.1 GTID-Based Replication Architecture
Global Transaction Identifiers (GTID) uniquely tag every transaction across the cluster:
- Eliminates manual binary log file coordinate tracking (`master_log_file`, `master_log_pos`).
- Three-thread execution: `Binlog Dump Thread` (Master) -> `I/O Thread` (Replica Relay Log) -> `SQL Apply Thread`.

### 6.2 ProxySQL Intelligent Query Routing
ProxySQL acts as a high-performance intermediary between applications and MySQL:
- Multiplexes 10,000 application client connections into 50 persistent database connections.
- Routes write operations (`INSERT`, `UPDATE`, `DELETE`, `SELECT ... FOR UPDATE`) to Hostgroup 10 (Master).
- Routes analytical `SELECT` statements to Hostgroup 20 (Read Replicas).

### 6.3 AI & LLM Pretraining Staging Pipelines (FineWeb 15T Tokens)
Before feeding massive web scrapes to LLM tokenizers, MySQL acts as a high-throughput metadata staging engine:
- Stores token counts, character lengths, and educational quality scores.
- Filters toxic and low-quality documents via SQL indexes before GPU ingestion, saving thousands of compute hours.

---

## 7. Module 6: Capstone Portfolio Projects & Staff-Level Interview Drills

### 7.1 The 3 Production Capstone Projects
1. **Developer Ecosystem Analytics Engine**: GitHub Public Archive + Stack Overflow (10M+ records, Git DAG recursive CTEs, covering index 100x speedup).
2. **Institutional Blockchain Ledger & ACID Settlement**: Bitcoin/Ethereum UTXO model, 50-thread stress tests, 100% deadlock immunity, real-time AML fraud detection.
3. **Petabyte Web & LLM Pretraining Data Pipeline**: Common Crawl WARC metadata, Hugging Face FineWeb 15T tokens, ProxySQL clustering, native Aurora S3 bulk pipelines.

### 7.2 Google XYZ Formula Resume Bullet Templates
- *"Architected a partitioned MySQL 8 cluster processing 5.6M+ transactions, reducing query p99 latency by 98% from 1,850ms to 18ms via composite covering indexes."*
- *"Implemented canonical lock ordering on high-throughput ledger stored procedures, eliminating transaction deadlocks (Error 1213) under 50 concurrent worker threads."*
- *"Built zero-downtime data lifecycle aging pipeline using quarterly RANGE partitioning, reducing data purge runtime from 45 minutes to 12 milliseconds."*

---

## 8. Production SQL Syntax & Pattern Quick Reference

```sql
-- 1. Check Raw Capacity & File Footprints
SELECT table_name, table_rows, ROUND(data_length/1024/1024, 2) AS data_mb, ROUND(index_length/1024/1024, 2) AS index_mb 
FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY (data_length + index_length) DESC;

-- 2. Verify Partition Pruning
EXPLAIN SELECT * FROM nyc_yellow_taxi_trips WHERE pickup_datetime BETWEEN '2023-01-01' AND '2023-02-01';

-- 3. Boolean Mode Full-Text Search
SELECT product_title, MATCH(title, body) AGAINST('+battery +"fast charge" -refurbished' IN BOOLEAN MODE) AS score 
FROM amazon_product_reviews WHERE MATCH(title, body) AGAINST('+battery +"fast charge" -refurbished' IN BOOLEAN MODE) ORDER BY score DESC LIMIT 20;

-- 4. Verify Active Row Locks & Transactions
SELECT trx_id, trx_state, trx_started, trx_tables_locked, trx_rows_locked FROM information_schema.innodb_trx;
```

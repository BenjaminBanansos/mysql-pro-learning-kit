# Month 2: InnoDB Internals & Deep Indexing on Cloud Datasets (Weeks 5 - 8)

## Objective
Master MySQL storage engine memory and disk architecture, B+ Tree mechanics, and query execution plan optimization using multi-million record cloud datasets from the **GitHub Public Archive** (`bigquery-public-data.github_repos`) and **AWS NYC Taxi Trips** (`s3://nyc-tlc/`).

---

### Week 5: InnoDB Memory & Disk Structures Under Heavy Write Workloads
- **Memory Structures**:
  - Buffer Pool sizing (70–80% physical RAM), LRU list (Young vs Old 5/8 split), Page Eviction policies.
  - Change Buffer: Buffering non-unique secondary index modifications.
  - Adaptive Hash Index (AHI) mechanics for in-memory fast lookups.
  - Log Buffer & Write-Ahead Logging (WAL).
- **Disk Structures**:
  - Tablespace files (`.ibd`), Segment -> Extent (1MB / 64 pages) -> Page (16KB) hierarchy.
  - Redo Log ring buffers and Doublewrite Buffer (DWB) preventing partial page writes on hardware crash.
- **Lab**: Inspecting `information_schema.innodb_buffer_page` and buffer pool hit ratios during cloud data ingestion.

### Week 6: B+ Tree Anatomy & Index Selectivity on GitHub Commits
- **B+ Tree Mechanics**:
  - Clustered index (Primary Key = physical row organization) vs Secondary index (Leaf stores PK pointer).
  - Page splits (50-50 splits vs sequential 15/16 appends) and page fill factors (`MERGE_THRESHOLD`).
- **High-Cardinality Hash Indexing Pitfall**:
  - Indexing 40-character SHA-1 commit hashes (`commit_sha`) vs auto-increment integer IDs.
  - Measuring random I/O thrashing and leaf page fragmentation on 10M+ GitHub commit records.
  - Index cardinality calculation: `COUNT(DISTINCT col) / COUNT(*)`.

### Week 7: Covering Indexes & Leftmost Prefix Rule (100x Speedup)
- **Covering Index Mastery**:
  - Satisfying queries entirely from the secondary index tree (`Using index` in Extra) without secondary-to-clustered bookmark lookups.
  - Composite Index Column Ordering Rule: Cardinality vs Equality filters vs Range filters.
- **Hands-On Optimization**:
  - Benchmarking NYC Taxi query: `SELECT pickup_location_id, pickup_datetime, total_amount FROM nyc_yellow_taxi_trips WHERE pickup_location_id = 132`.
  - Transforming a slow 4.8s clustered scan into an instant 0.04s covering index lookup.
  - Index Skip Scans in MySQL 8.0: Evaluating queries when prefix columns are omitted.

### Week 8: Query Execution Plan Diagnostics (`EXPLAIN ANALYZE`)
- **`EXPLAIN` Output Matrix**:
  - Access types: `system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`.
  - Interpreting `rows` vs `filtered` ratio and eliminating dangerous temporary disk tables (`Using temporary; Using filesort`).
- **`EXPLAIN ANALYZE` (MySQL 8.0.18+)**:
  - Actual execution time vs Optimizer cost estimates.
  - First-row latency (`startup cost`) vs total row delivery latency.
  - Eliminating filesorts on multi-million row GitHub commit and Stack Overflow datasets.

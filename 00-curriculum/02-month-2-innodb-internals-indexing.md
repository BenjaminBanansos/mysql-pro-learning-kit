# Month 2: InnoDB Internals & Deep Indexing on AWS Scale (Weeks 5 - 8)

## Objective
Master the internal memory and on-disk storage architecture of the MySQL InnoDB engine and engineer high-performance indexes on **multi-million row AWS Open Data tables** (NYC TLC Taxi & E-Commerce) achieving a 100x query speedup.

---

### Week 5: InnoDB Architecture & On-Disk Structures
- **Memory Structures**:
  - Buffer Pool: LRU list, Free list, Flush list, Buffer Pool Hit Ratio calculation on 1GB+ memory allocations.
  - Adaptive Hash Index (AHI): When InnoDB automatically creates hash pointers for hot pages.
  - Redo Log Buffer & Change Buffer.
- **Disk Structures**:
  - Tablespaces: System tablespace vs `file-per-table` (`.ibd` files).
  - Page Anatomy (16KB): File Header, Page Header, User records, Free space, Page Directory (sparse index).
  - Doublewrite Buffer: Prevention of torn pages and partial writes.

### Week 6: B+ Tree Anatomy & Leaf Page Splits
- **B+ Tree Mechanics on AWS NYC Taxi Data (3M+ Rows)**:
  - Clustered Index (Primary Key): Data leaf pages ordered by PK.
  - Secondary Index: Leaves contain the secondary key value + Primary Key (the "bookmark").
  - Leaf Page Splits: Measuring page fragmentation on high-throughput trip inserts (sequential monotonic vs random UUIDs).
- **Index Selectivity**:
  - Calculating cardinality: `COUNT(DISTINCT col) / COUNT(*)`.
  - Prefix Indexing: Optimal prefix length for long string attributes.

### Week 7: Covering Indexes & Leftmost Prefix Rule
- **The Covering Index Leap on AWS NYC Taxi**:
  - Designing a pure covering composite index on `(pickup_datetime, passenger_count, total_amount, tip_amount)`.
  - Eliminating the secondary-to-clustered bookmark lookup: reducing execution time from **1,850ms to 12ms (100x speedup)**.
  - Identifying `Using index` in `EXPLAIN`.
- **The Leftmost Prefix Rule**:
  - Column ordering strategy: Equality columns first, range columns last.
  - Index Skip Scan in MySQL 8: When the optimizer skips leading columns.

### Week 8: Query Execution Plan Mastery (EXPLAIN ANALYZE)
- **EXPLAIN Formats**:
  - `EXPLAIN FORMAT=TREE` and `EXPLAIN ANALYZE` on AWS datasets.
  - Comparing estimated costs against actual execution times (First row vs Last row) and row count loops.
- **Access Types Ranked (Best to Worst)**:
  `system` > `const` > `eq_ref` > `ref` > `fulltext` > `range` > `index` > `ALL` (Table scan).
- **Eliminating `Using temporary; Using filesort`** on multi-million row aggregations.

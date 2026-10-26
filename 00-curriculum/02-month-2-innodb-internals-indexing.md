# Month 2: InnoDB Internals & Deep Indexing (Weeks 5 - 8)

## Objective
Master the internal storage mechanisms of the MySQL InnoDB engine and engineer high-performance indexes capable of accelerating multi-million row queries by 10x - 100x.

---

### Week 5: InnoDB Architecture & On-Disk Structures
- **Memory Structures**:
  - Buffer Pool: LRU list, Free list, Flush list, Buffer Pool Hit Ratio calculation.
  - Adaptive Hash Index (AHI): When InnoDB automatically indexes hot memory pages.
  - Redo Log Buffer & Change Buffer.
- **Disk Structures**:
  - Tablespaces: System tablespace vs `file-per-table` (`.ibd` files).
  - Page Anatomy (16KB): File Header, Page Header, Infimum & Supremum records, User records, Free space, Page Directory (sparse index), File Trailer.
  - Doublewrite Buffer: Prevention of torn pages and partial writes.

### Week 6: B+ Tree Anatomy & Index Mechanics
- **B+ Tree Mechanics**:
  - Clustered Index (Primary Key): The table IS the index. Data leaf pages ordered by PK.
  - Secondary Index: Leaves contain the secondary key value + Primary Key (the "bookmark").
  - Leaf Page Splits: Cost of page fragmentation, fill factor (15/16 for sequential inserts, 50% for random inserts).
- **Index Selectivity**:
  - Calculating cardinality: `COUNT(DISTINCT col) / COUNT(*)`.
  - Prefix Indexing: Choosing optimal prefix length for long VARCHAR fields.

### Week 7: Covering Indexes & Composite Index Rules
- **The Covering Index Leap**:
  - Eliminating the secondary-to-clustered bookmark lookup.
  - Identifying `Using index` in `EXPLAIN`.
- **The Leftmost Prefix Rule**:
  - Column ordering strategy: Equality columns first, range columns last.
  - Index Skip Scan in MySQL 8: When the optimizer skips leading columns.
  - Invisible Indexes: Testing index removal in production without dropping data.

### Week 8: Query Execution Plan Mastery (EXPLAIN ANALYZE)
- **EXPLAIN Formats**:
  - `EXPLAIN FORMAT=TRADITIONAL`, `EXPLAIN FORMAT=TREE`, `EXPLAIN FORMAT=JSON`.
  - `EXPLAIN ANALYZE` (MySQL 8.0.18+): Comparing estimated costs against actual execution times (First row vs Last row) and row count loops.
- **Access Types Ranked (Best to Worst)**:
  `system` > `const` > `eq_ref` > `ref` > `fulltext` > `ref_or_null` > `index_merge` > `unique_subquery` > `index_subquery` > `range` > `index` > `ALL` (Table scan).
- **Hands-On Exercises**:
  - Run `03-labs-and-exercises/lab03_explain_analyze_mastery.sql`.
  - Profile 1M+ row queries and eliminate `Using filesort` and `Using temporary`.

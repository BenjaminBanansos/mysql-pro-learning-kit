# 50 Deep MySQL Pro Technical Interview Questions & Answers
### Curated for Senior Database Engineers, Backend Architects, and Staff Data Engineers

---

## Section 1: InnoDB Engine Architecture & Internals

### 1. What happens physically inside InnoDB during an `INSERT` statement before and after `COMMIT`?
**Answer**:
1. **Memory Allocation**: InnoDB searches the Buffer Pool for the target leaf page of the table's clustered index. If not in memory, the page is read from disk into the Buffer Pool.
2. **Undo Log**: An undo log record is written to enable rollback and support MVCC snapshots for other concurrent transactions.
3. **Change in Buffer Pool**: The row is inserted into the buffer pool page, marking the page "dirty".
4. **Redo Log (WAL)**: A redo log entry is written to the InnoDB Redo Log Buffer describing the physical page delta.
5. **Commit Phase**:
   - If `innodb_flush_log_at_trx_commit = 1`, the Redo Log Buffer is flushed and synced (`fsync()`) to disk. This satisfies the "D" (Durability) in ACID.
   - The Binary Log is flushed if `sync_binlog = 1` using a Two-Phase Commit (2PC) protocol coordinated with the Redo Log.
   - The actual dirty data page in the Buffer Pool is written to disk asynchronously later by master/flushing threads, NOT at the moment of commit.

### 2. What is the Doublewrite Buffer in InnoDB, and why does it exist?
**Answer**:
Operating systems typically write data in 4KB chunks, while InnoDB's default page size is 16KB. If a server loses power during a page write, a "partial page write" (torn page) can occur, leaving the page corrupted and unrecoverable via normal redo logs.
To prevent this, InnoDB writes dirty pages to a contiguous area of disk called the Doublewrite Buffer first (`fsync`), then writes to the actual `.ibd` data file. If a crash occurs during the `.ibd` write, InnoDB restores the pristine page from the doublewrite buffer before applying redo log recovery.

### 3. What is the difference between Redo Logs and Undo Logs?
**Answer**:
- **Redo Log**: Physical logging of byte-level changes applied to data pages. Used for **Crash Recovery** (rolling forward changes that were committed in memory but not yet flushed to tablespace disk).
- **Undo Log**: Logical record of inverse operations (e.g., if you inserted a row, undo stores the delete). Used for **Rollbacks** and **MVCC** (providing older consistent read views to other transactions without locking).

---

## Section 2: Deep Indexing & Query Optimization

### 4. Why does MySQL use B+ Trees instead of B-Trees or Hash Indexes for InnoDB?
**Answer**:
1. **Range Queries**: In a B+ Tree, only the leaf nodes store data/pointers, and all leaf nodes are connected via a doubly linked list. Traversing ranges (`WHERE date >= '2024-01-01'`) requires one root-to-leaf lookup, then sequentially following the linked list. In standard B-Trees, data is stored in internal nodes, requiring multiple tree traversals.
2. **Cache Density & Fan-Out**: Because non-leaf nodes only store search keys and page pointers, non-leaf pages hold many more keys (fan-out of 1000+). A 3-level B+ Tree can index over 20-50 million rows with only 3 I/O hops.
3. **Hash Index Limitations**: Hash indexes only support exact equality (`=`) and cannot do range scans, sorting (`ORDER BY`), or prefix matching.

### 5. What is a "Covering Index" and why does it give a 10x-100x performance leap?
**Answer**:
A covering index contains all the columns referenced by the `SELECT`, `WHERE`, `JOIN`, and `ORDER BY` clauses of a query.
When an index is covering, MySQL can resolve the query exclusively from the secondary index B+ Tree leaf pages in memory. It skips the expensive **Clustered Index Bookmark Lookup** (which performs random I/O to locate the primary key row for the remaining column values). In `EXPLAIN`, this is confirmed by `Using index` in the `Extra` column.

### 6. Explain the Leftmost Prefix Rule and how MySQL 8 Index Skip Scan modifies it.
**Answer**:
For an index on `(A, B, C)`:
- Query with `WHERE A = 1` or `WHERE A = 1 AND B = 2` uses the index.
- Query with `WHERE B = 2` traditionally cannot use the index because the tree is sorted primarily by column `A`.
- **MySQL 8 Index Skip Scan**: If column `A` has low cardinality (e.g., Gender or Country with few distinct values), MySQL 8 can perform multiple sub-scans, effectively executing: for each distinct `A`, scan `(A, B=2)`. While better than a full table scan, it is slower than a dedicated index on `(B)`.

---

## Section 3: Transactions, MVCC & Locking

### 7. How does MySQL InnoDB implement Multi-Version Concurrency Control (MVCC)?
**Answer**:
Every InnoDB row has hidden system columns:
- `DB_TRX_ID` (6 bytes): Transaction ID of the last transaction that inserted or modified the row.
- `DB_ROLL_PTR` (7 bytes): Pointer to the rollback segment in the undo log.
When a transaction starts under `REPEATABLE READ`, InnoDB creates a **Read View** snapshot. When reading a row:
1. If the row's `DB_TRX_ID` is older than the snapshot's minimum active ID, it's visible.
2. If the row's `DB_TRX_ID` is newer or belongs to an uncommitted transaction, InnoDB traverses the `DB_ROLL_PTR` backward through undo log versions until it finds a version committed prior to the snapshot.
This enables non-blocking consistent reads without acquiring shared read locks.

### 8. What is a Next-Key Lock and how does it prevent Phantom Reads?
**Answer**:
A Next-Key Lock is the combination of a **Record Lock** on the index record and a **Gap Lock** on the space immediately preceding that index record.
- In `REPEATABLE READ`, when a query executes `SELECT * FROM orders WHERE customer_id = 50 FOR UPDATE`, InnoDB not only locks existing rows where `customer_id = 50`, but also locks the "gaps" between index keys.
- If another concurrent transaction tries to `INSERT` a new order with `customer_id = 50`, its insert intention lock is blocked by the gap lock. This prevents a "phantom row" from appearing upon re-reading.

### 9. How do you resolve and prevent deadlocks in high-throughput applications?
**Answer**:
1. **Canonical Resource Ordering**: Always lock resources in a deterministic sequence across all application code paths (e.g., always lock the smaller `account_id` before the larger `account_id`).
2. **Keep Transactions Short**: Acquire locks as late in the transaction as possible and commit immediately.
3. **Index Predicates in UPDATE/DELETE**: Ensure `WHERE` clauses in updates use selective indexes; otherwise, InnoDB will lock entire table ranges.
4. **Lower Isolation Level**: Where acceptable, use `READ COMMITTED` which eliminates Gap Locks (except for foreign key checks and duplicate key checks).
5. **Application-Level Retry with Exponential Backoff**: Catch MySQL Error 1213 and automatically retry the transaction.

---

## Section 4: Big Data Scaling, Partitioning & High Availability

### 10. What is Partition Pruning and what is the primary restriction on Partition Keys?
**Answer**:
- **Partition Pruning**: The MySQL query optimizer examines the `WHERE` clause and excludes partitions that cannot contain matching rows, eliminating disk I/O on unneeded partitions.
- **Strict Restriction**: Every unique key (including the `PRIMARY KEY`) on the partitioned table **must include every column in the table's partitioning expression**. If a table has a primary key on `id`, you cannot partition by `RANGE (order_date)` unless the primary key is modified to `(id, order_date)`.

### 11. What is the difference between Asynchronous and Semi-Synchronous Replication?
**Answer**:
- **Asynchronous**: The primary writes to binlog and returns success to the client immediately. The replica pulls binlog events independently. If the primary crashes before replicas fetch the binlog, data loss occurs.
- **Semi-Synchronous**: The primary writes to binlog and waits until at least one replica has received and flushed the event to its Relay Log before committing to the client. This guarantees zero data loss on failover.

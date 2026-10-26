# Month 3: Concurrency, MVCC & ACID on Blockchain Ledgers (Weeks 9 - 12)

## Objective
Master ACID transaction isolation guarantees, row-level locking internals, deadlock prevention, and production server tuning using the immutable cryptographic ledger dataset from the **Bitcoin & Ethereum Public Blockchain** (`bigquery-public-data.crypto_bitcoin`).

---

### Week 9: ACID, WAL & Crash Recovery Tuning on Blockchain Transactions
- **Atomicity & Durability**:
  - Write-Ahead Logging (WAL): Redo log buffer -> Redo log files on disk -> Tablespaces.
  - Undo logs: Rollback segments and MVCC version histories in system/undo tablespaces.
- **Production Durability Tuning**:
  - `innodb_flush_log_at_trx_commit = 1` (Strict ACID) vs `= 2` (OS Cache) vs `= 0` (1-sec flush).
  - Double-write buffer synchronization with `sync_binlog = 1` for zero data loss.
- **Crash Recovery Mechanics**: Redo phase (rolling forward committed transactions) vs Undo phase (rolling back active uncommitted transactions).

### Week 10: Isolation Levels & MVCC Snapshot Mechanics
- **Isolation Levels Explained**:
  - `READ UNCOMMITTED` (Dirty Reads)
  - `READ COMMITTED` (Non-repeatable reads, read view refreshed every statement)
  - `REPEATABLE READ` (Default MySQL isolation, read view created at first read)
  - `SERIALIZABLE` (Implicit shared locks on all `SELECT` queries)
- **MVCC Internal Mechanics on Crypto Transactions**:
  - Clustered index hidden system columns: `DB_TRX_ID` (6 bytes), `DB_ROLL_PTR` (7 bytes), and `DB_ROW_ID`.
  - How concurrent blockchain block arrivals read consistent balances without acquiring shared locks.

### Week 11: Locking Internals & Mathematical Deadlock Immunity
- **Row-Level Lock Types**:
  - Record Locks (Locks index record itself).
  - Gap Locks (Locks the space between index records to eliminate Phantom Reads).
  - Next-Key Locks (Record Lock + Gap Lock).
  - Intention Locks (`IS`, `IX`) on table level.
- **Deadlock Mastery on Blockchain UTXO Transfers**:
  - Reproducing deadlocks under 50 concurrent worker threads transferring crypto balances between accounts.
  - Inspecting `SHOW ENGINE INNODB STATUS` deadlock graph reports.
  - **The Canonical Lock Ordering Solution**: Enforcing `LEAST(from_addr, to_addr)` ordering to mathematically guarantee 100% deadlock immunity.

### Week 12: Production Server Tuning & Slow Query Logs
- **Core my.cnf Optimization for 50,000+ TPS**:
  - Memory: `innodb_buffer_pool_size`, `innodb_buffer_pool_instances`, `join_buffer_size`, `sort_buffer_size`.
  - Concurrency: `innodb_thread_concurrency`, `max_connections`, `innodb_read_io_threads`.
- **Query Profiling & Diagnosis**:
  - Profiling queries with `long_query_time = 0.05` and `log_queries_not_using_indexes`.
  - Digesting slow logs using `pt-query-digest` to identify performance bottlenecks.

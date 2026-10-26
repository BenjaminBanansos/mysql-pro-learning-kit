# Month 3: Concurrency, MVCC & Transaction Tuning (Weeks 9 - 12)

## Objective
Attain Staff Database Engineer proficiency in multi-threaded concurrency, row-level locking, deadlock diagnostics, and production server performance tuning under high-frequency transaction loads.

---

### Week 9: ACID, WAL & Crash Recovery
- **ACID Deep Dive**:
  - Atomicity: Undo log rollback mechanics.
  - Consistency: Check constraints, foreign keys, application state transitions.
  - Isolation: Mitigating dirty reads, non-repeatable reads, and phantom reads.
  - Durability: Write-Ahead Logging (WAL) and `fsync()` guarantees.
- **Tuning Durability vs Throughput**:
  - `innodb_flush_log_at_trx_commit = 1` (Strict ACID) vs `2` (OS cache flush) vs `0` (Buffered in memory).
  - Benchmarking transactions per second (TPS) under varying commit levels.

### Week 10: Isolation Levels & MVCC Mechanics
- **The Four Isolation Levels**:
  - `READ UNCOMMITTED`: Dirty reads.
  - `READ COMMITTED`: Consistent reads per statement; gap locks disabled for normal queries.
  - `REPEATABLE READ` (MySQL Default): Consistent read view per transaction; phantom read prevention via Next-Key locks.
  - `SERIALIZABLE`: Implicit shared read locks on all queries.
- **MVCC Internal Tracking**:
  - System fields `DB_TRX_ID` and `DB_ROLL_PTR`.
  - Read View creation: `m_ids`, `min_trx_id`, `max_trx_id`, `creator_trx_id`.

### Week 11: Locking Internals & Deadlock Mastery
- **InnoDB Lock Types**:
  - Shared (S) vs Exclusive (X) locks.
  - Intention Locks (IS / IX) on tables.
  - Record Locks, Gap Locks, Next-Key Locks.
- **Deadlock Diagnostics**:
  - Deciphering `SHOW ENGINE INNODB STATUS`.
  - Interpreting the "LATEST DETECTED DEADLOCK" graph.
  - The Canonical Solution: Deterministic Lock Ordering (`LEAST`/`GREATEST`).
- **Hands-On Lab**:
  - Run `03-labs-and-exercises/lab04_deadlock_and_concurrency.py`.

### Week 12: Production Server Tuning & Observability
- **Core Parameters**:
  - `innodb_buffer_pool_size` (Rule of thumb: 70-80% of dedicated RAM).
  - `innodb_log_file_size` and `innodb_log_buffer_size`.
  - `max_connections`, `thread_cache_size`, `table_open_cache`.
- **Query Profiling & Slow Query Log**:
  - Profiling queries with `SHOW PROFILE` and `PERFORMANCE_SCHEMA`.
  - Configuring Slow Query Log (`long_query_time = 0.05`).
  - Summarizing logs with `mysqldumpslow` and `pt-query-digest`.

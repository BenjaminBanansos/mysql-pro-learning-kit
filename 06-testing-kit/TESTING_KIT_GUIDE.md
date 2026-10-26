# 🧪 MySQL Pro Enterprise Testing & Benchmarking Kit: Master Guide

This guide details the automated testing and benchmarking suite included in the **MySQL Intermediate to Pro Learning Kit**. The testing kit is engineered to provide senior engineers, students, and evaluators with automated verification of schema integrity, query correctness, ACID concurrency, and index optimization benchmarks.

---

## 🎯 Test Suite Architecture

```
                                      MYSQL PRO TESTING KIT
                                                │
         ┌───────────────────┬──────────────────┴───────────────────┬───────────────────┐
         ▼                   ▼                                      ▼                   ▼
┌─────────────────┐ ┌─────────────────┐                    ┌─────────────────┐ ┌─────────────────┐
│ Schema Integrity│ │ Analytical Logic│                    │ Concurrency &   │ │ Performance &   │
│ & Constraints   │ │ & CTE Unit Tests│                    │ Deadlock Stress │ │ Index Benchmarks│
│ (test_runner.py)│ │ (test_runner.py)│                    │(test_deadlock.py│ │(benchmark_*.py) │
└─────────────────┘ └─────────────────┘                    └─────────────────┘ └─────────────────┘
```

---

## 🚀 Quick Execution (1-Click Run)

To run the entire automated testing suite:

```bash
# Inside Codespaces or local terminal:
bash 06-testing-kit/run_all_tests.sh
```

---

## 📋 Test Modules Breakdown

### 1. Automated Unit & Integration Test Runner (`test_runner.py`)
- **Execution**: `python3 06-testing-kit/test_runner.py`
- **Scope**:
  - **Test Case 1: Schema Entity Verification**: Asserts that all core tables (`customers`, `products`, `orders`, `order_items`, `github_commits`, `so_posts`, `blockchain_transactions`, `fineweb_pretrain_docs`) exist and have expected primary keys.
  - **Test Case 2: Relational Integrity**: Asserts foreign key cascading rules and non-null constraints.
  - **Test Case 3: Advanced Analytical SQL**: Executes Window Functions (`DENSE_RANK`, `LAG`), verifying mathematical consistency of running aggregates and MoM growth computations.
  - **Test Case 4: Recursive CTE Traversal**: Traverses Git commit parent-child chains and asserts correct depth calculation.
  - **Test Case 5: JSON & Semi-Structured Data**: Validates JSON path operators (`->`, `->>`) and virtual column generation.

### 2. Concurrency & Deadlock Stress Test Suite (`test_deadlock_immunity.py`)
- **Execution**: `python3 06-testing-kit/test_deadlock_immunity.py --threads 30 --iterations 100`
- **Scope**:
  - Spawns 30 to 50 concurrent worker threads executing high-frequency cross-account balance transfers.
  - **Phase 1 (Naive Ordering)**: Demonstrates how un-ordered transfers trigger MySQL `ERROR 1213 (40001): Deadlock found when trying to get lock`.
  - **Phase 2 (Canonical Locking)**: Executes transfers using `LEAST(from_id, to_id)` and `GREATEST(from_id, to_id)` ordering.
  - **Assertion**: Verifies **Zero Deadlocks (0% failure rate)** and confirms **100% Conservation of Funds** (total balance before transfers == total balance after transfers).

### 3. Performance & Index Latency Benchmark Suite (`benchmark_performance.py`)
- **Execution**: `python3 06-testing-kit/benchmark_performance.py`
- **Scope**:
  - Compares query execution latency between:
    - **Scenario A**: Unindexed clustered scan requiring full table scan.
    - **Scenario B**: Composite Covering Index (`idx_covering`) satisfying query directly from index leaves.
  - **Metrics Measured**:
    - Minimum, Maximum, and Average execution times.
    - Statistical percentiles: **p50**, **p90**, **p95**, and **p99** latencies.
    - Speedup multiplier (asserting $> 50x$ improvement).

### 4. Partition Pruning Verification (`test_partition_pruning.sql`)
- **Execution**: Executes `EXPLAIN SELECT ...` on partitioned NYC Taxi and transaction tables.
- **Assertion**: Inspects optimizer partition elimination output, verifying that queries filtering on date ranges inspect only matching partitions (e.g. `p2023_q1`) and completely prune irrelevant partitions.

---

## 📊 Scorecard & Reporting

The test suite outputs a formatted terminal report:
```
========================================================================
                      MYSQL PRO TEST SUITE SCORECARD
========================================================================
  [PASS] Test 01: Core Table Schema & Primary Keys
  [PASS] Test 02: Analytical Window Functions & LAG Calculations
  [PASS] Test 03: Recursive CTE Git DAG Depth Traversal
  [PASS] Test 04: JSON Key Extraction & Virtual Column Indexing
  [PASS] Test 05: Concurrency Stress Test (0 Deadlocks under 30 Threads)
  [PASS] Test 06: Conservation of Financial Ledger Balances
  [PASS] Test 07: Covering Index Benchmark (> 50x Speedup Verified)
  [PASS] Test 08: Partition Pruning Execution Plan Verification
========================================================================
  OVERALL STATUS: 8/8 TESTS PASSED (100% GREEN)
========================================================================
```

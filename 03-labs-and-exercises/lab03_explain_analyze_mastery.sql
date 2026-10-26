-- ========================================================================
-- Lab 03: Deep Indexing & EXPLAIN ANALYZE Query Optimization
-- Database: analytics_db (1,000,000+ Orders, 2,500,000+ Items)
-- Focus: B+ Tree Traversals, Covering Indexes, Index Skip Scans, Filesort
-- ========================================================================

USE analytics_db;

-- ------------------------------------------------------------------------
-- SCENARIO 1: The Anatomy of EXPLAIN ANALYZE
-- Goal: Understand Actual Time (First Row .. Last Row), Loops, and Cost
-- ------------------------------------------------------------------------

-- Run with EXPLAIN ANALYZE:
EXPLAIN ANALYZE
SELECT 
    c.country,
    COUNT(o.order_id) AS order_count,
    ROUND(SUM(o.total_amount), 2) AS gross_sales
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2023-01-01' AND o.order_date < '2023-07-01'
  AND o.status = 'COMPLETED'
GROUP BY c.country
ORDER BY gross_sales DESC;

-- Key Interpretations:
-- 1. "cost=... rows=...": Optimizer's statistical GUESS prior to execution.
-- 2. "actual time=0.045..12.341 rows=1000 loops=1": REAL runtime in milliseconds.
-- 3. First time number = time to receive the FIRST row.
-- 4. Second time number = time to receive ALL rows for that node.

-- ------------------------------------------------------------------------
-- SCENARIO 2: Full Table Scan vs Covering Index (100x Speedup Lab)
-- ------------------------------------------------------------------------

-- Step 2.1: The Unoptimized Query (Requires reading table row data)
-- Query: Get order totals and discount for a specific customer date range
EXPLAIN ANALYZE
SELECT order_id, order_date, status, total_amount, discount_amount
FROM orders
WHERE customer_id = 45210
  AND order_date >= '2022-01-01'
ORDER BY order_date DESC;

-- Step 2.2: Create a Pure Covering Composite Index
-- An index is "Covering" if InnoDB can satisfy the entire query
-- directly from the B+ Tree leaf pages of the index without doing
-- secondary-to-clustered bookmark lookups!
ALTER TABLE orders 
ADD INDEX idx_covering_cust_date_perf (customer_id, order_date, status, total_amount, discount_amount);

-- Step 2.3: Re-run with the covering index
-- Notice the presence of "Covering index idx_covering_cust_date_perf" and massive drop in actual time!
EXPLAIN ANALYZE
SELECT order_id, order_date, status, total_amount, discount_amount
FROM orders
WHERE customer_id = 45210
  AND order_date >= '2022-01-01'
ORDER BY order_date DESC;

-- ------------------------------------------------------------------------
-- SCENARIO 3: Leftmost Prefix Rule & Multi-Column Index Ordering
-- ------------------------------------------------------------------------

-- Rule: An index on (A, B, C) can satisfy:
--   - WHERE A = ?
--   - WHERE A = ? AND B = ?
--   - WHERE A = ? AND B = ? AND C = ?
-- It CANNOT efficiently satisfy WHERE B = ? or WHERE C = ? alone!

-- Test A: Uses index prefix (Fast)
EXPLAIN FORMAT=TREE
SELECT * FROM customers 
WHERE country = 'USA' AND tier = 'PLATINUM';

-- Test B: Violates leftmost prefix (Skips column 1)
-- In MySQL 8, this may trigger an "Index Skip Scan" if cardinality is low,
-- otherwise falls back to a slow full table scan.
EXPLAIN FORMAT=TREE
SELECT * FROM customers 
WHERE tier = 'PLATINUM';

-- ------------------------------------------------------------------------
-- SCENARIO 4: Eliminating "Using temporary; Using filesort"
-- ------------------------------------------------------------------------

-- Slow Query: Grouping and sorting on columns from different tables or non-indexed order
EXPLAIN FORMAT=TREE
SELECT o.customer_id, SUM(o.total_amount) AS total_spent
FROM orders o
WHERE o.status = 'COMPLETED'
GROUP BY o.customer_id
ORDER BY total_spent DESC
LIMIT 10;

-- Notice "Sort: total_spent DESC" and "Temporary table with deduplication".
-- Memory limits (sort_buffer_size, tmp_table_size) dictate whether this spills to disk!

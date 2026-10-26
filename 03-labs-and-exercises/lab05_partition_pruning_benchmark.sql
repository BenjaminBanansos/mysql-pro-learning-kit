-- ========================================================================
-- Lab 05: Big Data Table Partitioning & Partition Pruning Benchmark
-- Database: partitioned_analytics_db vs analytics_db
-- Target: 1,000,000+ to 10,000,000+ Rows
-- Focus: Partition Pruning, Zero-Downtime Data Aging, Exchange Partition
-- ========================================================================

USE partitioned_analytics_db;

-- ------------------------------------------------------------------------
-- Part 1: Proving Partition Pruning
-- ------------------------------------------------------------------------

-- When querying a specific year, verify that MySQL ONLY touches partition p_2024!
EXPLAIN 
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS sale_month,
    COUNT(*) AS total_orders,
    ROUND(SUM(total_amount), 2) AS monthly_revenue
FROM orders_partitioned
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
GROUP BY DATE_FORMAT(order_date, '%Y-%m');

-- Look at the "partitions" column in the EXPLAIN output:
-- You will see: "partitions: p_2024"
-- Partitions p_2021, p_2022, p_2023, p_2025, p_future are NOT even opened or scanned!

-- Compare this with non-partitioned analytics_db.orders:
EXPLAIN 
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS sale_month,
    COUNT(*) AS total_orders,
    ROUND(SUM(total_amount), 2) AS monthly_revenue
FROM analytics_db.orders
WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
GROUP BY DATE_FORMAT(order_date, '%Y-%m');

-- ------------------------------------------------------------------------
-- Part 2: Zero-Cost Instant Data Aging / Purging (DBA Superpower)
-- ------------------------------------------------------------------------

-- Scenario: You must delete all order data from 2021 due to GDPR/retention policies.

-- THE WRONG WAY (In production on 10M rows):
-- DELETE FROM analytics_db.orders WHERE order_date < '2022-01-01';
-- Problems:
-- 1. Writes millions of Undo & Redo log records.
-- 2. Causes severe Buffer Pool churn and disk I/O spikes.
-- 3. Locks large ranges of rows, causing application timeouts.
-- 4. Leaves empty fragmented B+ Tree space (InnoDB table does not shrink!).

-- THE PRO PARTITIONED WAY:
-- Instant filesystem operation (< 10 milliseconds!):
ALTER TABLE orders_partitioned DROP PARTITION p_2021;
-- MySQL simply unlinks and deletes the underlying .ibd partition file.
-- Zero undo log, zero redo log overhead, zero locking delay!

-- ------------------------------------------------------------------------
-- Part 3: Adding New Partitions with REORGANIZE PARTITION
-- ------------------------------------------------------------------------

-- Because p_future uses VALUES LESS THAN (MAXVALUE), new partitions must be split:
ALTER TABLE orders_partitioned REORGANIZE PARTITION p_future INTO (
    PARTITION p_2026 VALUES LESS THAN ('2027-01-01 00:00:00'),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- Inspect partition metadata from INFORMATION_SCHEMA:
SELECT 
    table_name,
    partition_name,
    table_rows,
    ROUND(data_length / (1024 * 1024), 2) AS data_mb,
    ROUND(index_length / (1024 * 1024), 2) AS index_mb
FROM information_schema.partitions
WHERE table_name = 'orders_partitioned'
ORDER BY partition_ordinal_position;

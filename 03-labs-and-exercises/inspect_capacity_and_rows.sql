-- ========================================================================
-- Utility Script: Inspect Million-Row Counts & Raw Disk/Memory Capacity
-- Database: analytics_db, finance_db, partitioned_analytics_db
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1. Table-Level Raw Capacity Breakdown (Data vs Index vs Total in MB)
-- ------------------------------------------------------------------------
SELECT 
    table_schema AS `Database`,
    table_name AS `Table`,
    table_rows AS `Approx Rows`,
    ROUND(data_length / (1024 * 1024), 2) AS `Data Size (MB)`,
    ROUND(index_length / (1024 * 1024), 2) AS `Index Size (MB)`,
    ROUND((data_length + index_length) / (1024 * 1024), 2) AS `Total Disk (MB)`,
    ROUND(data_free / (1024 * 1024), 2) AS `Free / Fragmented (MB)`
FROM information_schema.tables
WHERE table_schema IN ('analytics_db', 'finance_db', 'partitioned_analytics_db')
ORDER BY (data_length + index_length) DESC;

-- ------------------------------------------------------------------------
-- 2. Exact Million-Row Counts Verification
-- ------------------------------------------------------------------------
SELECT 'analytics_db.customers' AS `Entity`, COUNT(*) AS `Exact Rows` FROM analytics_db.customers
UNION ALL
SELECT 'analytics_db.products', COUNT(*) FROM analytics_db.products
UNION ALL
SELECT 'analytics_db.orders', COUNT(*) FROM analytics_db.orders
UNION ALL
SELECT 'analytics_db.order_items', COUNT(*) FROM analytics_db.order_items
UNION ALL
SELECT 'analytics_db.user_events', COUNT(*) FROM analytics_db.user_events
UNION ALL
SELECT 'finance_db.financial_transactions', COUNT(*) FROM finance_db.financial_transactions
UNION ALL
SELECT 'partitioned_analytics_db.orders_partitioned', COUNT(*) FROM partitioned_analytics_db.orders_partitioned;

-- ------------------------------------------------------------------------
-- 3. Partitioned Table Physical Disk Capacity per Year/Partition
-- ------------------------------------------------------------------------
SELECT 
    partition_name AS `Partition`,
    table_rows AS `Partition Rows`,
    ROUND(data_length / (1024 * 1024), 2) AS `Data (MB)`,
    ROUND(index_length / (1024 * 1024), 2) AS `Index (MB)`,
    ROUND((data_length + index_length) / (1024 * 1024), 2) AS `Total Capacity (MB)`
FROM information_schema.partitions
WHERE table_name = 'orders_partitioned'
ORDER BY partition_ordinal_position;

-- ------------------------------------------------------------------------
-- 4. InnoDB Buffer Pool Memory Capacity & Utilization (RAM)
-- ------------------------------------------------------------------------
SELECT 
    pool_id AS `Buffer Pool ID`,
    ROUND(pool_size * 16 / 1024, 2) AS `Total RAM (MB)`,
    ROUND(database_pages * 16 / 1024, 2) AS `Used Data Cache (MB)`,
    ROUND(free_buffers * 16 / 1024, 2) AS `Free RAM (MB)`,
    ROUND((1 - (free_buffers / pool_size)) * 100, 2) AS `RAM Utilization %`
FROM information_schema.innodb_buffer_pool_stats;

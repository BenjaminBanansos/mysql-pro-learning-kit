-- ========================================================================
-- Schema: partitioned_analytics_db (Big Data Scale & Partition Pruning)
-- Focus: RANGE Partitioning, HASH Partitioning, and Maintenance
-- ========================================================================

CREATE DATABASE IF NOT EXISTS partitioned_analytics_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE partitioned_analytics_db;

-- 1. Orders Table Partitioned by RANGE COLUMNS (order_date)
-- Architectural Note: In MySQL, any unique key or primary key MUST include all columns
-- used in the partitioning expression. Thus PRIMARY KEY is (order_id, order_date).
CREATE TABLE IF NOT EXISTS orders_partitioned (
    order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_date DATETIME NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    status ENUM('COMPLETED', 'PROCESSING', 'SHIPPED', 'CANCELLED', 'REFUNDED') NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (order_id, order_date),
    KEY idx_part_orders_cust_date (customer_id, order_date),
    KEY idx_part_orders_status (status)
) ENGINE=InnoDB
PARTITION BY RANGE COLUMNS(order_date) (
    PARTITION p_2021 VALUES LESS THAN ('2022-01-01 00:00:00'),
    PARTITION p_2022 VALUES LESS THAN ('2023-01-01 00:00:00'),
    PARTITION p_2023 VALUES LESS THAN ('2024-01-01 00:00:00'),
    PARTITION p_2024 VALUES LESS THAN ('2025-01-01 00:00:00'),
    PARTITION p_2025 VALUES LESS THAN ('2026-01-01 00:00:00'),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- 2. Telemetry Logs Partitioned by HASH (customer_id)
-- Used when traffic is evenly distributed across a set of physical partition files
CREATE TABLE IF NOT EXISTS user_events_hash_partitioned (
    event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_time DATETIME NOT NULL,
    payload JSON NOT NULL,
    PRIMARY KEY (event_id, customer_id),
    KEY idx_hash_events_type (event_type, event_time)
) ENGINE=InnoDB
PARTITION BY HASH(customer_id)
PARTITIONS 8;

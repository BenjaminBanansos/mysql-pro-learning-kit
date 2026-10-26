-- ========================================================================
-- Portfolio Project 1: Materialized Summary Rollups & MySQL Event Scheduler
-- Goal: Provide sub-5ms analytics dashboard queries by maintaining pre-aggregations
-- ========================================================================

USE analytics_db;

-- 1. Create Pre-Aggregated Summary Table
CREATE TABLE IF NOT EXISTS daily_sales_rollup (
    summary_date DATE NOT NULL,
    country CHAR(3) NOT NULL,
    total_orders INT UNSIGNED NOT NULL DEFAULT 0,
    gross_revenue DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_discounts DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    avg_order_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (summary_date, country)
) ENGINE=InnoDB;

-- 2. Stored Procedure for Idempotent Rollup Refresh
DELIMITER $$

CREATE PROCEDURE sp_refresh_daily_sales_rollup(IN target_date DATE)
BEGIN
    INSERT INTO daily_sales_rollup (summary_date, country, total_orders, gross_revenue, total_discounts, avg_order_value)
    SELECT 
        DATE(o.order_date) AS summary_date,
        c.country,
        COUNT(o.order_id) AS total_orders,
        ROUND(SUM(o.total_amount), 2) AS gross_revenue,
        ROUND(SUM(o.discount_amount), 2) AS total_discounts,
        ROUND(AVG(o.total_amount), 2) AS avg_order_value
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE DATE(o.order_date) = target_date
      AND o.status = 'COMPLETED'
    GROUP BY DATE(o.order_date), c.country
    ON DUPLICATE KEY UPDATE
        total_orders = VALUES(total_orders),
        gross_revenue = VALUES(gross_revenue),
        total_discounts = VALUES(total_discounts),
        avg_order_value = VALUES(avg_order_value);
END$$

DELIMITER ;

-- 3. Turn ON Event Scheduler
SET GLOBAL event_scheduler = ON;

-- 4. Create Scheduled Nightly Maintenance Event
DROP EVENT IF EXISTS evt_nightly_rollup_refresh;

CREATE EVENT evt_nightly_rollup_refresh
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 2 HOUR)
COMMENT 'Refreshes previous day sales rollup every night at 2:00 AM'
DO
    CALL sp_refresh_daily_sales_rollup(DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY));

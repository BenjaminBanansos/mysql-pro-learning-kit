-- ========================================================================
-- Ultra-Fast Bulk Ingestion Scripts (Millions of Rows in Seconds)
-- Technique: LOAD DATA LOCAL INFILE with bulk optimization flags
-- ========================================================================

-- STEP 1: Maximize Session Performance for Ingestion
SET foreign_key_checks = 0;
SET unique_checks = 0;
SET sql_log_bin = 0;
SET autocommit = 0;

USE analytics_db;

-- Ingest Customers (~100k - 500k rows)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/customers.csv'
INTO TABLE customers
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(customer_id, email, first_name, last_name, country, city, tier, created_at);
COMMIT;

-- Ingest Products (~10k - 25k rows)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/products.csv'
INTO TABLE products
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(product_id, sku, name, category, base_price, cost_price, stock_quantity, is_active);
COMMIT;

-- Ingest Orders (~1,000,000+ rows)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(order_id, customer_id, order_date, status, payment_method, total_amount, discount_amount, tax_amount);
COMMIT;

-- Ingest Order Items (~2,500,000+ rows)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/order_items.csv'
INTO TABLE order_items
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(item_id, order_id, product_id, quantity, unit_price, subtotal);
COMMIT;

-- Ingest Clickstream Events (~1,000,000+ JSON rows)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/user_events.csv'
INTO TABLE user_events
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(event_id, @cust_id, event_type, event_time, payload)
SET customer_id = NULLIF(@cust_id, '\\N');
COMMIT;

-- STEP 2: Seed Finance DB Accounts and Transactions
USE finance_db;

-- Seed 50,000 Accounts automatically
INSERT INTO accounts (account_id, customer_id, account_number, currency, current_balance, status, created_at)
SELECT 
    c.customer_id,
    c.customer_id,
    CONCAT('US', LPAD(c.customer_id, 10, '0'), 'BANK'),
    'USD',
    ROUND(RAND() * 25000 + 500, 2),
    'ACTIVE',
    c.created_at
FROM analytics_db.customers c
LIMIT 50000;
COMMIT;

-- Ingest Financial Transactions (~1,000,000+ transactions)
LOAD DATA LOCAL INFILE '/var/lib/mysql-files/financial_transactions.csv'
INTO TABLE financial_transactions
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(txn_id, from_account_id, to_account_id, amount, currency, status, txn_type, is_flagged, created_at);
COMMIT;

-- STEP 3: Ingest Partitioned Orders
USE partitioned_analytics_db;

LOAD DATA LOCAL INFILE '/var/lib/mysql-files/orders.csv'
INTO TABLE orders_partitioned
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(order_id, customer_id, order_date, status, payment_method, total_amount, discount_amount, tax_amount);
COMMIT;

-- Re-enable constraints and safety checks
SET foreign_key_checks = 1;
SET unique_checks = 1;
SET sql_log_bin = 1;
SET autocommit = 1;

-- Verification Queries
SELECT 'analytics_db.customers' AS tbl, COUNT(*) AS row_cnt FROM analytics_db.customers
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

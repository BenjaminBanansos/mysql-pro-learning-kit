-- ========================================================================
-- Schema: analytics_db (E-Commerce, Clickstream & Cloud Analytics)
-- Target Scale: 1,000,000+ orders, 2,500,000+ items, 1,000,000+ JSON events
-- ========================================================================

CREATE DATABASE IF NOT EXISTS analytics_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE analytics_db;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country CHAR(3) NOT NULL,
    city VARCHAR(100) NOT NULL,
    tier ENUM('STANDARD', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'STANDARD',
    created_at DATETIME NOT NULL,
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customer_email (email),
    KEY idx_customers_country_tier (country, tier),
    KEY idx_customers_created_at (created_at)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 2. Products Table (Includes Full-Text Search indexing)
CREATE TABLE IF NOT EXISTS products (
    product_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    sku VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (product_id),
    UNIQUE KEY uq_product_sku (sku),
    KEY idx_products_category_price (category, base_price),
    FULLTEXT KEY ft_product_name (name)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id INT UNSIGNED NOT NULL,
    order_date DATETIME NOT NULL,
    status ENUM('COMPLETED', 'PROCESSING', 'SHIPPED', 'CANCELLED', 'REFUNDED') NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (order_id),
    KEY idx_orders_customer_id (customer_id),
    KEY idx_orders_date_status (order_date, status),
    KEY idx_orders_status_date (status, order_date), -- Used in composite indexing trade-off labs
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (item_id),
    KEY idx_order_items_order_id (order_id),
    KEY idx_order_items_product_id (product_id),
    -- Covering index for order-level item aggregate rollups:
    KEY idx_covering_order_summary (order_id, product_id, quantity, subtotal),
    CONSTRAINT fk_items_order
        FOREIGN KEY (order_id) REFERENCES orders (order_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_items_product
        FOREIGN KEY (product_id) REFERENCES products (product_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 5. User Events Table (Modern MySQL 8 Native JSON & Generated Columns)
CREATE TABLE IF NOT EXISTS user_events (
    event_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id INT UNSIGNED NULL,
    event_type VARCHAR(50) NOT NULL,
    event_time DATETIME NOT NULL,
    payload JSON NOT NULL,
    -- MySQL 8 Generated Virtual Column extracted from JSON:
    device VARCHAR(32) GENERATED ALWAYS AS (payload->>'$.device') VIRTUAL,
    session_id VARCHAR(64) GENERATED ALWAYS AS (payload->>'$.session_id') VIRTUAL,
    PRIMARY KEY (event_id),
    KEY idx_events_customer_time (customer_id, event_time),
    KEY idx_events_type_time (event_type, event_time),
    KEY idx_events_device (device),
    KEY idx_events_session (session_id)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

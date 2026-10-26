# Data Dictionary & Entity Reference (Millions of Data Points)

This kit provides realistic enterprise datasets designed to test query planners, index selectivity, locking concurrency, and partitioning at the scale of millions of records.

---

## 1. E-Commerce & Telemetry Database (`analytics_db`)

### `customers` (100,000 - 500,000 rows)
- `customer_id` (INT UNSIGNED, PK, AUTO_INCREMENT): Unique customer identifier.
- `email` (VARCHAR(255), UNIQUE): Contact email address.
- `first_name`, `last_name` (VARCHAR(100)): Customer name.
- `country` (CHAR(3)): ISO-3 country code (Cardinality: 10). High frequency for grouping and indexing tests.
- `city` (VARCHAR(100)): Residential city.
- `tier` (ENUM('STANDARD', 'SILVER', 'GOLD', 'PLATINUM')): Customer loyalty status.
- `created_at` (DATETIME): Account registration timestamp.

### `products` (10,000 - 25,000 rows)
- `product_id` (INT UNSIGNED, PK, AUTO_INCREMENT): Unique product identifier.
- `sku` (VARCHAR(64), UNIQUE): Stock keeping unit.
- `name` (VARCHAR(255)): Product catalog title (Used for Full-Text Search exercises).
- `category` (VARCHAR(100)): Product vertical (Electronics, Books, etc.).
- `base_price` (DECIMAL(10,2)): Customer facing catalog price.
- `cost_price` (DECIMAL(10,2)): COGS for gross margin profitability calculations.
- `stock_quantity` (INT): Current warehouse inventory level.
- `is_active` (TINYINT(1)): Soft-delete status flag.

### `orders` (1,000,000 - 3,000,000 rows)
- `order_id` (BIGINT UNSIGNED, PK, AUTO_INCREMENT): Unique order number.
- `customer_id` (INT UNSIGNED, FK -> customers): Purchasing entity.
- `order_date` (DATETIME): Transaction timestamp (Spans 3 years; critical for range indexing & partitioning).
- `status` (ENUM('COMPLETED', 'PROCESSING', 'SHIPPED', 'CANCELLED', 'REFUNDED')): Fulfillment state.
- `payment_method` (VARCHAR(50)): Method of settlement.
- `total_amount` (DECIMAL(12,2)): Gross settled invoice amount.
- `discount_amount` (DECIMAL(10,2)): Coupon or promotional price reduction.
- `tax_amount` (DECIMAL(10,2)): Calculated tax.

### `order_items` (2,500,000 - 7,500,000 rows)
- `item_id` (BIGINT UNSIGNED, PK, AUTO_INCREMENT): Line item identifier.
- `order_id` (BIGINT UNSIGNED, FK -> orders): Parent order.
- `product_id` (INT UNSIGNED, FK -> products): Purchased item.
- `quantity` (SMALLINT UNSIGNED): Quantity purchased.
- `unit_price` (DECIMAL(10,2)): Captured price at the time of purchase.
- `subtotal` (DECIMAL(12,2)): `quantity * unit_price`.

### `user_events` (1,000,000 - 5,000,000 rows)
- `event_id` (BIGINT UNSIGNED, PK, AUTO_INCREMENT): Clickstream log sequence.
- `customer_id` (INT UNSIGNED, NULLABLE): Authenticated user ID (NULL if anonymous visitor).
- `event_type` (VARCHAR(50)): Event name (`page_view`, `search`, `add_to_cart`, `checkout_step`).
- `event_time` (DATETIME): Event occurrence timestamp.
- `payload` (JSON): Native MySQL 8 JSON document containing session ID, IP, device, user agent, query terms, response latency, and arbitrary telemetry.

---

## 2. High-Throughput Financial Ledger (`finance_db`)

### `financial_transactions` (1,000,000 - 3,000,000 rows)
- `txn_id` (BIGINT UNSIGNED, PK, AUTO_INCREMENT): Monotonic transaction ID.
- `from_account_id` (BIGINT UNSIGNED): Originating ledger account.
- `to_account_id` (BIGINT UNSIGNED): Beneficiary ledger account.
- `amount` (DECIMAL(15,2)): Transaction monetary quantity.
- `currency` (CHAR(3)): Standard ISO-4217 currency code.
- `status` (ENUM('SETTLED', 'PENDING', 'REVERSED', 'FAILED')): Settlement state.
- `txn_type` (VARCHAR(30)): Transfer, Payment, Withdrawal, Deposit.
- `is_flagged` (TINYINT(1)): AML/Fraud compliance heuristic alert.
- `created_at` (DATETIME): Ledger entry timestamp.

### `accounts` (50,000 rows)
- `account_id` (BIGINT UNSIGNED, PK): Account number.
- `customer_id` (INT UNSIGNED): Associated customer.
- `current_balance` (DECIMAL(15,2)): Real-time account balance (Used for ACID isolation & concurrency row-locking challenges).
- `status` (ENUM('ACTIVE', 'FROZEN', 'CLOSED')): Operational state.
- `version` (INT UNSIGNED): Optimistic locking concurrency token.

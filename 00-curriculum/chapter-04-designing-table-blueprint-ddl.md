# Chapter 4: Designing the Table Blueprint (DDL & Data Types)

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 55 min study  
> **Cloud Container:** `MySQL 8.0 DDL • Schema Engineering`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Master Data Definition Language (DDL): create robust schemas using CREATE TABLE, choose the right numeric, string, and temporal data types, and enforce data integrity with PRIMARY KEY, NOT NULL, and CHECK constraints.

---

## 📖 In-Depth Lesson Content

Before you can load a single row from an AWS S3 bucket or CSV file, MySQL needs a strict **Blueprint** called a **Table Schema**.

### 1. Creating and Dropping Tables
In SQL, schemas are built using **DDL (Data Definition Language)**:
- `CREATE TABLE [table_name] (...)`: Creates a new table structure.
- `DROP TABLE IF EXISTS [table_name]`: Safely deletes a table if it already exists, avoiding errors when re-running initialization scripts.

### 2. Choosing the Right Data Types
Choosing the wrong data type leads to wasted disk storage, slow queries, and arithmetic rounding bugs. Here is the golden guide:

#### A. Numeric Types:
- `TINYINT`: 1 byte (-128 to 127). Perfect for status flags (0 = pending, 1 = completed) or ratings (1 to 5 stars).
- `INT`: 4 bytes (-2.14 billion to +2.14 billion). The standard choice for IDs and row counts.
- `BIGINT`: 8 bytes. Used for identifiers in massive tables (like cryptocurrency wei or taxi trip counters exceeding 2 billion).
- `DECIMAL(M, D)`: Exact fixed-point numeric. `M` is total digits, `D` is decimal places. **ALWAYS use `DECIMAL(10,2)` for money!** Never use `FLOAT` or `DOUBLE` for financial amounts, because floating-point binary math creates rounding errors (e.g. $0.1 + 0.2 = 0.30000000000000004$).

#### B. Character / String Types:
- `VARCHAR(N)`: Variable-length string up to $N$ characters. If you store "NYC" in a `VARCHAR(50)`, it only consumes 3 bytes of data plus 1 byte of length overhead.
- `TEXT`: Used for long, unbounded descriptions or blog post bodies.

#### C. Temporal (Date & Time) Types:
- `DATE`: Stores date only (`YYYY-MM-DD`).
- `DATETIME`: Stores date and time (`YYYY-MM-DD HH:MM:SS`).
- `TIMESTAMP`: Stores UTC timestamp and automatically adjusts to the server's time zone.

### 3. Constraints: Enforcing Business Rules
Constraints prevent corrupt data from ever entering your database:
- `PRIMARY KEY`: Guarantees every row has a unique identifier and automatically creates a clustered B+ Tree index.
- `NOT NULL`: Rejects any attempt to insert an empty/missing value.
- `DEFAULT [val]`: Automatically supplies a value if none is provided.
- `CHECK (expression)`: Rejects rows that violate a logical condition (e.g., `CHECK (base_price > 0)`).

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       TABLE SCHEMA BLUEPRINT ARCHITECTURE                     |
+-------------------------------------------------------------------------------+
  CREATE TABLE products (
    product_id   INT PRIMARY KEY,              <- Unique row identifier (B+ Tree)
    name         VARCHAR(100) NOT NULL,        <- Variable text (1 to 100 chars)
    category     VARCHAR(50) NOT NULL,         <- Product bucket
    base_price   DECIMAL(10,2) NOT NULL,       <- Exact currency (No float drift!)
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP, <- Auto timestamp
    CONSTRAINT chk_price CHECK (base_price > 0) <- Rejects negative prices
  );
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- Always use `DECIMAL(10,2)` for currency and money—never use FLOAT or DOUBLE due to rounding drift.
- Every table should declare a PRIMARY KEY to guarantee unique identity and fast row lookup.
- CHECK constraints enforce domain invariants at the engine level, preventing bad data from entering the database.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `NYC TLC Yellow Taxi Schema`
- **Target Table:** `nyc_taxi_trips`
- **Title:** NYC Taxi Trip Record Schema Design
- **Description:** Taxi trip records capture pickup and dropoff datetimes, passenger counts (TINYINT), trip distance (DECIMAL), and fare totals (DECIMAL). Strict typing ensures fare computations reconcile with credit card merchant accounts.

---

## 💻 Hands-On SQL Production Query
**Create an E-Commerce Products Table Schema**

```sql
-- Create a robust products schema with primary key and price check
CREATE TABLE IF NOT EXISTS demo_products (
    product_id   INT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    base_price   DECIMAL(10,2) NOT NULL,
    created_at   DATETIME DEFAULT '2024-01-01 00:00:00',
    CHECK (base_price > 0)
);

-- Insert sample records
INSERT INTO demo_products (product_id, name, category, base_price) VALUES
(1, 'Cloud Data Engineering Handbook', 'Books', 49.99),
(2, 'Mechanical Ergonomic Keyboard', 'Hardware', 129.50);

-- Query the created schema
SELECT * FROM demo_products;
```

### Query Breakdown & Mechanics:
Demonstrates DDL creation of a table with proper data types (INT, VARCHAR, DECIMAL, DATETIME), enforces a CHECK constraint ensuring prices are positive, inserts sample rows, and queries the result.

---

## ⚠️ Senior DBA Production Pitfalls
> Using FLOAT or DOUBLE for financial transactions causes pennies to vanish due to IEEE-754 binary floating-point representation. Always declare monetary amounts as DECIMAL(10,2).

---

## 🏋️ Chapter Hands-On Exercise & Challenge
Write a `CREATE TABLE` statement for a `taxi_trips` table containing `trip_id` (Primary Key), `pickup_time` (DATETIME), `passenger_count` (TINYINT), and `total_fare` (DECIMAL with 2 decimal places).

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- Chapter 4 Solution: Designing the taxi_trips schema
CREATE TABLE IF NOT EXISTS taxi_trips (
    trip_id         BIGINT PRIMARY KEY,
    pickup_time     DATETIME NOT NULL,
    passenger_count TINYINT NOT NULL DEFAULT 1,
    total_fare      DECIMAL(10,2) NOT NULL CHECK (total_fare >= 0)
);
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** Which data type should you ALWAYS use to store financial monetary amounts in MySQL?

1. DECIMAL(10,2) — because it stores exact fixed-point numbers with zero rounding drift **[CORRECT]**
2. FLOAT — because it is faster and allows infinite decimals
3. VARCHAR(20) — because numbers should be stored as plain text
4. TINYINT — because money never exceeds 100 dollars

> **Explanation:** DECIMAL stores exact fixed-point numbers with strict precision. FLOAT and DOUBLE use binary floating-point math which introduces tiny rounding discrepancies that corrupt financial ledgers.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

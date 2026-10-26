# Chapter 5: Blazing-Fast Ingestion: Loading Cloud Data into MySQL

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 50 min study  
> **Cloud Container:** `High-Speed CSV / TSV Cloud File Loading`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Learn how production database engineers ingest millions of rows from cloud containers in seconds using LOAD DATA LOCAL INFILE instead of slow line-by-line INSERT statements.

---

## 📖 In-Depth Lesson Content

Imagine you just downloaded a 1-million row taxi trips CSV file from an AWS S3 bucket. If you write a Python script that runs `INSERT INTO taxi_trips VALUES (...)` in a loop, it will take over **4 hours** to complete!

Why? Because each individual `INSERT` sends a separate network packet, opens a transaction, locks rows, writes to the transaction log (redo log), and waits for disk confirmation.

### 1. The Production Solution: LOAD DATA LOCAL INFILE
MySQL provides a built-in bulk streaming command called `LOAD DATA LOCAL INFILE`. It reads raw CSV or TSV files directly from your hard drive, bypasses the SQL parser for each row, and writes memory pages in massive batches.
- Speed: **100,000+ rows per second** (1 million rows loads in ~10 seconds!).

### 2. Anatomy of the LOAD DATA Command
```sql
LOAD DATA LOCAL INFILE '/path/to/yellow_tripdata.csv'
INTO TABLE nyc_taxi_trips
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(trip_id, pickup_datetime, dropoff_datetime, passenger_count, trip_distance, total_amount);
```

Let's break down each clause:
1. `FIELDS TERMINATED BY ','`: Tells MySQL that columns are separated by commas (use `'\t'` for tab-separated TSV files like Amazon Reviews).
2. `ENCLOSED BY '"'`: Handles fields that have quotes around them (e.g., `"New York, NY"` where the comma inside the city name should not be treated as a column separator).
3. `LINES TERMINATED BY '\n'`: Tells MySQL where each row ends.
4. `IGNORE 1 ROWS`: Skips the very first header line of the CSV (`id,name,price...`) so it doesn't get inserted as invalid data!
5. Column list `(...)`: Explicitly maps CSV columns to your table's columns.

### 3. Handling Date Mismatches with Variables
Sometimes a CSV file has dates formatted as `MM/DD/YYYY`, but MySQL requires `YYYY-MM-DD`. You can load the raw string into a temporary variable `@date_str` and transform it on the fly:

```sql
LOAD DATA LOCAL INFILE 'orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ','
IGNORE 1 ROWS
(order_id, customer_id, @date_str, total_amount)
SET order_date = STR_TO_DATE(@date_str, '%m/%d/%Y');
```

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       HIGH-SPEED BULK INGESTION PIPELINE                      |
+-------------------------------------------------------------------------------+
  Line-by-Line INSERT INTO:
  [Row 1] -> Network Round-Trip -> Parser -> Log Flush -> Disk Commit (100 rows/s)
  [Row 2] -> Network Round-Trip -> Parser -> Log Flush -> Disk Commit (Slow!)

  LOAD DATA LOCAL INFILE:
  [CSV on Disk] ══════════> [Streaming Buffer] ══════════> [InnoDB Buffer Pool]
                             (100,000+ rows/sec direct batch page write!)
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- `LOAD DATA LOCAL INFILE` is 50x to 100x faster than running individual INSERT statements.
- Always use `IGNORE 1 ROWS` to prevent CSV column headers from being inserted as corrupt data rows.
- Delimiters (`FIELDS TERMINATED BY` and `ENCLOSED BY`) ensure commas inside quoted text don't split columns.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `s3://amazon-reviews-pds/tsv/`
- **Target Table:** `amazon_reviews`
- **Title:** Bulk Ingesting Amazon Reviews TSV Data
- **Description:** Amazon customer review datasets use tab delimiters ('\t') rather than commas because review text naturally contains commas. Bulk loading with FIELDS TERMINATED BY '\t' imports millions of reviews without parsing collisions.

---

## 💻 Hands-On SQL Production Query
**Inspect Loaded Cloud Datasets and Row Counts**

```sql
-- Inspect record counts across our ingested cloud tables
SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers
UNION ALL
SELECT 'orders' AS table_name, COUNT(*) AS row_count FROM orders
UNION ALL
SELECT 'products' AS table_name, COUNT(*) AS row_count FROM products
UNION ALL
SELECT 'cloud_datasets' AS table_name, COUNT(*) AS row_count FROM cloud_datasets;
```

### Query Breakdown & Mechanics:
Uses UNION ALL to combine record counts across 4 core tables in the database, verifying that data ingestion has populated the relational tables for querying.

---

## ⚠️ Senior DBA Production Pitfalls
> Forgetting 'IGNORE 1 ROWS' will attempt to insert column header strings like 'price' into numeric columns, throwing a data truncation or type mismatch error.

---

## 🏋️ Chapter Hands-On Exercise & Challenge
What does the `IGNORE 1 ROWS` clause do in a `LOAD DATA` statement, and what error occurs if you omit it when importing a CSV with headers?

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- 'IGNORE 1 ROWS' skips the first line of the file (the header containing column names).
-- If omitted, MySQL attempts to parse text strings like 'total_fare' into numeric columns,
-- resulting in an 'Incorrect decimal value' or 'Data truncation' error.
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** Why is 'LOAD DATA LOCAL INFILE' preferred over individual 'INSERT INTO' statements for importing large CSV datasets?

1. It streams records in memory batches, bypassing per-row network roundtrips and parser overhead (100x faster) **[CORRECT]**
2. It automatically translates foreign languages in review text to English
3. It encrypts the CSV file and deletes it from disk immediately
4. It can only load a maximum of 10 rows at a time

> **Explanation:** LOAD DATA LOCAL INFILE streams data in large memory blocks directly into InnoDB pages, bypassing individual SQL parsing and transaction overhead for each row.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

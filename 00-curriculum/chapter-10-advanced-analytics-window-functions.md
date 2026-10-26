# Chapter 10: Advanced Analytics, Window Functions & Real-World Capstone

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 60 min study  
> **Cloud Container:** `Multi-Cloud Analytics Capstone • Bitcoin, NYC Taxi & FineWeb`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Master advanced analytics using Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD), compute running totals, and complete 10 hands-on capstone challenges analyzing multi-cloud datasets.

---

## 📖 In-Depth Lesson Content

Welcome to the Graduation Chapter! You have journeyed from knowing zero SQL to designing schemas, ingesting cloud data, filtering, and joining tables.

Now, we unlock **Window Functions**—the secret weapon of Senior Data Engineers and Business Intelligence Architects.

### 1. What is a Window Function?
Standard `GROUP BY` collapses multiple rows into a single summary row.
A **Window Function** performs calculations across related rows **WITHOUT collapsing the rows**! Each row retains its individual identity while displaying computed group rankings, running totals, and moving averages.

### 2. Ranking Functions: `ROW_NUMBER`, `RANK`, `DENSE_RANK`
- `ROW_NUMBER()`: Assigns a strict sequential integer (1, 2, 3, 4...) with no ties.
- `RANK()`: Assigns ranks with ties, skipping subsequent ranks (1, 2, 2, 4...).
- `DENSE_RANK()`: Assigns ranks with ties, but **never skips** numbers (1, 2, 2, 3...).

```sql
-- Rank products by price within each category
SELECT 
    product_id,
    name,
    category,
    base_price,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) AS category_rank
FROM products;
```
- `PARTITION BY category`: Resets the ranking counter for each product category!
- `ORDER BY base_price DESC`: Determines the ranking order inside each category partition.

### 3. Navigating Adjacent Rows: `LAG()` and `LEAD()`
In spreadsheets, you can easily reference cell `A1` and `A2`. In traditional SQL, rows are independent.
`LAG()` and `LEAD()` allow you to look at previous or next rows without self-joins:
- `LAG(column, 1)`: Accesses the value of the row immediately before the current row. Perfect for calculating month-over-month growth or time between taxi trips!
- `LEAD(column, 1)`: Accesses the value of the row immediately after the current row.

### 4. Running Totals (Cumulative Sums)
```sql
SELECT 
    order_id,
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date) AS running_revenue_total
FROM orders;
```

### 5. The Capstone Graduation Project
You are now ready to tackle real-world multi-cloud queries across our sample datasets:
- Calculating top customer lifetime value.
- Identifying high-frequency taxi routes.
- Analyzing product review rating velocity.

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       WINDOW FUNCTION EXECUTION FRAMEWORK                     |
+-------------------------------------------------------------------------------+
  PARTITION BY category (Buckets rows WITHOUT collapsing them):

  Category: 'Electronics'
  [Product A: $249] -> DENSE_RANK = 1  (Row stays visible!)
  [Product B: $149] -> DENSE_RANK = 2  (Row stays visible!)
  [Product C: $99]  -> DENSE_RANK = 3  (Row stays visible!)

  Category: 'Hardware'
  [Product D: $129] -> DENSE_RANK = 1  (Counter resets per partition!)
  [Product E: $49]  -> DENSE_RANK = 2  (Counter resets per partition!)
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- Window functions perform calculations across partitions of rows without collapsing rows like GROUP BY.
- `DENSE_RANK()` ranks items without leaving gaps when values tie.
- `LAG()` and `LEAD()` enable time-series velocity and month-over-month growth calculations directly in SQL.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `bigquery-public-data.crypto_bitcoin`
- **Target Table:** `transactions`
- **Title:** Bitcoin Blockchain Transaction Ledger Analysis
- **Description:** Cryptocurrency forensic analysts use window functions (LAG and SUM OVER) to trace UTXO wallet balance flows and identify large whale transfers across Bitcoin ledger blocks.

---

## 💻 Hands-On SQL Production Query
**Rank Products Within Category and Calculate Spend Velocity**

```sql
-- Rank products within their category using DENSE_RANK
SELECT 
    product_id,
    name,
    category,
    base_price,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) AS price_rank_in_category
FROM products
ORDER BY category, price_rank_in_category;
```

### Query Breakdown & Mechanics:
Uses DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) to rank products from highest to lowest price within each discrete category without collapsing the table rows.

---

## ⚠️ Senior DBA Production Pitfalls
> Confusing RANK() and DENSE_RANK(). RANK() skips rank numbers after ties (1, 2, 2, 4), while DENSE_RANK() never leaves gaps (1, 2, 2, 3).

---

## 🏋️ Chapter Hands-On Exercise & Challenge
Write a query to rank all orders in `orders` by `total_amount` descending using `DENSE_RANK()`, projecting `order_id`, `customer_id`, `total_amount`, and the rank.

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- Chapter 10 Solution: Ranking orders by total amount
SELECT 
    order_id,
    customer_id,
    total_amount,
    DENSE_RANK() OVER (ORDER BY total_amount DESC) AS revenue_rank 
FROM orders;
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** What is the primary advantage of a Window Function compared to a standard GROUP BY aggregation?

1. Window functions perform calculations across related rows without collapsing the individual rows into a single row **[CORRECT]**
2. Window functions only work on tables with less than 10 rows
3. Window functions automatically delete all duplicate rows from disk
4. Window functions convert all SQL queries into Python code

> **Explanation:** Unlike GROUP BY which aggregates and collapses rows into category summaries, Window Functions compute running totals, ranks, and partition metrics while preserving every individual row.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

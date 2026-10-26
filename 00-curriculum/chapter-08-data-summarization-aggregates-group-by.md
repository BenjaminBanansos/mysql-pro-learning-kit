# Chapter 8: Data Summarization: Aggregate Functions & GROUP BY

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 55 min study  
> **Cloud Container:** `Amazon 130M+ Reviews & NYC Taxi Zones`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Master big data summarization: compute metrics across millions of rows using COUNT, SUM, AVG, MIN, and MAX, bucket data into categories with GROUP BY, and understand the critical difference between WHERE and HAVING.

---

## 📖 In-Depth Lesson Content

Up until now, our queries have returned individual rows. But the real power of SQL is **Data Summarization**—condensing millions of raw cloud records into executive business insights.

### 1. The 5 Core Aggregate Functions
Aggregate functions take a collection of values across many rows and compute a single summary metric:
1. `COUNT(*)`: Counts the total number of rows (including NULLs).
   `COUNT(column)`: Counts only rows where `column` is NOT NULL.
2. `SUM(column)`: Calculates the mathematical sum of numeric values.
3. `AVG(column)`: Computes the arithmetic mean (`SUM / COUNT`).
4. `MIN(column)`: Finds the minimum (lowest) value.
5. `MAX(column)`: Finds the maximum (highest) value.

```sql
SELECT 
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS avg_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM orders;
```

### 2. Grouping Rows with `GROUP BY`
Instead of calculating one grand total for the whole table, what if you want metrics broken down by category, city, or status?

That is what **`GROUP BY`** does. It buckets rows sharing the same value into discrete groups, then runs the aggregate function on each group:

```sql
SELECT category, COUNT(*) AS product_count, ROUND(AVG(base_price), 2) AS avg_price
FROM products
GROUP BY category;
```

**The Cardinal Rule of `GROUP BY`**:
Every column that appears in your `SELECT` list MUST either:
1. Appear in the `GROUP BY` clause, OR
2. Be wrapped inside an aggregate function (`SUM`, `AVG`, `COUNT`...)
If you try to select a raw non-aggregated column without grouping by it, MySQL 8 will reject the query under `ONLY_FULL_GROUP_BY` mode!

### 3. The Grand Showdown: `WHERE` vs. `HAVING`
This is the single most tested question in technical SQL interviews:
- **`WHERE`**: Filters individual candidate rows **BEFORE** aggregation happens. Cannot use aggregate functions!
- **`HAVING`**: Filters summarized group buckets **AFTER** aggregation happens. Used to filter on `COUNT()`, `AVG()`, etc.

```sql
SELECT category, COUNT(*) AS items, AVG(base_price) AS avg_price
FROM products
WHERE base_price > 20.00         -- Step 1: Filter out cheap items BEFORE grouping
GROUP BY category               -- Step 2: Group surviving items
HAVING COUNT(*) >= 2;           -- Step 3: Filter groups with at least 2 items
```

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       AGGREGATION & GROUPING PIPELINE                         |
+-------------------------------------------------------------------------------+
  Raw Rows:
  (Shoes, $50), (Shoes, $90), (Shoes, $10), (Hat, $25), (Hat, $15)
        │
        ▼  [WHERE price > 20]  (Filters individual rows BEFORE grouping)
  (Shoes, $50), (Shoes, $90), (Hat, $25)
        │
        ▼  [GROUP BY category] (Buckets rows into distinct groups)
  [Shoes Group]: ($50, $90) -> COUNT=2, AVG=$70
  [Hat Group]:   ($25)      -> COUNT=1, AVG=$25
        │
        ▼  [HAVING COUNT(*) >= 2] (Filters summary groups AFTER aggregation)
  Final Output:
  Shoes | 2 items | $70.00 average price
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- Use aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) to calculate summary metrics across rows.
- Every non-aggregated column in `SELECT` must appear in the `GROUP BY` clause.
- `WHERE` filters individual rows before grouping; `HAVING` filters aggregated groups after grouping.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `s3://amazon-reviews-pds/tsv/`
- **Target Table:** `amazon_reviews`
- **Title:** Amazon Reviews Product Category Rating Aggregations
- **Description:** Analytics platforms summarize 130 million product reviews by grouping on product_category and computing COUNT(review_id) and AVG(star_rating) to detect trending consumer product quality shifts.

---

## 💻 Hands-On SQL Production Query
**Summarize Orders Revenue and Metrics by Status**

```sql
-- Compute count, total revenue, and average order value grouped by status
SELECT 
    status,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS avg_order_amount,
    MAX(total_amount) AS peak_order
FROM orders
GROUP BY status
HAVING COUNT(*) >= 1
ORDER BY total_revenue DESC;
```

### Query Breakdown & Mechanics:
Buckets orders by status, computes 4 aggregate metrics per status bucket, applies a HAVING clause to verify group size, and sorts by total revenue descending.

---

## ⚠️ Senior DBA Production Pitfalls
> Attempting to use an aggregate function like 'WHERE COUNT(*) > 5'. Aggregate functions cannot be evaluated in WHERE because rows have not been grouped yet. Use HAVING.

---

## 🏋️ Chapter Hands-On Exercise & Challenge
Write a query grouping the `products` table by `category`, calculating the total count of products and the average price for each category, ordered by average price descending.

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- Chapter 8 Solution: Category aggregations with GROUP BY
SELECT category, COUNT(*) AS product_count, ROUND(AVG(base_price), 2) AS avg_price 
FROM products 
GROUP BY category 
ORDER BY avg_price DESC;
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** What is the fundamental difference between the WHERE clause and the HAVING clause?

1. WHERE filters individual rows before grouping occurs; HAVING filters aggregated groups after grouping occurs **[CORRECT]**
2. WHERE only works on text columns, while HAVING only works on numbers
3. HAVING is an older SQL keyword that has been deprecated in MySQL 8.0
4. There is no difference; they can be used interchangeably anywhere in a query

> **Explanation:** WHERE filters candidate rows before GROUP BY aggregation takes place. HAVING evaluates after GROUP BY and can filter based on aggregate function outputs like COUNT() or AVG().


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

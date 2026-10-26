# Chapter 9: Combining Datasets: Relational Joins & Engine Pipeline

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 60 min study  
> **Cloud Container:** `Customers, Orders & GitHub Repo Fork DAGs`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Learn why databases normalize data across multiple tables, master INNER JOIN and LEFT JOIN to combine records, understand Self-Joins, and memorize the 10-step internal query execution sequence.

---

## 📖 In-Depth Lesson Content

In real-world applications, data is never stored in one giant table. Storing customer names, emails, order dates, and shipping addresses in a single table causes massive data redundancy.

Instead, databases use **Normalization**:
- `customers` table stores customer profiles once.
- `orders` table stores order amounts, referencing `customer_id`.
To answer questions like *'Which customers placed orders over $150?'*, we connect them using **`JOIN`**.

### 1. The Inner Join (`INNER JOIN ... ON`)
An Inner Join returns rows only when there is a match in **both** tables. If a customer has never placed an order, they will NOT appear in an `INNER JOIN`.

```sql
SELECT c.full_name, c.country, o.order_id, o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id;
```
- `c` and `o` are **table aliases**, saving keystrokes.
- The `ON` clause specifies the foreign key relationship (`c.customer_id = o.customer_id`).

### 2. The Left Outer Join (`LEFT JOIN ... ON`)
What if you want a report of ALL customers, including those who have never placed an order?
A `LEFT JOIN` returns all rows from the left table (`customers`), plus matching rows from the right table (`orders`). If there is no match, the columns from the right table are filled with `NULL`:

```sql
SELECT c.customer_id, c.full_name, COUNT(o.order_id) AS orders_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.full_name;
```

### 3. The 10-Step Logical Query Processing Pipeline
Developers write SQL starting with `SELECT`. But the MySQL engine executes clauses in an entirely different sequence:
1. `FROM`: Identify base tables.
2. `ON`: Evaluate join conditions.
3. `JOIN`: Merge tables into joined virtual table.
4. `WHERE`: Filter individual candidate rows (No aliases allowed!).
5. `GROUP BY`: Bucket surviving rows into groups.
6. `WITH ROLLUP`: Generate super-aggregate rows.
7. `HAVING`: Filter aggregated groups.
8. `SELECT`: Project columns, evaluate expressions & window functions.
9. `DISTINCT`: Eliminate duplicate rows.
10. `ORDER BY`: Sort the final rows (Aliases declared in SELECT are valid here!).
11. `LIMIT`: Truncate and paginate final returned rows.

**Why Aliases Fail in WHERE**:
Because `WHERE` evaluates at **Step 4**, while `SELECT` (which creates column aliases) doesn't evaluate until **Step 8**! The engine literally does not know what the alias is yet when evaluating `WHERE`!

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       LOGICAL SQL QUERY PROCESSING PIPELINE                   |
+-------------------------------------------------------------------------------+
  [Step 1]  FROM         -> Identify base tables and table sources
  [Step 2]  ON           -> Evaluate join predicates for table pairs
  [Step 3]  JOIN         -> Produce combined virtual Cartesian / joined product
  [Step 4]  WHERE        -> Filter individual candidate rows (No aliases allowed!)
  [Step 5]  GROUP BY     -> Bucket surviving rows into discrete aggregation groups
  [Step 6]  WITH ROLLUP  -> Compute hierarchical subtotal and super-aggregate rows
  [Step 7]  HAVING       -> Filter aggregated groups based on summary expressions
  [Step 8]  SELECT       -> Project output columns, compute expressions
  [Step 9]  DISTINCT     -> Eliminate duplicate rows from the projected result set
  [Step 10] ORDER BY     -> Sort output (Can reference SELECT aliases!)
  [Step 11] LIMIT        -> Truncate and paginate final returned rows
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- Use `INNER JOIN` when you only want rows that have matches in both tables.
- Use `LEFT JOIN` when you want all rows from the primary table, even if no related records exist in the secondary table.
- Aliases declared in `SELECT` cannot be used in `WHERE` because `WHERE` executes at Step 4 while `SELECT` executes at Step 8.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `bigquery-public-data.github_repos`
- **Target Table:** `commits`
- **Title:** GitHub Commit DAG Parent-Child Relational Joins
- **Description:** Git commit graphs model parent-child relationships. Analytical queries join commit hashes against parent commit arrays to track code branches and developer collaboration networks.

---

## 💻 Hands-On SQL Production Query
**Join Customers and Orders with Aggregated Spend**

```sql
-- Join customers with orders to compute total spend per customer
SELECT 
    c.customer_id,
    c.full_name,
    c.country,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.full_name, c.country
ORDER BY total_spent DESC;
```

### Query Breakdown & Mechanics:
Uses LEFT JOIN so customers with zero orders still appear in the report, uses COALESCE to turn NULL spend into 0.00, and sorts by total spent descending.

---

## ⚠️ Senior DBA Production Pitfalls
> Trying to filter on a SELECT alias in a WHERE clause (e.g., 'WHERE total_spent > 100'). WHERE evaluates at Step 4 before SELECT creates the alias at Step 8. Use HAVING or repeat the expression.

---

## 🏋️ Chapter Hands-On Exercise & Challenge
Write an `INNER JOIN` query connecting `customers` and `orders`, selecting the customer's `full_name`, the `order_id`, and the `total_amount` for orders above $100.

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- Chapter 9 Solution: Inner Join between customers and orders
SELECT c.full_name, o.order_id, o.total_amount 
FROM customers c 
INNER JOIN orders o ON c.customer_id = o.customer_id 
WHERE o.total_amount > 100.00 
ORDER BY o.total_amount DESC;
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** Why can you NOT use a column alias defined in SELECT inside the WHERE clause?

1. Because WHERE executes at Step 4 of the query pipeline, while SELECT does not evaluate until Step 8 **[CORRECT]**
2. Because aliases can only contain numbers
3. Because WHERE only works on tables stored in memory
4. Because MySQL requires all aliases to be approved in the configuration file

> **Explanation:** In MySQL's logical execution order, WHERE executes at Step 4 before SELECT projects columns and creates aliases at Step 8. Therefore, the engine does not know the alias when evaluating WHERE.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

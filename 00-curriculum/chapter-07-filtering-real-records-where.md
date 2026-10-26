# Chapter 7: Filtering Real Records: The WHERE Clause & Logic

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 55 min study  
> **Cloud Container:** `Stack Overflow Questions & E-Commerce Orders`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Learn how to filter candidate records using WHERE: master comparison operators, pattern matching with LIKE, range and set filters with BETWEEN and IN, compound boolean logic, and the critical 3-valued NULL trap.

---

## 📖 In-Depth Lesson Content

When working with million-row tables, you rarely want to inspect every single record. You want to filter for specific records: *'Show me orders over $200 placed in California'*.

This is the job of the **`WHERE`** clause.

### 1. Comparison Operators
The `WHERE` clause evaluates an expression for every candidate row. If the expression is TRUE, the row survives; if FALSE or UNKNOWN, it is discarded:
- `=` (Equal): `WHERE country = 'USA'`
- `!=` or `<>` (Not Equal): `WHERE status != 'CANCELLED'`
- `<`, `>`, `<=`, `>=` (Numeric Comparisons): `WHERE total_amount >= 150.00`

### 2. Pattern Matching with `LIKE` and Wildcards
When searching through text (like customer names or product titles), use `LIKE`:
- `%` (Percent): Matches zero, one, or multiple characters.
  `WHERE name LIKE 'Pro%'` (Starts with "Pro")
  `WHERE email LIKE '%@gmail.com'` (Ends with "@gmail.com")
  `WHERE name LIKE '%Air%'` (Contains "Air" anywhere)
- `_` (Underscore): Matches exactly one single character.

### 3. Range and Set Membership: `BETWEEN` and `IN`
- **Range (`BETWEEN ... AND ...`)**:
  ```sql
  WHERE base_price BETWEEN 50.00 AND 200.00;
  -- Equivalent to: base_price >= 50.00 AND base_price <= 200.00 (Inclusive!)
  ```
- **Set Membership (`IN`)**:
  ```sql
  WHERE country IN ('USA', 'Canada', 'Germany');
  -- Equivalent to: country = 'USA' OR country = 'Canada' OR country = 'Germany'
  ```

### 4. Compound Boolean Logic: `AND`, `OR`, `NOT`
You can combine multiple criteria:
- `AND`: Both conditions must be TRUE.
- `OR`: At least one condition must be TRUE.
- `NOT`: Inverts the condition.

**The Parenthesis Trap**: In SQL, `AND` takes precedence over `OR`!
Look at this query:
```sql
WHERE total_amount > 200 AND status = 'COMPLETED' OR status = 'DELIVERED'
```
Because `AND` binds first, this will return *any* order with status 'DELIVERED', regardless of amount! Always use parentheses:
```sql
WHERE total_amount > 200 AND (status = 'COMPLETED' OR status = 'DELIVERED')
```

### 5. The Critical 3-Valued Logic of `NULL`
In SQL, `NULL` does NOT mean zero or empty string. **`NULL` means UNKNOWN / MISSING VALUE.**
Because `NULL` is unknown, the comparison `NULL = NULL` evaluates to `UNKNOWN` (falsy)!
- **WRONG**: `WHERE email = NULL` (Returns 0 rows forever!)
- **CORRECT**: `WHERE email IS NULL` or `WHERE email IS NOT NULL`

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       WHERE FILTERING LOGIC EVALUATION                        |
+-------------------------------------------------------------------------------+
  Candidate Row Stream:
  [Order #1: Total $250, Status 'COMPLETED'] -> (250 > 200 AND 'COMPLETED') -> TRUE  (Kept)
  [Order #2: Total $45,  Status 'COMPLETED'] -> (45 > 200)                  -> FALSE (Dropped)
  [Order #3: Total NULL, Status 'PENDING']   -> (NULL > 200)                -> UNKNOWN (Dropped)

  Golden Rule for NULL:
  Never write: WHERE col = NULL
  Always write: WHERE col IS NULL
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- In SQL, `AND` binds before `OR`; always use parentheses to make compound boolean logic unambiguous.
- `NULL` represents unknown data; never use `= NULL`, always use `IS NULL` or `IS NOT NULL`.
- `BETWEEN` is inclusive on both ends, and `IN (...)` simplifies long chains of `OR` statements.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `bigquery-public-data.stackoverflow`
- **Target Table:** `posts_questions`
- **Title:** Stack Overflow Public Archive Tag Filtering
- **Description:** Developers filter hundreds of millions of Stack Overflow questions using WHERE score > 10 AND view_count >= 1000 AND tags LIKE '%<mysql>%' to isolate high-value answers for developer documentation.

---

## 💻 Hands-On SQL Production Query
**Filter High-Value Completed Orders with Compound Logic**

```sql
-- Filter high-value completed orders with compound boolean conditions
SELECT order_id, customer_id, order_date, total_amount, status 
FROM orders 
WHERE total_amount > 100.00 
  AND (status = 'COMPLETED' OR status = 'DELIVERED')
ORDER BY total_amount DESC;
```

### Query Breakdown & Mechanics:
Applies a numeric comparison (total_amount > 100.00) combined with a grouped OR condition for status, sorting the surviving matching orders from largest to smallest.

---

## ⚠️ Senior DBA Production Pitfalls
> Writing 'WHERE col = NULL'. In relational SQL, comparing anything to NULL with '=' evaluates to UNKNOWN, returning zero results. Always use 'IS NULL'.

---

## 🏋️ Chapter Hands-On Exercise & Challenge
Write a query to find all products in `products` that belong to either 'Electronics' or 'Hardware' and have a `base_price` under $100.

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- Chapter 7 Solution: Set filtering with IN and price comparison
SELECT product_id, name, category, base_price 
FROM products 
WHERE category IN ('Electronics', 'Hardware') 
  AND base_price < 100.00;
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** What is the result of running the query: 'SELECT * FROM customers WHERE email = NULL'?

1. It returns zero rows, because comparing anything to NULL with '=' yields UNKNOWN (you must use IS NULL) **[CORRECT]**
2. It returns all customers whose email is empty
3. It throws a syntax error because NULL cannot be used in WHERE
4. It returns all customers with invalid email formats

> **Explanation:** In SQL, NULL represents missing/unknown data. Comparisons like 'email = NULL' evaluate to UNKNOWN, which evaluates as false in a WHERE clause. You must use 'IS NULL'.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

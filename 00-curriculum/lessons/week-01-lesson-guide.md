# Week 1 Comprehensive Lesson: SQL Execution Order, Advanced Joins & Set Operations

Welcome to **Week 1** of the MySQL Intermediate to Pro curriculum! 

This lesson lays the foundational mental model required for senior database development: **how the database engine actually evaluates SQL queries versus how humans write them**, followed by advanced join algorithms (Self-Joins, Non-Equi Joins, and Hash Joins).

---

## 🧠 Part 1: The True Logical Query Execution Order

When writing SQL, you write in this order:
```sql
SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT
```

However, the MySQL SQL parser and optimizer execute queries in an entirely different 10-step pipeline:

```
  Step 1: FROM                 (Identifies source tables)
     │
  Step 2: ON                   (Applies join conditions per row pair)
     │
  Step 3: JOIN                 (Produces cross/outer/inner joined virtual table)
     │
  Step 4: WHERE                (Filters individual rows before grouping)
     │
  Step 5: GROUP BY             (Aggregates filtered rows into distinct buckets)
     │
  Step 6: WITH ROLLUP / CUBE   (Adds dimensional super-aggregates)
     │
  Step 7: HAVING               (Filters aggregated groups)
     │
  Step 8: SELECT               (Evaluates expressions, window functions & aliases)
     │
  Step 9: DISTINCT             (Deduplicates identical output tuples)
     │
  Step 10: ORDER BY            (Sorts the result set - can use SELECT aliases)
     │
  Step 11: LIMIT / OFFSET      (Paginates and truncates the stream)
```

### 💡 The Classic Interview Trap: Why does this query fail?

```sql
-- ❌ FAILS with "Unknown column 'total_price' in 'where clause'"
SELECT 
    order_id, 
    (unit_price * quantity) AS total_price
FROM order_items
WHERE total_price > 100.00;
```

**Why it fails**:
- According to the pipeline, **`WHERE` (Step 4)** evaluates *before* **`SELECT` (Step 8)**!
- At Step 4, the alias `total_price` does not exist yet in the engine's memory.

**How Pro Engineers Solve It**:
1. Repeat the expression in `WHERE`: `WHERE (unit_price * quantity) > 100.00`
2. Or wrap in a **CTE / Subquery** so the alias is materialized in Step 1:
```sql
--  PRO SOLUTION (Using CTE)
WITH calculated_items AS (
    SELECT order_id, (unit_price * quantity) AS total_price
    FROM order_items
)
SELECT * FROM calculated_items WHERE total_price > 100.00;
```

---

## 🔗 Part 2: Advanced Joins Deep Dive

### 1. The Self-Join (Market Basket Co-Occurrence)
A **Self-Join** joins a table to itself. It is commonly used for hierarchical trees or finding pairs of items that share a common attribute (e.g. Products bought in the same order).

```sql
-- Finding pairs of products frequently purchased together in the same order
SELECT 
    oi1.product_id AS product_a,
    oi2.product_id AS product_b,
    COUNT(DISTINCT oi1.order_id) AS shared_orders_count
FROM order_items oi1
JOIN order_items oi2 
    ON oi1.order_id = oi2.order_id 
   AND oi1.product_id < oi2.product_id -- CRITICAL: Prevents duplicate pairs (A,B) and (B,A) and self-pairs (A,A)
GROUP BY oi1.product_id, oi2.product_id
HAVING shared_orders_count >= 5
ORDER BY shared_orders_count DESC
LIMIT 10;
```
> [!IMPORTANT]
> The condition `oi1.product_id < oi2.product_id` is essential. If you used `oi1.product_id != oi2.product_id`, product pair (10, 20) and (20, 10) would be counted twice, doubling your output rows.

---

### 2. Hash Joins in MySQL 8.0.18+
In MySQL 5.7 and earlier, joining two unindexed tables relied on **Block Nested Loop (BNL)** joins, which had quadratic time complexity $\mathcal{O}(N \times M)$ and caused severe CPU spikes on millions of rows.

Starting in **MySQL 8.0.18**, MySQL introduced the modern **Hash Join**:
1. **Build Phase**: MySQL scans the smaller table, computes a hash on the join key, and builds an in-memory hash table in RAM (`join_buffer_size`).
2. **Probe Phase**: MySQL scans the larger table once, hashes each row's join key, and does $\mathcal{O}(1)$ constant-time lookups into the hash table.
3. Total Time Complexity: $\mathcal{O}(N + M)$ (Linear time instead of quadratic!).

To see this in action:
```sql
EXPLAIN FORMAT=TREE
SELECT c.email, o.order_id, o.total_amount
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;
```
Look for: `-> Inner hash join (c.customer_id = o.customer_id)`.

---

## 🧪 Week 1 Practice Lab Exercises

Try executing these 3 queries directly in the **Interactive SQL Playground**:

### Exercise 1: High-Value Customer Identification
Write a query to find all customers who have placed at least 3 orders and spent more than $500 in total.
```sql
SELECT 
    customer_id,
    COUNT(order_id) AS order_count,
    ROUND(SUM(total_amount), 2) AS lifetime_spend
FROM orders
WHERE status = 'COMPLETED'
GROUP BY customer_id
HAVING order_count >= 3 AND lifetime_spend > 500.00
ORDER BY lifetime_spend DESC;
```

### Exercise 2: Self-Join for Successive Order Comparison
Find customers who placed two orders on consecutive dates using a self-join:
```sql
SELECT 
    o1.customer_id,
    o1.order_id AS first_order_id,
    o1.order_date AS first_order_date,
    o2.order_id AS next_order_id,
    o2.order_date AS next_order_date
FROM orders o1
JOIN orders o2 
    ON o1.customer_id = o2.customer_id 
   AND o1.order_id < o2.order_id
   AND DATE(o2.order_date) = DATE_ADD(DATE(o1.order_date), INTERVAL 1 DAY)
LIMIT 20;
```

---

## ✅ Week 1 Completion Checklist
- [ ] Understand the 10-step logical query execution order.
- [ ] Explain why column aliases from `SELECT` fail in `WHERE` clauses.
- [ ] Write a self-join with strict inequality (`<`) to avoid symmetric permutations.
- [ ] Explain the difference between Block Nested Loop and Hash Joins in MySQL 8.
- [ ] Mark Week 1 as completed on the [Live Web Platform](https://BenjaminBanansos.github.io/mysql-pro-learning-kit/)!

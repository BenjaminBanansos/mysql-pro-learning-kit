# Month 1: Advanced SQL Mastery & Analytical Querying (Weeks 1 - 4)

## Objective
Elevate SQL proficiency from basic `SELECT/JOIN` syntax to advanced analytical capabilities, window functions, hierarchical queries, native JSON manipulation, and full-text search.

---

### Week 1: SQL Execution Order, Advanced Joins & Set Operations
- **Theory**: The true logical query processing phase sequence:
  `FROM -> ON -> JOIN -> WHERE -> GROUP BY -> WITH CUBE/ROLLUP -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT`.
  Understanding why aliases created in `SELECT` cannot be referenced in `WHERE`.
- **Joins Under the Hood**:
  - Non-equi joins and band joins.
  - Self-joins for hierarchical and comparative analysis.
  - MySQL 8.0.18+ Hash Join execution vs Nested Loop Joins (`Block Nested Loop` retirement).
- **Hands-On Exercises**:
  - Lab: Self-join on `order_items` to compute product co-occurrence pairs.

### Week 2: Window Functions & Analytic Frameworks
- **Window Functions Architecture**:
  - Ranking: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)`.
  - Value: `LEAD()`, `LAG()`, `FIRST_VALUE()`, `LAST_VALUE()`, `NTH_VALUE()`.
  - Framing: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, sliding range vs row specifications.
- **Hands-On Exercises**:
  - Lab: Running cumulative sales YTD, 7-day centered moving average.
  - Lab: Month-over-Month (MoM) revenue growth using `LAG()`.
  - Lab: Customer RFM Segmentation using `NTILE(4)`.

### Week 3: Common Table Expressions (CTEs) & Recursive SQL
- **Theory**:
  - Non-recursive CTEs vs Derived Subqueries (inlining, materialization, and readability).
  - Recursive CTEs: Anchor member, recursive member, termination condition, cycle detection.
- **Hands-On Exercises**:
  - Lab: Modeling multi-level referral trees and organization structures up to 5 levels deep.
  - Lab: Generating dynamic date sequences for zero-filling reporting gaps without static calendar tables.

### Week 4: MySQL 8 Native JSON & Full-Text Search (FTS)
- **JSON Deep Dive**:
  - Inline JSON operators: `->` (extracts as JSON) vs `->>` (unquotes as text).
  - `JSON_TABLE()`: Transforming semi-structured JSON clickstream documents into relational tables on the fly.
  - Indexing JSON: Creating Generated Virtual Columns and Functional Indexes on JSON attributes.
- **InnoDB Full-Text Search**:
  - Inverted indexes, auxiliary tables, and stopword filters.
  - Natural Language Mode vs Boolean Mode (`+`, `-`, `*`, `~`).
- **Hands-On Exercises**:
  - Run `03-labs-and-exercises/lab01_window_functions_and_ctes.sql`.
  - Run `03-labs-and-exercises/lab02_json_and_fulltext_search.sql`.

# Month 1: Advanced SQL Mastery on AWS Open Data (Weeks 1 - 4)

## Objective
Elevate SQL proficiency from basic queries to enterprise-grade analytical pipelines using real-world public cloud datasets from the **AWS Open Data Registry** (NYC TLC Taxi & Amazon Customer Reviews).

---

### Week 1: SQL Execution Order, Advanced Joins & Hash Joins
- **Theory**: The true 10-step logical query processing order:
  `FROM -> ON -> JOIN -> WHERE -> GROUP BY -> WITH ROLLUP -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT`.
  Understanding why aliases created in `SELECT` cannot be referenced in `WHERE`.
- **Joins Under the Hood on AWS Scale**:
  - Self-joins on AWS datasets: finding product co-purchases and paired transit trips.
  - MySQL 8.0.18+ Hash Join execution vs legacy Block Nested Loop (BNL) joins.
- **Hands-On Lab**:
  - Self-join on `order_items` / trip records to compute co-occurrence pairs without permutations (`id1 < id2`).

### Week 2: Window Functions & Analytical Transit Frameworks
- **Window Functions Architecture**:
  - Ranking: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)`.
  - Value: `LEAD()`, `LAG()`, `FIRST_VALUE()`, `LAST_VALUE()`.
  - Framing: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, sliding range vs row specifications.
- **Hands-On Exercises on AWS Open Data**:
  - Top 3 pickup zones by revenue per passenger quartile using `DENSE_RANK()`.
  - Month-over-Month (MoM) revenue growth using `LAG()`.
  - Customer RFM Segmentation via `NTILE(4)`.

### Week 3: Common Table Expressions (CTEs) & Recursive Hierarchies
- **Theory**:
  - Non-recursive CTEs vs Derived Subqueries (inlining, materialization, and readability).
  - Recursive CTEs: Anchor member, recursive member, termination condition, cycle detection.
- **Hands-On Exercises**:
  - Modeling multi-level referral networks and hierarchical airport flight paths up to 5 hops deep.
  - Generating dynamic date sequences for zero-filling reporting gaps without static calendar tables.

### Week 4: MySQL 8 Native JSON & Full-Text Search (AWS Amazon Reviews)
- **JSON Deep Dive**:
  - Inline JSON operators: `->` (quoted JSON) vs `->>` (unquoted text).
  - `JSON_TABLE()`: Transforming semi-structured JSON telemetry documents into relational tables on the fly.
  - Indexing JSON: Creating Generated Virtual Columns and Functional Indexes on JSON attributes.
- **InnoDB Full-Text Search (AWS Amazon Reviews Data)**:
  - Inverted indexes, auxiliary tables, and stopword filters across 130M+ Amazon customer reviews on AWS S3 (`s3://amazon-reviews-pds/`).
  - Boolean Mode Search (`+camera +4k* -refurbished`) with relevancy scores.

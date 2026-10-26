# Month 1: Advanced Analytical SQL on Cloud Big Data (Weeks 1 - 4)

## Objective
Elevate SQL proficiency from basic queries to enterprise-grade analytical pipelines using real-world public cloud datasets from **Google Cloud Public Datasets** (Stack Overflow & GitHub Archive) and **AWS Open Data Registry** (Amazon Reviews & NYC TLC Taxi).

---

### Week 1: SQL Execution Order & Self-Joins (Stack Overflow Tag Affinities)
- **Theory**: The true 10-step logical query processing order:
  `FROM -> ON -> JOIN -> WHERE -> GROUP BY -> WITH ROLLUP -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT`.
  Why column aliases defined in `SELECT` cannot be referenced in `WHERE`.
- **Self-Joins on Cloud Scale (Stack Overflow Public Dataset)**:
  - Performing market-basket co-occurrence self-joins on `so_posts` and tag pairings to identify developer technology affinities (e.g. `<mysql>` + `<docker>`).
  - Strict inequality constraints (`tag_a < tag_b`) preventing self-matches and duplicate symmetric pairs.
  - MySQL 8.0.18+ Hash Join execution vs legacy Block Nested Loop (BNL) joins.

### Week 2: Window Functions & Analytics (Stack Overflow Reputation & NYC Taxi)
- **Window Functions Architecture**:
  - Ranking: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE(n)`.
  - Value: `LEAD()`, `LAG()`, `FIRST_VALUE()`, `LAST_VALUE()`.
  - Framing: `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, sliding range vs row specifications.
- **Hands-On Exercises on Real Cloud Data**:
  - Tracking developer reputation trajectories and answer rank percentiles across 50M+ Stack Overflow posts.
  - Month-over-Month (MoM) revenue velocity on NYC Taxi rides using `LAG()`.
  - Developer engagement quartiles via `NTILE(4)`.

### Week 3: Recursive CTEs & Hierarchical DAGs (GitHub Commit History)
- **Theory**:
  - Non-recursive CTEs vs Derived Subqueries (inlining, materialization, and optimizer hints).
  - Recursive CTEs: Anchor member, recursive member, termination condition, and cycle detection.
- **Hands-On Exercises on GitHub Public Archive (`bigquery-public-data.github_repos`)**:
  - Traversing Git commit DAGs: Finding all ancestor commits up to 10 generations deep from `parent_sha` to `commit_sha`.
  - Modeling multi-level repository fork networks and developer contribution referral trees.
  - Dynamic calendar date series generation to zero-fill commit gaps without static tables.

### Week 4: MySQL 8 Native JSON & Full-Text Search (130M+ Amazon Reviews)
- **JSON Deep Dive**:
  - Inline JSON operators: `->` (quoted JSON) vs `->>` (unquoted text).
  - `JSON_TABLE()`: Transforming semi-structured JSON telemetry documents and user badges into relational tables on the fly.
  - Indexing JSON: Creating Generated Virtual Columns and Functional Indexes on JSON attributes.
- **InnoDB Full-Text Search (AWS Amazon Reviews Dataset `s3://amazon-reviews-pds/`)**:
  - Inverted indexes, auxiliary tables (`FTS_*_INDEX_*`), and stopword filters across 130M+ Amazon customer reviews.
  - Boolean Mode Search (`+camera +battery +"wireless charging" -defective`) with relevancy ranking scores.

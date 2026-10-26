# Week 3 Comprehensive Lesson: Recursive CTEs & Git Commit DAG Traversal

Welcome to **Week 3** of the MySQL Intermediate to Pro curriculum!

This lesson covers **Common Table Expressions (CTEs)** and **Recursive CTEs**—an indispensable SQL technique for querying hierarchical trees, directed acyclic graphs (DAGs), multi-level organizational charts, and dynamic date series. We will practice using the **GitHub Public Archive dataset** (`bigquery-public-data.github_repos`).

---

## 🌲 Part 1: CTE Architecture: Derived Tables vs CTEs

Before MySQL 8.0, queries requiring intermediate result sets relied on **derived tables** (subqueries in the `FROM` clause):

```sql
-- Legacy Derived Table: Hard to read and cannot reference itself
SELECT d.dept_name, avg_sal.val
FROM departments d
JOIN (
    SELECT dept_id, AVG(salary) AS val 
    FROM employees 
    GROUP BY dept_id
) AS avg_sal ON d.id = avg_sal.dept_id;
```

Starting in **MySQL 8.0**, CTEs (`WITH ... AS (...)`) provide cleaner syntax, code reusability (a CTE can be referenced multiple times in the outer query), and support **recursion**.

---

## 🔄 Part 2: The Anatomy of a Recursive CTE

A Recursive CTE consists of three core components:
1. **The Anchor Member**: Initial query that produces the base result set (the starting nodes).
2. **`UNION ALL`** (or `UNION DISTINCT`): Glues the anchor to the recursive step.
3. **The Recursive Member**: Query that references the CTE itself, executing iteratively until it produces zero rows.
4. **Termination Condition**: Clause in the recursive member that stops iteration, preventing infinite loops.

```sql
WITH RECURSIVE cte_name (col1, col2, ...) AS (
    -- 1. Anchor Member
    SELECT ...
    FROM base_table
    WHERE initial_condition

    UNION ALL

    -- 2. Recursive Member
    SELECT ...
    FROM base_table b
    JOIN cte_name c ON b.parent_id = c.id
    WHERE c.depth < 10 -- 3. Termination Condition
)
SELECT * FROM cte_name;
```

---

## 🔀 Part 3: Traversing Git Commit DAGs (GitHub Public Archive)

In Git, commits form a Directed Acyclic Graph (DAG) where each commit points back to its `parent_sha`. Let's trace all ancestor commits up to 10 generations deep starting from a specific commit:

```sql
WITH RECURSIVE commit_history AS (
    -- Anchor: Start at the latest commit
    SELECT 
        commit_sha,
        parent_sha,
        author_name,
        commit_date,
        message,
        1 AS generation_depth
    FROM github_commits
    WHERE commit_sha = 'c3d4e5f6a1b20718293041526374859607182932'

    UNION ALL

    -- Recursive Step: Find the parent of the current commit
    SELECT 
        c.commit_sha,
        c.parent_sha,
        c.author_name,
        c.commit_date,
        c.message,
        ch.generation_depth + 1
    FROM github_commits c
    JOIN commit_history ch ON c.commit_sha = ch.parent_sha
    WHERE ch.generation_depth < 10 -- Prevents runaway execution
)
SELECT 
    generation_depth,
    SUBSTRING(commit_sha, 1, 8) AS short_sha,
    author_name,
    commit_date,
    message
FROM commit_history
ORDER BY generation_depth ASC;
```

### 💡 MySQL Safety Guard: `cte_max_recursion_depth`
MySQL includes a server-level safety variable to abort infinite recursion:
```sql
-- Default is 1000 iterations
SET SESSION cte_max_recursion_depth = 5000;
```
If a recursive query exceeds this limit, MySQL terminates it with:
`ERROR 3636 (HY000): Recursive query aborted after 1001 iterations`.

---

## 📅 Part 4: Dynamic Calendar Series (Zero-Filling Reporting Gaps)

In financial and telemetry reporting, days with zero orders or events disappear from standard `GROUP BY` aggregations. A recursive CTE generates dynamic date sequences on the fly without requiring a physical calendar table:

```sql
-- Generate all dates in a month dynamically
WITH RECURSIVE calendar AS (
    SELECT DATE('2023-01-01') AS report_date
    UNION ALL
    SELECT DATE_ADD(report_date, INTERVAL 1 DAY)
    FROM calendar
    WHERE report_date < '2023-01-31'
)
SELECT 
    c.report_date,
    COALESCE(COUNT(o.order_id), 0) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS daily_revenue
FROM calendar c
LEFT JOIN orders o ON DATE(o.order_date) = c.report_date
GROUP BY c.report_date
ORDER BY c.report_date;
```

---

## ✅ Week 3 Checklist
- [ ] Understand the difference between derived tables and CTEs.
- [ ] Implement a recursive CTE with Anchor, `UNION ALL`, and Recursive member.
- [ ] Traverse hierarchical parent-child DAGs (Git commits or employee trees).
- [ ] Generate dynamic date ranges to eliminate reporting zero-count gaps.

# Week 2 Comprehensive Lesson: Window Functions & Analytical Transit Frameworks

Welcome to **Week 2** of the MySQL Intermediate to Pro curriculum! 

This lesson covers **SQL Window Functions (Analytic Functions)**—one of the most critical skills for modern data engineering, business intelligence, and senior database development. You will learn how to compute running totals, rankings, moving averages, and period-over-period differences without collapsing your row sets.

---

## 🧠 Part 1: Window Functions vs Aggregate `GROUP BY`

The fundamental difference between aggregate functions and window functions:
- **`GROUP BY` Aggregation**: Collapses multiple rows into a single summary row. Individual row identity is lost.
- **Window Function (`OVER (...)`)**: Evaluates aggregate or ranking logic across a defined subset of rows (the "window"), while **retaining every individual row's distinct identity**.

```
Input Rows (Trip ID, Zone, Fare)
┌────────┬──────┬───────┐
│ Trip 1 │ JFK  │ $52.00│
│ Trip 2 │ JFK  │ $64.00│
│ Trip 3 │ LGA  │ $38.00│
└────────┴──────┴───────┘
          │
          ├─► GROUP BY Zone: 
          │   JFK => Avg: $58.00  (Only 2 rows returned!)
          │   LGA => Avg: $38.00
          │
          └─► Window AVG(Fare) OVER (PARTITION BY Zone):
              Trip 1 (JFK): $52.00, Zone Avg: $58.00, Diff: -$6.00
              Trip 2 (JFK): $64.00, Zone Avg: $58.00, Diff: +$6.00
              Trip 3 (LGA): $38.00, Zone Avg: $38.00, Diff:  $0.00
              (All 3 rows preserved!)
```

### The Anatomy of the `OVER()` Clause
```sql
FUNCTION(...) OVER (
    [PARTITION BY partition_column_1, partition_column_2]
    [ORDER BY sort_column [ASC | DESC]]
    [frame_specification]
)
```

1. **`PARTITION BY`**: Divides the dataset into independent calculation buckets (e.g., partition by `pickup_zone_id` or `customer_id`).
2. **`ORDER BY`**: Dictates the sequence of row evaluation within each partition.
3. **`Frame Specification`**: Defines the dynamic sub-range of rows relative to the current row (e.g. `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`).

---

## 📊 Part 2: Ranking Functions Compared

MySQL 8.0 natively provides 4 ranking functions. Let's compare their behavior on ties:

| Trip Fare | `ROW_NUMBER()` | `RANK()` | `DENSE_RANK()` | `NTILE(2)` |
| :--- | :--- | :--- | :--- | :--- |
| **\$80.00** | 1 | 1 | 1 | 1 |
| **\$80.00** | 2 | 1 (Tie) | 1 (Tie) | 1 |
| **\$65.00** | 3 | 3 (Gap!) | 2 (No Gap) | 2 |
| **\$40.00** | 4 | 4 | 3 | 2 |

### 💡 Production Rule of Thumb:
- Use **`ROW_NUMBER()`** when you need unique pagination or strict deduplication (e.g., retrieving the single most recent trip per user).
- Use **`DENSE_RANK()`** for leaderboards and top-N reporting (e.g., top 3 revenue zones) without accidental gaps.
- Use **`NTILE(k)`** for customer quartiles (e.g. `NTILE(4)`) or performance deciles.

---

## 📈 Part 3: Value Navigation Functions (`LAG` & `LEAD`)

`LAG(col, offset, default)` reaches backward into preceding rows, while `LEAD()` looks forward.

### Month-over-Month (MoM) Growth Rate on AWS NYC Taxi Trips
```sql
WITH monthly_metrics AS (
    SELECT 
        DATE_FORMAT(pickup_datetime, '%Y-%m') AS trip_month,
        COUNT(*) AS total_trips,
        ROUND(SUM(total_amount), 2) AS monthly_revenue
    FROM nyc_yellow_taxi_trips
    GROUP BY DATE_FORMAT(pickup_datetime, '%Y-%m')
)
SELECT 
    trip_month,
    monthly_revenue,
    LAG(monthly_revenue, 1) OVER (ORDER BY trip_month) AS prev_month_revenue,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue, 1) OVER (ORDER BY trip_month)) 
        / LAG(monthly_revenue, 1) OVER (ORDER BY trip_month) * 100.0, 
        2
    ) AS mom_growth_pct
FROM monthly_metrics
ORDER BY trip_month;
```

---

## 🪟 Part 4: Sliding Window Frame Specifications

When computing moving averages or rolling metrics, the **Frame Specification** determines which rows are included relative to the `CURRENT ROW`:

```sql
-- 7-Day Rolling Moving Average of Taxi Fares
SELECT 
    pickup_date,
    daily_revenue,
    ROUND(
        AVG(daily_revenue) OVER (
            ORDER BY pickup_date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ), 
        2
    ) AS rolling_7day_avg_revenue
FROM daily_revenue_summary;
```

### Frame Boundaries:
- `UNBOUNDED PRECEDING`: Beginning of the partition.
- `n PRECEDING`: $n$ rows prior to current row.
- `CURRENT ROW`: The active row being evaluated.
- `n FOLLOWING`: $n$ rows after current row.
- `UNBOUNDED FOLLOWING`: End of the partition.

---

## 🧪 Week 2 Hands-On Lab Exercises

### Exercise 1: Top 3 Highest Earning Trips Per Zone
```sql
WITH ranked_trips AS (
    SELECT 
        trip_id,
        pickup_location_id,
        total_amount,
        DENSE_RANK() OVER (
            PARTITION BY pickup_location_id 
            ORDER BY total_amount DESC
        ) AS revenue_rank
    FROM nyc_yellow_taxi_trips
)
SELECT * 
FROM ranked_trips 
WHERE revenue_rank <= 3;
```

### Exercise 2: Customer RFM Segmentation via `NTILE(4)`
```sql
SELECT 
    customer_id,
    ROUND(SUM(total_amount), 2) AS lifetime_value,
    NTILE(4) OVER (ORDER BY SUM(total_amount) DESC) AS monetary_quartile
FROM orders
WHERE status = 'COMPLETED'
GROUP BY customer_id;
```

---

## ✅ Week 2 Checklist
- [ ] Differentiate between `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`.
- [ ] Compute Month-over-Month growth percentage using `LAG()`.
- [ ] Implement a 7-day rolling average with `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`.
- [ ] Test the queries in the [Interactive SQL Playground](https://BenjaminBanansos.github.io/mysql-pro-learning-kit/)!

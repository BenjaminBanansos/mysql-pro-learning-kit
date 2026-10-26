# Week 15 Comprehensive Lesson: Table Partitioning Architecture on AWS NYC Taxi Scale

Welcome to **Week 15** of the MySQL Intermediate to Pro curriculum!

This lesson covers **MySQL Table Partitioning Architecture**—the cornerstone technique used by cloud architects and database administrators to manage multi-million and multi-billion row datasets without server degradation. You will learn how to design quarterly RANGE partitions on the AWS NYC Yellow Taxi dataset (`s3://nyc-tlc/`), verify partition pruning in `EXPLAIN`, and perform instant zero-downtime data lifecycle management.

---

## 🧱 Part 1: Why Partition? The Million-Row Problem

When an unpartitioned InnoDB table reaches tens of millions of rows:
1. **B+Tree Depth Grows**: The clustered index tree height expands to 4 or 5 levels, increasing page reads per lookup.
2. **Buffer Pool Thrashing**: High cardinality random scans flush hot pages out of the InnoDB Buffer Pool LRU list.
3. **Maintenance Overhead**: `ALTER TABLE`, `OPTIMIZE TABLE`, and large `DELETE` operations lock tables or generate massive Redo and Undo log bloat.

### The Partitioning Solution
Partitioning splits a single logical table into multiple smaller physical tables (`.ibd` tablespaces) behind the scenes, governed by a **Partition Function**:

```
Logical Table: nyc_yellow_taxi_trips (50,000,000 Rows)
┌────────────────────────────────────────────────────────┐
│              MySQL SQL Parser / Optimizer              │
└──────────────────────────┬─────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Partition   │   │  Partition   │   │  Partition   │
│   p2023_q1   │   │   p2023_q2   │   │  p2023_max   │
│  (Jan - Mar) │   │  (Apr - Jun) │   │ (Jul & Later)│
│  [trip_q1.ibd]│   │  [trip_q2.ibd]│   │ [trip_max.ibd]│
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## ⚠️ Part 2: The Golden Rule of Partitioning

> [!IMPORTANT]
> **The Strict Primary / Unique Key Rule**:
> Every unique key (including the `PRIMARY KEY`) on a partitioned table **MUST include every column in the table's partitioning expression**.

If your partitioning expression uses `pickup_datetime`, a primary key defined solely as `id INT AUTO_INCREMENT PRIMARY KEY` will **fail immediately** with:
```
ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function
```

### Correct Composite Primary Key:
```sql
CREATE TABLE nyc_yellow_taxi_trips (
    trip_id BIGINT NOT NULL AUTO_INCREMENT,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count INT,
    trip_distance DECIMAL(8, 2),
    total_amount DECIMAL(10, 2),
    PRIMARY KEY (trip_id, pickup_datetime) -- REQUIRED: includes pickup_datetime!
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(pickup_datetime)) (
    PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),
    PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),
    PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),
    PARTITION p2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_future  VALUES LESS THAN MAXVALUE
);
```

---

## ⚡ Part 3: Partition Pruning Verification

**Partition Pruning** is when the MySQL query optimizer examines the `WHERE` clause and automatically skips scanning irrelevant partition tablespaces:

```sql
EXPLAIN 
SELECT COUNT(*), SUM(total_amount)
FROM nyc_yellow_taxi_trips
WHERE pickup_datetime >= '2023-04-15' AND pickup_datetime < '2023-05-01';
```

In the output, inspect the `partitions` column:
```
+----+-------------+-----------------------+------------+-------+
| id | select_type | table                 | partitions | type  |
+----+-------------+-----------------------+------------+-------+
|  1 | SIMPLE      | nyc_yellow_taxi_trips | p2023_q2   | ALL   |
+----+-------------+-----------------------+------------+-------+
```
Only partition **`p2023_q2`** was inspected; `p2023_q1`, `p2023_q3`, and `p_future` were completely skipped, reducing physical I/O by 75%!

---

## ⏱️ Part 4: Zero-Downtime Data Aging (`DROP PARTITION`)

In financial and transit applications, data retention policies require purging data older than 7 years.

### The Wrong Way:
```sql
-- ❌ TERRIBLE: Scans millions of rows, acquires row locks, generates gigabytes of undo logs
DELETE FROM nyc_yellow_taxi_trips WHERE pickup_datetime < '2016-01-01';
```

### The Pro Way:
```sql
-- ⚡ INSTANT: Drops the physical .ibd file in < 15 milliseconds, zero undo/redo log bloat!
ALTER TABLE nyc_yellow_taxi_trips DROP PARTITION p2015_q4;
```

---

## ✅ Week 15 Checklist
- [ ] Understand why primary keys must include partitioning columns.
- [ ] Implement `RANGE (TO_DAYS(...))` partitioning on time-series data.
- [ ] Use `EXPLAIN` to confirm partition pruning on query filters.
- [ ] Purge historical data instantly using `ALTER TABLE DROP PARTITION`.

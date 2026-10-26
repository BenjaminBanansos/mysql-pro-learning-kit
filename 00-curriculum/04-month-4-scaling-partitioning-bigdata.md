# Month 4: Big Data Scaling, Partitioning & Petabytes (Weeks 13 - 16)

## Objective
Ingest, partition, and query tens to hundreds of millions of records without performance degradation using public datasets from the **AWS Open Data Registry** (NYC TLC Taxi `s3://nyc-tlc/` & Common Crawl `s3://commoncrawl/`).

---

### Week 13: High-Speed Bulk Ingestion & Cloud Streaming
- **`LOAD DATA LOCAL INFILE` Architecture**:
  - Bypassing SQL query parser layer for raw C-level bulk streaming.
  - Sizing `bulk_insert_buffer_size` and disabling `unique_checks = 0` / `foreign_key_checks = 0` during massive batch loads.
- **Hands-On Lab**:
  - Ingesting millions of records from AWS Open Data in under 60 seconds.
  - Multi-threaded chunk loading using parallel bash/Python workers.

### Week 14: Spatial GIS Analytics on Urban Transit & Global Networks
- **MySQL 8 Spatial GIS Functions**:
  - Point, Linestring, and Polygon geometries with Spatial Reference System ID (SRID 4326 for WGS 84 GPS).
  - Spatial indexes using R-Trees (Bounding Box MBR filtering).
- **Hands-On Exercises**:
  - Calculating exact transit distance between NYC pickup and dropoff points via `ST_Distance_Sphere()`.
  - Finding the 10 nearest transit hubs to any coordinate in sub-15ms.

### Week 15: Table Partitioning Architecture on Billions of NYC Taxi Trips
- **Partitioning Strategy**:
  - `RANGE (TO_DAYS(pickup_datetime))` vs `RANGE COLUMNS` vs `HASH` partitioning.
  - Subpartitioning (Composite Range + Hash) for multi-terabyte tables.
- **The Golden Architectural Rule**:
  - Why every unique and primary key on a partitioned table must include the partition key (`trip_id, pickup_datetime`).
- **Hands-On Lab**:
  - Creating a quarterly partitioned table across 50,000,000+ NYC Taxi records.

### Week 16: Partition Pruning & Zero-Downtime Data Lifecycle Aging
- **Partition Pruning Diagnostics**:
  - Verifying optimizer partition elimination using `EXPLAIN SELECT ...`.
  - Comparing full table scans (reading 100% of `.ibd` files) against pruned scans (reading only 1 partition, reducing I/O by 80–90%).
- **Zero-Downtime Data Aging on Common Crawl & Taxi Data**:
  - Instant data retirement via `ALTER TABLE nyc_yellow_taxi_trips DROP PARTITION p2020_q1`.
  - Proving sub-15ms drop performance compared to hours-long locking `DELETE FROM ...` operations with zero redo/undo log bloat.

# Month 4: Big Data Scaling, Partitioning & AWS Open Data (Weeks 13 - 16)

## Objective
Scale MySQL to handle tens of millions of records using advanced table partitioning, high-speed ingestion pipelines, and real-world public cloud datasets directly from the **AWS Open Data Registry** (`s3://nyc-tlc/` and OurAirports).

---

### Week 13: High-Speed Ingestion & Bulk Data Pipelines
- **Overcoming Bulk Load Bottlenecks**:
  - Why individual `INSERT` statements are 1,000x slower (Network roundtrips, transaction commits, index page updates).
  - Maximizing bulk throughput: `LOAD DATA LOCAL INFILE`, multi-row batching, disabling foreign key & unique checks during load.
  - Streaming data directly from AWS Open Data public buckets into MySQL in seconds.

### Week 14: AWS Open Data Ingestion & Spatial GIS SQL
- **AWS Open Data Registry Datasets**:
  - AWS Public S3: `s3://nyc-tlc/trip data/` (NYC Yellow Taxi, millions of trips).
  - OurAirports Global Aviation database (75,000+ worldwide nodes).
- **MySQL 8 Spatial GIS Data**:
  - `POINT`, `LINESTRING`, `POLYGON` geometry types.
  - Spatial indexes using R-Trees (`SPATIAL INDEX`).
  - Spatial functions: `ST_Distance_Sphere()`, `ST_Contains()`, `ST_GeomFromText()`.
- **Hands-On Lab**:
  - Calculate great-circle flight distances between world hubs using spatial SQL on downloaded AWS airport data.

### Week 15: Table Partitioning Architectures on AWS Scale
- **Partitioning Strategies**:
  - `RANGE` & `RANGE COLUMNS`: Temporal time-series partitioning on NYC Taxi data (`PARTITION BY RANGE COLUMNS(pickup_datetime)`).
  - `LIST` & `LIST COLUMNS`: Categorical / Regional partitioning.
  - `HASH` & `KEY`: Distributing writes evenly across N physical tablespace partitions.
- **The Core Constraint**:
  - Architectural rule: Every unique key and primary key MUST contain all partition expression columns (`(trip_id, pickup_datetime)`).

### Week 16: Partition Pruning & Zero-Downtime Data Lifecycle
- **Verifying Partition Pruning**:
  - Inspecting execution plans with `EXPLAIN` to verify partition elimination: scanning only target quarterly partitions while skipping millions of historical rows.
- **Zero-Downtime Data Aging on AWS Datasets**:
  - Deleting millions of historical rows with `ALTER TABLE ... DROP PARTITION` in < 10ms without generating undo/redo bloat.
  - Splitting future ranges with `REORGANIZE PARTITION`.
- **Hands-On Lab**:
  - Run `03-labs-and-exercises/lab05_partition_pruning_benchmark.sql`.

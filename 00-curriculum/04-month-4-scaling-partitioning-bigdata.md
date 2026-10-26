# Month 4: Big Data Scaling, Partitioning & Real Cloud Datasets (Weeks 13 - 16)

## Objective
Scale MySQL to handle tens of millions of records using advanced table partitioning, high-speed ingestion pipelines, and real-world public cloud datasets (e.g., AWS Open Data, NYC Taxi, Global Aviation).

---

### Week 13: High-Speed Ingestion & Bulk Data Pipelines
- **Overcoming Bulk Load Bottlenecks**:
  - Why individual `INSERT` statements are 1,000x slower (Network roundtrips, transaction commits, index page updates).
  - Maximizing bulk throughput: `LOAD DATA LOCAL INFILE`, multi-row batching, disabling foreign key & unique checks during load.
  - Redo log buffering and `autocommit = 0` batch commits.
- **Hands-On Exercises**:
  - Ingest 4.5+ million rows from CSV in < 45 seconds using `02-schemas/04_load_data_scripts.sql`.

### Week 14: Real Cloud Datasets Ingestion & Geospatial (GIS) SQL
- **Cloud Public Datasets**:
  - AWS Open Data: NYC Yellow Taxi Trip records (Pickups, Dropoffs, Fares, Passenger counts).
  - OurAirports Global Aviation database.
- **MySQL 8 Spatial GIS Data**:
  - `POINT`, `LINESTRING`, `POLYGON` geometry types.
  - Spatial indexes using R-Trees (`SPATIAL INDEX`).
  - Spatial functions: `ST_Distance_Sphere()`, `ST_Contains()`, `ST_GeomFromText()`.
- **Hands-On Exercises**:
  - Run `01-datasets/download_cloud_data.py --fetch airports`.
  - Calculate great-circle flight distances between world hubs using spatial SQL.

### Week 15: Table Partitioning Architectures
- **Partitioning Strategies**:
  - `RANGE` & `RANGE COLUMNS`: Temporal time-series partitioning (Yearly, Monthly).
  - `LIST` & `LIST COLUMNS`: Categorical / Regional partitioning (e.g. `p_na`, `p_eu`, `p_apac`).
  - `HASH` & `KEY`: Distributing writes evenly across N physical tablespace partitions.
  - Composite Subpartitioning (e.g. `RANGE` by date + `HASH` by customer).
- **The Core Constraint**:
  - Architectural rule: Every unique key and primary key MUST contain all partition expression columns.

### Week 16: Partition Pruning & Zero-Downtime Data Lifecycle
- **Verifying Partition Pruning**:
  - Inspecting execution plans with `EXPLAIN` to verify partition elimination.
- **Zero-Downtime Data Aging**:
  - Deleting millions of historical rows with `ALTER TABLE ... DROP PARTITION` in < 10ms without generating undo/redo bloat.
  - Splitting future ranges with `REORGANIZE PARTITION`.
  - Fast ETL data swap using `EXCHANGE PARTITION`.
- **Hands-On Exercises**:
  - Run `03-labs-and-exercises/lab05_partition_pruning_benchmark.sql`.

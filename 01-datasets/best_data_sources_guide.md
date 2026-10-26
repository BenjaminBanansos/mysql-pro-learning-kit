# The Best Real & Cloud Data Sources for MySQL Mastery (1M - 100M+ Rows)

To become a **Pro / Staff Database Engineer**, you cannot practice on tiny "toy" tables with 50 rows. You need **real-world data with natural skew, varied cardinality, complex relationships, semi-structured JSON, and millions of records**.

Here is the definitive guide to the **top data sources** categorized by technical focus and enterprise use case.

---

## 🌟 Tier 1: Real-World Cloud & Open Data Registries

### 1. NYC TLC Yellow & Green Taxi Trip Records (AWS Open Data)
- **Scale**: 10,000,000 to 1,000,000,000+ records (Updated monthly).
- **Format**: Parquet & CSV via AWS CloudFront CDN / S3.
- **Why It's Gold for MySQL**:
  - **Temporal Partitioning**: Perfect for `PARTITION BY RANGE COLUMNS(pickup_datetime)` by year or month.
  - **Geospatial GIS Indexing**: Contains exact latitude/longitude coordinates and pickup/dropoff zone IDs. Ideal for MySQL 8 `SPATIAL INDEX` (R-Trees) and `ST_Distance_Sphere()`.
  - **Analytical Rollups**: High cardinality on timestamps, driver license IDs, tip amounts, and passenger counts.
- **Direct Download**:
  ```bash
  # Download directly from AWS Open Data CloudFront:
  curl -O https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet
  ```
- **Mapped Curriculum**: Month 4 (Weeks 14 - 16).

---

### 2. Brazilian E-Commerce Public Dataset by Olist (Kaggle & AWS)
- **Scale**: 100,000 real orders, 1.2M+ order items, 3,000+ sellers, 100k customer reviews across Brazil (2016 - 2018).
- **Format**: Relational CSV files.
- **Why It's Gold for MySQL**:
  - **3NF Relational Integrity**: Normalized structure across `orders`, `order_items`, `customers`, `products`, `sellers`, and `order_payments`.
  - **Window Functions**: Perfect for Customer Lifetime Value (LTV), RFM segmentation via `NTILE(4)`, and cohort retention matrices.
  - **Self-Joins**: Real market basket co-occurrence analysis (finding products frequently ordered together).
- **Direct Source**: [Kaggle Olist Dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) or via Kaggle CLI:
  ```bash
  kaggle datasets download -d olistbr/brazilian-ecommerce --unzip
  ```
- **Mapped Curriculum**: Month 1 (Weeks 1 - 2) & Portfolio Project 1.

---

### 3. Stack Overflow & GitHub Archive (Google Cloud & Archive.org)
- **Scale**: 20,000,000+ questions, 30,000,000+ answers, tags, and comment hierarchies.
- **Format**: XML / CSV / SQL dumps.
- **Why It's Gold for MySQL**:
  - **InnoDB Full-Text Search (FTS)**: Huge text bodies to test Natural Language and Boolean Mode (`+mandatory -exclude*`) indexes with relevancy scores.
  - **Recursive CTEs**: Multi-level hierarchical comment threads (parent_id -> comment_id) and tag ontologies.
  - **MySQL 8 JSON Telemetry**: Extracting user badge metadata and event payloads using `JSON_TABLE()`.
- **Direct Source**: [Stack Exchange Data Dump on Archive.org](https://archive.org/details/stackexchange).
- **Mapped Curriculum**: Month 1 (Weeks 3 - 4).

---

### 4. Global Aviation & Flight Tracking (OurAirports & OpenSky Network)
- **Scale**: 75,000+ airports, 100,000+ runways, millions of worldwide flight telemetry records.
- **Format**: CSV via automated HTTP fetcher.
- **Why It's Gold for MySQL**:
  - Clean spatial coordinates (elevation, latitude, longitude) and IATA/ICAO airport codes.
  - Used in the kit's automated downloader:
  ```bash
  python3 01-datasets/download_cloud_data.py --fetch airports
  ```
- **Mapped Curriculum**: Month 4 (Week 14).

---

## ⚙️ Tier 2: Official Enterprise Industry Standard Benchmarks

When database architects at Uber, Meta, Amazon, and Netflix benchmark MySQL, they use these standardized suites:

### 1. TPC-H Benchmark (OLAP / Analytical Decision Support)
- **Scale**: Configurable by Scale Factor (SF 1 = 1GB / 6M orders, SF 10 = 10GB / 60M orders, SF 100 = 100GB).
- **Schema**: 8 classic business tables (`LINEITEM`, `ORDERS`, `CUSTOMER`, `SUPPLIER`, `PART`, `PARTSUPP`, `NATION`, `REGION`).
- **Why Use It**:
  - Contains 22 standard analytical business queries with heavy multi-table joins, subqueries, and window rollups.
  - Industry benchmark for testing MySQL 8 Hash Joins vs Nested Loops.
- **Tool**: `dbgen` (TPC official data generator).

---

### 2. Sysbench OLTP Benchmark (Concurrency & Transaction Throughput)
- **Scale**: 1,000,000 to 50,000,000 rows across 10 - 100 tables.
- **Why Use It**:
  - The gold standard for measuring Transactions Per Second (TPS), Queries Per Second (QPS), and 95th/99th percentile latency.
  - Ideal for tuning `innodb_buffer_pool_size`, `innodb_log_file_size`, and connection pooling in ProxySQL.
- **Run with Sysbench**:
  ```bash
  sysbench oltp_read_write --table-size=1000000 --threads=16 --time=60 run
  ```
- **Mapped Curriculum**: Month 3 (Week 12) & Month 5 (Week 18).

---

### 3. Official MySQL Employee Sample Database
- **Scale**: 300,000 employee records, 2,800,000 salary history records, department hierarchies.
- **Why Use It**:
  - Maintained directly by Oracle/MySQL engineers to validate execution plans and index selectivity.
- **Direct GitHub Repo**: [datacharmer/test_db](https://github.com/datacharmer/test_db)
  ```bash
  git clone https://github.com/datacharmer/test_db.git
  cd test_db && mysql -u root -p < employees.sql
  ```

---

## ⚡ Tier 3: The Built-in Kit Streaming Generator (Instant 4.6M Rows)

### Why Use the Kit's Built-in Generator?
While downloading 20GB cloud datasets over the internet can take hours, the kit's built-in generator (`generate_synthetic_millions.py`):
1. **Zero External Dependencies**: Runs out of the box using pure Python 3 without pip installs.
2. **Streaming Memory Buffers**: Generates **4,600,000 rows across 6 tables in ~15 seconds** directly onto disk without RAM thrashing.
3. **Engineered for Curriculum Labs**:
   - Skewed data distributions to test low-selectivity vs high-selectivity indexes.
   - Built-in JSON telemetry events (`payload`) to practice MySQL 8 `JSON_TABLE` and generated virtual columns.
   - Financial ledger entries crafted specifically to provoke and test deadlock avoidance.

### How to Run:
```bash
# Generate 4.6 Million data points in 15 seconds:
python3 01-datasets/generate_synthetic_millions.py --scale standard

# Generate 10+ Million data points for massive stress testing:
python3 01-datasets/generate_synthetic_millions.py --scale massive
```

---

## 🎯 Summary Matrix: Which Dataset to Use When?

| Learning Goal | Recommended Dataset | Row Count | Key Focus |
| :--- | :--- | :--- | :--- |
| **Window Functions & Joins** | Olist E-Commerce / Kit Orders | 1M - 5M | `DENSE_RANK`, `LAG`, Self-joins |
| **B+ Trees & Covering Indexes** | Kit Orders & Order Items | 3.5M | Bookmark lookup elimination, 100x speedup |
| **ACID, MVCC & Deadlocks** | Kit Financial Ledger / Sysbench | 1M - 10M | `SELECT FOR UPDATE`, canonical lock ordering |
| **JSON & Full-Text Search** | Stack Overflow / Kit Telemetry | 1M - 20M | `JSON_TABLE`, Boolean FTS (`+ - *`) |
| **Spatial GIS & Partitioning** | NYC TLC Yellow Taxi (AWS S3) | 10M - 50M | `PARTITION BY RANGE`, `ST_Distance_Sphere` |
| **Connection Pooling & HA** | Sysbench / Kit Benchmark Runner | 10M+ | QPS, p99 latency, ProxySQL multiplexing |

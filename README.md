# 🚀 MySQL Intermediate to Pro Learning Kit (AWS Open Data Scale: 5M+ Records)

A complete, production-grade learning suite and portfolio accelerator designed to take developers, data analysts, and software engineers from **intermediate SQL** to **Pro / Senior Database Architect & Staff Data Engineer** over a structured **6-month curriculum**, powered directly by real-world datasets from the **[AWS Open Data Registry](https://registry.opendata.aws/)** (`s3://nyc-tlc/`, `s3://amazon-reviews-pds/`, OurAirports).

---

## ⚡ Quick Start (Up and Running in 60 Seconds)

### 1. Launch the Database Lab via Docker
```bash
docker compose up -d
```
- **MySQL 8.0 Engine**: `localhost:3306` (User: `root`, Password: `root_password_123`)
- **Adminer Web GUI**: `http://localhost:8080` (System: `MySQL`, Server: `mysql-pro`, User: `root`, Pass: `root_password_123`)

### 2. Connect to AWS Open Data Registry or Generate Data
Connect directly to public AWS S3 buckets (no AWS account required):
```bash
# Stream real public datasets from AWS Open Data Registry:
python3 01-datasets/aws_open_data_connector.py --fetch aviation_airports
python3 01-datasets/aws_open_data_connector.py --fetch nyc_taxi

# Or generate 4.6 Million rows instantly in ~15 seconds:
python3 01-datasets/generate_synthetic_millions.py --scale standard
```

### 3. Ingest into MySQL in Under 60 Seconds
Execute the bulk loading script using high-throughput session flags:
```bash
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/01_ecommerce_cloud_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/02_financial_ledger_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/03_partitioned_analytics_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/05_aws_open_data_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/04_load_data_scripts.sql
```

### 4. Launch the Interactive Web Learning Platform
Start the in-browser Web Platform featuring an embedded SQL engine (WASM), 24-week course player, and 50 interview flashcards:
```bash
bash run_web_platform.sh
# Opens automatically at http://localhost:3333
```

---

## 🌐 Live Web Learning Platform & GitHub Repository

- **GitHub Repository**: [https://github.com/BenjaminBanansos/mysql-pro-learning-kit](https://github.com/BenjaminBanansos/mysql-pro-learning-kit)
- **Live Interactive Web Platform**: [https://BenjaminBanansos.github.io/mysql-pro-learning-kit/](https://BenjaminBanansos.github.io/mysql-pro-learning-kit/)

The platform is deployed via automated GitHub Actions (`.github/workflows/deploy-pages.yml`), enabling students and hiring managers to explore the 6-month curriculum, run live SQL queries in-browser via WebAssembly, test tuning benchmarks, and view capstone projects without installing anything!

---

## 📅 The 6-Month Structured Curriculum (Powered by AWS Open Data)

| Month | Theme | AWS Open Data Focus | Practical Deliverable |
| :--- | :--- | :--- | :--- |
| **Month 1** | **Advanced Analytical SQL** | Amazon Reviews (130M+ on AWS S3) & Transit | Cohort retention, RFM scoring, Boolean Full-Text Search (`+ - *`) |
| **Month 2** | **InnoDB Internals & Deep Indexing** | AWS NYC Taxi (3M - 10M rows) | B+ tree leaf splits, covering index 100x speedup (1,850ms -> 12ms), `EXPLAIN ANALYZE` |
| **Month 3** | **Concurrency, MVCC & Tuning** | High-throughput fare settlement & payment transactions | Multi-threaded deadlock stress test, canonical lock ordering (`LEAST`/`GREATEST`) |
| **Month 4** | **Big Data Scaling & Partitioning** | AWS S3 (`s3://nyc-tlc/`) & Global Aviation GIS | `PARTITION BY RANGE COLUMNS(pickup_datetime)`, `ST_Distance_Sphere`, sub-10ms data aging |
| **Month 5** | **Replication, ProxySQL & Cloud S3** | Native AWS Aurora `LOAD DATA FROM S3` | GTID replication, ProxySQL read/write splitting, Point-in-Time Recovery |
| **Month 6** | **Portfolio Projects & Interview Drills** | 3 Production Capstones built on AWS Open Data | 3 Standout Portfolio Repositories + Staff DBA/Backend Interview Mastery |

Detailed weekly syllabus documents are located in the [`00-curriculum/`](00-curriculum/) directory.

---

## 💼 3 Production Capstone Portfolio Projects

### [Project 1: Multi-Tenant E-Commerce Analytics Engine (5M+ Rows)](04-portfolio-projects/project-1-ecommerce-analytics/)
- **Architecture**: Hybrid 3NF relational core paired with native MySQL 8 JSON telemetry logs and generated virtual column indexing.
- **Key Win**: Slashed query execution time from **1,850ms to 18ms (100x speedup)** by replacing clustered index lookups with covering composite indexes.
- **Features**: Customer cohort retention heatmap, product affinity / market basket analysis, automated MySQL Event schedulers maintaining materialized rollups.

### [Project 2: Ultra-High-Throughput ACID Financial Ledger](04-portfolio-projects/project-2-financial-ledger/)
- **Architecture**: Double-entry ledger with immutable audit trails, optimistic row versioning, and strict check constraints.
- **Key Win**: **100% Deadlock-Free** execution under 50 concurrent worker threads via canonical lock ordering (`LEAST`/`GREATEST`).
- **Features**: Atomic money transfer stored procedures, real-time AML fraud detection queries (velocity bursts, smurfing / structuring detection).

### [Project 3: Cloud High-Availability Cluster with ProxySQL Read/Write Splitting](04-portfolio-projects/project-3-cloud-ha-proxysql/)
- **Architecture**: ProxySQL connection pooling layer routing writes to primary master and load-balancing reads across read replicas.
- **Key Win**: Handled 5,000 application client connections with 20x concurrency boost and automated replication lag shunning.

---

## 📂 Repository File Tree

```
mysql-pro-kit/
├── README.md                                  # Complete Kit Overview, Quickstart & Syllabus Map
├── docker-compose.yml                         # 1-Click Multi-Container Lab (MySQL 8, Adminer)
├── my.cnf                                     # Production-tuned MySQL 8 configuration for 1M+ rows
├── 00-curriculum/
│   ├── 01-month-1-advanced-sql.md             # Month 1: Advanced SQL, Window Functions, CTEs, JSON & Fulltext
│   ├── 02-month-2-innodb-internals-indexing.md# Month 2: InnoDB Engine, B+ Trees, EXPLAIN ANALYZE, Covering Indexes
│   ├── 03-month-3-transactions-locking-tuning.md# Month 3: MVCC, Isolation levels, Deadlocks, Lock Analysis, Tuning
│   ├── 04-month-4-scaling-partitioning-bigdata.md# Month 4: Big Data, Ingestion, Partitioning, Cloud Datasets
│   ├── 05-month-5-ha-replication-security.md  # Month 5: Replication (GTID), ProxySQL, Backups (PITR), RBAC, Encryption
│   └── 06-month-6-portfolio-and-capstone.md   # Month 6: Building 3 Pro Portfolio Projects + Resume & Interview Prep
├── 01-datasets/
│   ├── download_cloud_data.py                 # Real Cloud datasets downloader (NYC Taxi, Open E-commerce, etc.)
│   ├── generate_synthetic_millions.py         # High-speed synthetic generator (generates 1M-5M rows in seconds to CSV)
│   └── data_dictionary.md                     # Comprehensive entity & field documentation for the 1M+ datasets
├── 02-schemas/
│   ├── 01_ecommerce_cloud_schema.sql          # Base e-commerce & analytics schema with JSON telemetry
│   ├── 02_financial_ledger_schema.sql         # High-concurrency financial ledger schema
│   ├── 03_partitioned_analytics_schema.sql    # RANGE & HASH partitioned big data schema
│   └── 04_load_data_scripts.sql               # Ultra-fast LOAD DATA LOCAL INFILE scripts
├── 03-labs-and-exercises/
│   ├── lab01_window_functions_and_ctes.sql    # 5 production-grade window function patterns & recursive CTEs
│   ├── lab02_json_and_fulltext_search.sql     # MySQL 8 JSON extraction, JSON_TABLE, multi-valued index, FTS
│   ├── lab03_explain_analyze_mastery.sql      # Before & After queries comparing cost, time, and covering indexes
│   ├── lab04_deadlock_and_concurrency.py      # Python script that reproduces & eliminates Error 1213 deadlocks
│   ├── lab05_partition_pruning_benchmark.sql  # 10M-row partition benchmark queries proving performance gains
│   └── lab06_pitr_backup_recovery.sh          # Point-in-time recovery automated playbook with binary logs
├── 04-portfolio-projects/
│   ├── project-1-ecommerce-analytics/         # 5M+ row analytics engine & cohort retention
│   ├── project-2-financial-ledger/            # ACID transfer SP & real-time AML fraud detection
│   └── project-3-cloud-ha-proxysql/           # ProxySQL read/write split & load benchmark
└── 05-career-and-interview/
    ├── mysql_pro_interview_questions.md       # 50 Deep technical questions & answers (Staff DBA level)
    ├── portfolio_presentation_guide.md        # GitHub packaging guide & viral LinkedIn tech post template
    └── resume_bullet_points_template.md       # Google XYZ formula resume bullet point templates
```

---

## 🎯 Career & Interview Arsenal
- **[50 Deep MySQL Technical Interview Questions](05-career-and-interview/mysql_pro_interview_questions.md)**: Thorough answers on storage internals, MVCC, lock trees, cost optimizer, and replication.
- **[Portfolio Presentation Guide](05-career-and-interview/portfolio_presentation_guide.md)**: How to structure GitHub repositories and write technical LinkedIn breakdowns that bring recruiter outreach.
- **[Resume Bullet Point Templates](05-career-and-interview/resume_bullet_points_template.md)**: Proven bullet points with measurable impact metrics for Database Engineer, Backend Engineer, and Senior Data Engineer resumes.

# 🚀 MySQL Intermediate to Pro Learning Kit (Cloud Big Data: AWS • Google Cloud • Hugging Face)

A complete, production-grade learning suite and portfolio accelerator designed to take developers, data analysts, and software engineers from **intermediate SQL** to **Pro / Senior Database Architect & Staff Data Engineer** over a structured **6-month curriculum**, powered by **8 Tier-1 Cloud Big Data Sources**:
- **AWS Open Data Registry (S3 Public)**: NYC TLC Taxi (1.5B+ trips), Amazon Customer Reviews (130M+ rows), Common Crawl (Petabytes).
- **Google Cloud Public Datasets (BigQuery)**: GitHub Public Archive (TBs of commits & file trees), Stack Overflow (50M+ QA pairs), Bitcoin & Ethereum Blockchain Ledger (1.5 TB+).
- **Hugging Face Hub (AI Corpora)**: FineWeb (15 Trillion Tokens, 44+ TB) & RedPajama used for LLM pretraining data engineering in MySQL.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/BenjaminBanansos/mysql-pro-learning-kit)

> [!TIP]
> **Free Cloud Docker (Zero Local Setup)**: Click **Open in GitHub Codespaces** above to automatically spin up a dedicated cloud VM with Docker, MySQL 8.0, and Adminer Web GUI in Microsoft Azure cloud (60 hours/month free for all GitHub users)!

---

## ⚡ Quick Start (Up and Running in 60 Seconds)

### 1. Launch the Database Lab via Docker
```bash
docker compose up -d
```
- **MySQL 8.0 Engine**: `localhost:3306` (User: `root`, Password: `root_password_123`)
- **Adminer Web GUI**: `http://localhost:8080` (System: `MySQL`, Server: `mysql-pro`, User: `root`, Pass: `root_password_123`)

### 2. Connect to Cloud Big Data Sources (AWS, Google Cloud, Hugging Face)
Connect directly to public cloud datasets (no account or API key required):
```bash
# View all 8 cloud datasets in the master catalog:
python3 01-datasets/cloud_public_datasets_connector.py --list

# Download sample chunks from AWS, Google Cloud, or Hugging Face:
python3 01-datasets/cloud_public_datasets_connector.py --fetch nyc_taxi
python3 01-datasets/cloud_public_datasets_connector.py --fetch github_repos
python3 01-datasets/cloud_public_datasets_connector.py --fetch stack_overflow
python3 01-datasets/cloud_public_datasets_connector.py --fetch crypto_blockchain
python3 01-datasets/cloud_public_datasets_connector.py --fetch fineweb_llm

# Or generate 4.6 Million rows locally in ~15 seconds:
python3 01-datasets/generate_synthetic_millions.py --scale standard
```

### 3. Ingest into MySQL in Under 60 Seconds
Execute the bulk loading script using high-throughput session flags:
```bash
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/01_ecommerce_cloud_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/02_financial_ledger_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/03_partitioned_analytics_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/05_aws_open_data_schema.sql
docker exec -i mysql-pro-lab mysql -u root -proot_password_123 --local-infile=1 < 02-schemas/06_cloud_elite_datasets_schema.sql
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

## 📅 The 6-Month Structured Curriculum (Powered by Cloud Big Data)

| Month | Theme | Cloud Big Data Focus | Practical Deliverable |
| :--- | :--- | :--- | :--- |
| **Month 1** | **Advanced Analytical SQL** | Google Stack Overflow & AWS Amazon Reviews | Tag co-occurrence self-joins, reputation windows, Boolean Full-Text Search (`+ - *`) |
| **Month 2** | **InnoDB Internals & Deep Indexing** | Google Cloud GitHub Commits & AWS NYC Taxi | B+ tree page splits on SHA hashes, covering index 100x speedup, `EXPLAIN ANALYZE` |
| **Month 3** | **Concurrency, MVCC & Tuning** | Google Cloud Bitcoin & Ethereum Ledger | Double-entry UTXO ledger, 100% deadlock immunity (`LEAST`/`GREATEST`), 50k TPS tuning |
| **Month 4** | **Big Data Scaling & Partitioning** | AWS S3 (`s3://nyc-tlc/` & `s3://commoncrawl/`) | Quarterly `RANGE (TO_DAYS)` partitioning, partition pruning, sub-10ms data drops |
| **Month 5** | **Cloud HA & AI Pretraining Pipelines** | Hugging Face FineWeb (15T Tokens) & Aurora S3 | GTID replication, ProxySQL read/write splitting, PITR, pretraining token filtering |
| **Month 6** | **Portfolio Projects & Interview Drills** | 3 Production Capstones built on Cloud Big Data | 3 Standout Portfolio Repositories + Staff DBA/Backend Interview Mastery |

Detailed weekly syllabus documents are located in the [`00-curriculum/`](00-curriculum/) directory.
Detailed textbook lesson guides with ASCII diagrams are in [`00-curriculum/lessons/`](00-curriculum/lessons/).

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
│   ├── 01-month-1-advanced-sql.md             # Month 1: Advanced SQL on Stack Overflow & Amazon Reviews
│   ├── 02-month-2-innodb-internals-indexing.md# Month 2: InnoDB B+ Trees on GitHub Commits & NYC Taxi
│   ├── 03-month-3-transactions-locking-tuning.md# Month 3: MVCC & ACID on Bitcoin/Ethereum Blockchain
│   ├── 04-month-4-scaling-partitioning-bigdata.md# Month 4: Big Data, RANGE Partitioning & Common Crawl
│   ├── 05-month-5-ha-replication-security.md  # Month 5: Replication, ProxySQL & FineWeb 15T Staging
│   ├── 06-month-6-portfolio-and-capstone.md   # Month 6: 3 Cloud Big Data Capstones + Career Prep
│   └── lessons/                               # In-depth Textbook Lesson Guides (Weeks 1, 2, 3, 4, 6, 10, 15)
├── 01-datasets/
│   ├── cloud_public_datasets_connector.py     # Master CLI connector (AWS, Google Cloud, Hugging Face)
│   ├── cloud_big_data_sources_master_guide.md # S3 buckets, BigQuery IDs, and Hugging Face Hub catalog
│   ├── generate_synthetic_millions.py         # High-speed synthetic generator (generates 1M-5M rows in seconds to CSV)
│   └── data_dictionary.md                     # Comprehensive entity & field documentation for the datasets
├── 02-schemas/
│   ├── 01_ecommerce_cloud_schema.sql          # Base e-commerce & analytics schema with JSON telemetry
│   ├── 02_financial_ledger_schema.sql         # High-concurrency financial ledger schema
│   ├── 03_partitioned_analytics_schema.sql    # RANGE & HASH partitioned big data schema
│   ├── 05_aws_open_data_schema.sql            # AWS Taxi, Amazon Reviews FTS, and Airport GIS
│   ├── 06_cloud_elite_datasets_schema.sql     # GitHub DAG, Stack Overflow, Blockchain UTXO & FineWeb
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

# Master Architectural Guide: Cloud Big Data Sources for Enterprise MySQL

This guide provides the official documentation, bucket URIs, BigQuery table IDs, Hugging Face repositories, and ingestion strategies for the **8 Tier-1 Cloud Big Data Sources** integrated into the MySQL Intermediate to Pro Learning Kit.

---

## 🌐 Tier 1 Cloud Data Ecosystem Overview

```
                                      CLOUD BIG DATA ECOSYSTEM
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│ AWS Open Data Registry (S3)  │ │ Google Cloud Public Data(BQ) │ │     Hugging Face Hub (AI)    │
│ • NYC TLC Taxi (1.5B+ Trips) │ │ • GitHub Public Archive (TBs)│ │ • FineWeb (15 Trillion Toks) │
│ • Amazon Reviews (130M+ Rows)│ │ • Stack Overflow (All Q&A)   │ │ • RedPajama (1.2T+ Tokens)   │
│ • Common Crawl (Petabytes)   │ │ • Bitcoin/Ethereum Blockchain│ │   (LLM Pretraining Metadata) │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 1. 📦 AWS Open Data Registry (Public S3 Buckets)

All AWS Open Data buckets allow public, unauthenticated reads without signing requests (`--no-sign-request`).

### A. NYC Taxi & Limousine Commission (TLC) Records
- **Registry Link**: [registry.opendata.aws/nyc-tlc-records](https://registry.opendata.aws/nyc-tlc-records/)
- **Public S3 URI**: `s3://nyc-tlc/trip data/`
- **CloudFront CDN**: `https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet`
- **Scale**: Hundreds of millions to billions of trips (~500 GB+ uncompressed).
- **Core MySQL Concepts Taught**:
  - `PARTITION BY RANGE (TO_DAYS(pickup_datetime))` (Quarterly & Monthly).
  - Partition Pruning verification in `EXPLAIN`.
  - Composite indexes on `(pickup_location_id, pickup_datetime, total_amount)` for 100x speedup.
- **AWS CLI Command (No Credentials Needed)**:
  ```bash
  aws s3 ls --no-sign-request "s3://nyc-tlc/trip data/"
  aws s3 cp --no-sign-request "s3://nyc-tlc/trip data/yellow_tripdata_2023-01.parquet" ./nyc_taxi_sample.parquet
  ```

### B. Amazon Customer Reviews Public Dataset (PDS)
- **Registry Link**: [registry.opendata.aws/amazon-reviews](https://registry.opendata.aws/amazon-reviews/)
- **Public S3 URI**: `s3://amazon-reviews-pds/tsv/`
- **Scale**: 130+ Million customer reviews across 20+ years (~150 GB TSV).
- **Core MySQL Concepts Taught**:
  - InnoDB Full-Text Search (FTS) with inverted index auxiliary tables.
  - Boolean mode matching (`+battery +"fast charging" -refurbished`).
  - Sentiment aggregation and rolling product rating velocity using window functions.
- **AWS CLI Command**:
  ```bash
  aws s3 ls --no-sign-request "s3://amazon-reviews-pds/tsv/"
  # Download sample US camera reviews
  aws s3 cp --no-sign-request "s3://amazon-reviews-pds/tsv/amazon_reviews_us_Camera_v1_00.tsv.gz" ./
  ```

### C. Common Crawl (Raw Web Scrapes)
- **Registry Link**: [registry.opendata.aws/commoncrawl](https://registry.opendata.aws/commoncrawl/)
- **Public S3 URI**: `s3://commoncrawl/`
- **Scale**: Petabytes of raw internet HTML, WARC metadata, and CDX index files (billions of web pages).
- **Core MySQL Concepts Taught**:
  - Storing domain crawl graphs, URI hierarchies, and crawl status telemetry.
  - External staging pipelines: Extracting CDX index records into MySQL tables.
  - Large-scale string prefix hashing and Bloom filter integration.
- **AWS CLI Command**:
  ```bash
  aws s3 ls --no-sign-request "s3://commoncrawl/crawl-data/"
  ```

---

## 2. 🔍 Google Cloud Public Datasets (BigQuery & GCS Exports)

Google Cloud hosts terabytes of public analytical data in BigQuery that can be queried directly via BigQuery's free 1TB/month tier, or exported as Parquet/CSV to Google Cloud Storage (GCS) and loaded into MySQL.

### A. GitHub Public Archive (`github_repos`)
- **BigQuery Dataset ID**: `bigquery-public-data.github_repos`
- **Scale**: Terabytes of data covering every public commit, pull request, issue, and file tree across 3+ million repositories.
- **Core MySQL Concepts Taught**:
  - Recursive Common Table Expressions (CTEs) traversing multi-hop Git commit histories (`parent_sha` -> `commit_sha`).
  - Secondary B+ Tree indexes on high-cardinality SHA-1/SHA-256 strings vs clustered auto-increment IDs.
  - Developer contribution graphs and repository star co-occurrence networks.
- **Export Query (BigQuery to GCS/CSV)**:
  ```sql
  EXPORT DATA OPTIONS(uri='gs://your-bucket/github_commits_*.csv', format='CSV', overwrite=true) AS
  SELECT commit, author.name, author.date, repo_name[OFFSET(0)] AS repo_name, message
  FROM `bigquery-public-data.github_repos.commits`
  WHERE EXTRACT(YEAR FROM author.date) = 2023
  LIMIT 1000000;
  ```

### B. Stack Overflow Public Dataset
- **BigQuery Dataset ID**: `bigquery-public-data.stackoverflow`
- **Scale**: Every question, answer, tag, comment, and vote since 2008 (over 50 million posts).
- **Core MySQL Concepts Taught**:
  - Self-joins on normalized question/answer pairs and tag co-occurrence matrix analysis.
  - Advanced Window Functions (`ROW_NUMBER`, `DENSE_RANK`, `LAG`) tracking user reputation trajectories.
  - MySQL 8 JSON extraction on post badges and custom tag attributes.

### C. Bitcoin & Ethereum Blockchain Ledger
- **BigQuery Dataset IDs**:
  - Bitcoin: `bigquery-public-data.crypto_bitcoin`
  - Ethereum: `bigquery-public-data.crypto_ethereum`
- **Scale**: Complete cryptographic ledger of every transaction and block ever mined (~1.5 TB+).
- **Core MySQL Concepts Taught**:
  - Designing an enterprise-grade UTXO (Unspent Transaction Output) and double-entry ledger schema in MySQL.
  - Strict ACID transaction isolation (`SERIALIZABLE` vs `REPEATABLE READ`) ensuring zero negative balances.
  - Canonical lock ordering (`LEAST(from_acct, to_acct)`) for 100% deadlock immunity under 50+ concurrent worker threads.
  - Anti-Money Laundering (AML) sliding-window fraud detection queries.

---

## 3. 🤖 Hugging Face Hub (AI & LLM Pretraining Corpora)

The Hugging Face Hub hosts open-source pretraining datasets utilized by state-of-the-art LLMs (e.g. Llama, Mistral).

### A. FineWeb & RedPajama
- **Hugging Face Hub ID**:
  - FineWeb: `HuggingFaceFW/fineweb` (15+ Trillion Tokens, 44+ Terabytes)
  - RedPajama: `togethercomputer/RedPajama-Data-1T` (1.2 Trillion Tokens)
- **Scale**: 44+ Terabytes across trillions of tokens.
- **Core MySQL Concepts Taught**:
  - Managing LLM pretraining metadata: document lengths, language classification scores, toxicity filters, and crawl source provenance.
  - Building Vocabulary & Token Frequency inverted indexes in MySQL 8.
  - Data engineering staging pipelines: filtering low-quality web documents in SQL before feeding tokenizers.
- **Streaming Chunks via Python**:
  ```python
  from datasets import load_dataset

  # Stream samples directly without downloading 44 TB
  dataset = load_dataset("HuggingFaceFW/fineweb", name="sample-10BT", split="train", streaming=True)
  sample_doc = next(iter(dataset))
  print(sample_doc['text'][:200])
  ```

---

## 🛠️ Summary Matrix for Students

| Dataset | Cloud Provider | Volume | Optimal MySQL 8 Storage Pattern | Key Architectural Mastery |
| :--- | :--- | :--- | :--- | :--- |
| **NYC TLC Taxi** | AWS Open Data | 1.5B+ Trips | Quarterly `RANGE (TO_DAYS)` Partitioning | Partition Pruning & Covering Indexes |
| **Amazon Reviews** | AWS Open Data | 130M+ Rows | InnoDB `FULLTEXT` Inverted Index | Boolean Mode NLP & Relevance Ranking |
| **Common Crawl** | AWS Open Data | Petabytes | Domain Hashing & Staged WARC Indexing | Large-Scale Web Graphs & Ingestion |
| **GitHub Archive** | GCP BigQuery | Terabytes | B+Tree Composite Index on Git SHA/Repo | Recursive CTEs on Git Parent DAGs |
| **Stack Overflow** | GCP BigQuery | 50M+ Posts | Relational Tag Normalization & JSON | Self-Joins & User Reputation Windows |
| **Bitcoin/Ethereum** | GCP BigQuery | 1.5 TB+ | Clustered UTXO Double-Entry Ledger | Canonical Locking & Deadlock Immunity |
| **FineWeb / RedPajama**| Hugging Face | 15T Tokens | Compressed InnoDB Document Metadata | LLM Pretraining Data Filtering & Staging |

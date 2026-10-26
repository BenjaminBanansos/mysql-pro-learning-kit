# Chapter 3: Fetching Data from Cloud Containers (Hands-On Connection Guide)

> **Track:** Zero-to-Hero Cloud Relational Database Mastery  
> **Estimated Duration:** 50 min study  
> **Cloud Container:** `AWS CLI • curl • Python Cloud Connector Script`  
> **Interactive Platform:** [Open in Live Web Academy](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

---

## 🎯 Chapter Overview
Learn the exact step-by-step commands to fetch real data chunks directly from public AWS S3 buckets, Google Cloud mirrors, and Hugging Face Hub without requiring an account or credit card.

---

## 📖 In-Depth Lesson Content

The biggest hurdle for beginners is usually: *'How do I actually get the cloud data onto my computer without paying or signing up for cloud accounts?'*

The answer is **anonymous, unauthenticated access** provided by cloud providers for open public research.

### 1. Fetching from AWS S3 Using the AWS CLI
The AWS Command Line Interface allows you to interact with S3. The secret trick for beginners is the `--no-sign-request` flag, which instructs AWS to bypass credentials:

```bash
# 1. List files inside the public NYC Taxi S3 bucket:
aws s3 ls s3://nyc-tlc/trip\ data/ --no-sign-request

# 2. Download a real monthly yellow taxi parquet file (~50 MB):
aws s3 cp s3://nyc-tlc/trip\ data/yellow_tripdata_2024-01.parquet ./data/ --no-sign-request

# 3. Download Amazon Customer Reviews (Wireless Category TSV):
aws s3 cp s3://amazon-reviews-pds/tsv/amazon_reviews_us_Wireless_v1_00.tsv.gz ./data/ --no-sign-request
```

### 2. Fetching via Direct HTTPS (curl or wget)
If you do not have the AWS CLI installed, public cloud buckets often have CloudFront CDN mirrors accessible via standard web requests:

```bash
# Download NYC Taxi trip data directly using curl:
curl -O https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet
```

### 3. Fetching from Hugging Face Hub (FineWeb LLM Tokens)
Hugging Face datasets can be downloaded using the `huggingface-cli` or via Python's `huggingface_hub` package:

```bash
pip install huggingface_hub
python3 -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='HuggingFaceFW/fineweb', filename='sample/10BT/000_00000.parquet', repo_type='dataset', local_dir='./data/')"
```

### 4. The All-in-One MySQL Pro Python Connector
To make cloud ingestion effortless, this repository includes a master connector script:

```bash
# List all 8 cloud datasets in the master catalog:
python3 01-datasets/cloud_public_datasets_connector.py --list

# Download real sample chunks from AWS, GCP, or Hugging Face:
python3 01-datasets/cloud_public_datasets_connector.py --fetch nyc_taxi
python3 01-datasets/cloud_public_datasets_connector.py --fetch amazon_reviews
python3 01-datasets/cloud_public_datasets_connector.py --fetch stack_overflow
```

---

## 🏗️ Architecture & Data Flow Diagram

```text
+-------------------------------------------------------------------------------+
|                       CLOUD DATA DOWNLOAD PIPELINE                            |
+-------------------------------------------------------------------------------+
  [AWS S3 Bucket]        -> s3://nyc-tlc/trip data/yellow_tripdata_2024-01.parquet
         │
         │ (aws s3 cp ... --no-sign-request)
         ▼
  [Local Staging Dir]    -> ./01-datasets/staging/nyc_taxi_sample.csv
         │
         │ (LOAD DATA LOCAL INFILE)
         ▼
  [MySQL 8 Engine]       -> nyc_taxi_trips table (ready for high-speed SQL queries)
+-------------------------------------------------------------------------------+
```

---

## 🔑 Key Rules & Invariants
- The `--no-sign-request` flag allows you to download public AWS S3 data without an AWS account or API key.
- Datasets can be retrieved via AWS CLI, direct curl HTTP mirrors, or the repo's master Python connector.
- Once downloaded to a local staging directory, datasets can be ingested into MySQL in milliseconds.

---

## ☁️ Cloud Big Data Case Study
- **Source:** `s3://amazon-reviews-pds/tsv/ (AWS Open Data)`
- **Target Table:** `amazon_reviews`
- **Title:** Amazon Customer Reviews Open Dataset
- **Description:** Containing over 130 million customer reviews from 1995 to 2015, this dataset is stored in tab-separated gzip archives on Amazon S3 and is used worldwide for recommendation modeling and sentiment analysis.

---

## 💻 Hands-On SQL Production Query
**Inspect Sample Amazon Reviews Ingested in MySQL**

```sql
-- Inspect real sample Amazon reviews loaded from S3
SELECT review_id, product_title, star_rating, helpful_votes, total_votes 
FROM amazon_reviews 
ORDER BY helpful_votes DESC 
LIMIT 5;
```

### Query Breakdown & Mechanics:
Queries customer reviews imported from the Amazon Customer Reviews dataset, ordering by helpful_votes descending to identify the most impactful community feedback.

---

## ⚠️ Senior DBA Production Pitfalls
> Large TSV files from S3 are frequently gzip compressed (.gz). Always ensure you either decompress them first or configure your ingestion pipeline to stream through zcat.

---

## 🏋️ Chapter Hands-On Exercise & Challenge
What flag must you provide to the AWS CLI to download public open data from S3 without entering credentials?

### Official Solution:
<details>
<summary><b>Click to Reveal Official Solution Code</b></summary>

```sql
-- The required flag is:
-- --no-sign-request
-- Example: aws s3 cp s3://nyc-tlc/trip\ data/yellow_tripdata_2024-01.parquet . --no-sign-request
```
</details>

---

## 🧠 Knowledge Check Quiz
**Question:** What is the purpose of the '--no-sign-request' flag when using the AWS CLI?

1. It tells the CLI to bypass authentication and access public buckets anonymously without an AWS account **[CORRECT]**
2. It automatically encrypts the downloaded file with a password
3. It skips downloading any rows that contain NULL values
4. It converts Parquet files into Microsoft Excel spreadsheets

> **Explanation:** The '--no-sign-request' flag instructs the AWS CLI not to sign HTTP requests with AWS credentials, enabling direct unauthenticated access to public S3 buckets.


---
[⬅️ Back to Master Curriculum](./README.md) | [🚀 Launch In-Browser SQL Playground](https://benjaminbanansos.github.io/mysql-pro-learning-kit/)

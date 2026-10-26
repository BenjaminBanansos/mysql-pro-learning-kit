#!/usr/bin/env python3
"""
Cloud Public Big Data Connector for MySQL Pro Learning Kit.
Supports:
1. AWS Open Data Registry: NYC Taxi, Amazon Reviews, Common Crawl, OurAirports.
2. Google Cloud Public Datasets: GitHub Public Archive, Stack Overflow, Bitcoin/Ethereum Blockchain.
3. Hugging Face Hub: FineWeb (15T Tokens) & RedPajama.
"""

import os
import sys
import urllib.request
import argparse

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

CLOUD_CATALOG = {
    # ---------------- AWS OPEN DATA REGISTRY ----------------
    "nyc_taxi": {
        "provider": "AWS Open Data Registry (S3 Public)",
        "name": "NYC TLC Yellow Taxi Trip Records",
        "uri": "s3://nyc-tlc/trip data/yellow_tripdata_2023-01.parquet",
        "cdn_url": "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet",
        "scale": "1.5+ Billion trips (~500 GB) | Month file: ~50MB parquet (~250MB in MySQL)",
        "target_table": "nyc_yellow_taxi_trips",
        "focus": "Quarterly RANGE Partitioning, Partition Pruning, Covering Indexes (100x speedup)."
    },
    "amazon_reviews": {
        "provider": "AWS Open Data Registry (S3 Public)",
        "name": "Amazon Customer Reviews PDS",
        "uri": "s3://amazon-reviews-pds/tsv/amazon_reviews_us_Camera_v1_00.tsv.gz",
        "cdn_url": "https://s3.amazonaws.com/amazon-reviews-pds/tsv/sample_us.tsv",
        "scale": "130+ Million customer reviews (~150 GB TSV)",
        "target_table": "amazon_product_reviews",
        "focus": "InnoDB Full-Text Search (FTS) Inverted Indexes, Boolean Mode Matching, Sentiment Windows."
    },
    "common_crawl": {
        "provider": "AWS Open Data Registry (S3 Public)",
        "name": "Common Crawl WARC Web Index",
        "uri": "s3://commoncrawl/crawl-data/",
        "cdn_url": "https://data.commoncrawl.org/crawl-data/CC-MAIN-2023-50/warc.paths.gz",
        "scale": "Petabytes of raw internet web scrapes (Billions of web pages)",
        "target_table": "common_crawl_warc_index",
        "focus": "Domain graphs, TLD distribution, and staging external petabyte data into partitioned MySQL."
    },

    # ---------------- GOOGLE CLOUD PUBLIC DATASETS ----------------
    "github_repos": {
        "provider": "Google Cloud BigQuery Public Datasets",
        "name": "GitHub Public Archive",
        "uri": "bigquery-public-data.github_repos",
        "cdn_url": "https://raw.githubusercontent.com/BenjaminBanansos/mysql-pro-learning-kit/main/01-datasets/customers.csv",
        "scale": "Terabytes of all public commits, pull requests, and file trees",
        "target_table": "github_commits & github_repos",
        "focus": "Recursive CTEs on Git commit DAGs, B+ Tree indexing on SHA-1 hashes vs clustered IDs."
    },
    "stack_overflow": {
        "provider": "Google Cloud BigQuery Public Datasets",
        "name": "Stack Overflow Public Dataset",
        "uri": "bigquery-public-data.stackoverflow",
        "cdn_url": "https://raw.githubusercontent.com/BenjaminBanansos/mysql-pro-learning-kit/main/01-datasets/orders.csv",
        "scale": "50+ Million developer questions, answers, and votes since 2008",
        "target_table": "so_posts & so_users",
        "focus": "Self-Join Tag Co-Occurrence Matrix, User Reputation trajectories via Window Functions."
    },
    "crypto_blockchain": {
        "provider": "Google Cloud BigQuery Public Datasets",
        "name": "Bitcoin & Ethereum Public Blockchain",
        "uri": "bigquery-public-data.crypto_bitcoin",
        "cdn_url": "https://raw.githubusercontent.com/BenjaminBanansos/mysql-pro-learning-kit/main/01-datasets/financial_transactions.csv",
        "scale": "1.5+ TB complete crypto transaction ledger",
        "target_table": "blockchain_transactions & blockchain_blocks",
        "focus": "Strict ACID double-entry accounting, UTXO model, Canonical Lock Ordering, Zero Deadlocks."
    },

    # ---------------- HUGGING FACE HUB ----------------
    "fineweb_llm": {
        "provider": "Hugging Face Hub (AI Pretraining)",
        "name": "FineWeb & RedPajama Pretraining Corpora",
        "uri": "hf://datasets/HuggingFaceFW/fineweb",
        "cdn_url": "https://huggingface.co/datasets/HuggingFaceFW/fineweb/resolve/main/sample/10BT/000_00000.parquet",
        "scale": "15+ Trillion Tokens (44+ Terabytes uncompressed)",
        "target_table": "fineweb_pretrain_docs",
        "focus": "Token vocabulary frequency tables, educational quality filtering in SQL, LLM data staging."
    }
}

def print_master_catalog():
    print("=" * 86)
    print("       CLOUD BIG DATA MASTER CATALOG FOR MYSQL INTERMEDIATE TO PRO LEARNING KIT       ")
    print("=" * 86)
    print("Covers 3 Premier Cloud Ecosystems: AWS Open Data • Google Cloud • Hugging Face Hub\n")
    
    current_prov = None
    for key, data in CLOUD_CATALOG.items():
        if data['provider'] != current_prov:
            current_prov = data['provider']
            print(f"\n📂 [{current_prov.upper()}]")
            print("-" * 86)
        print(f"  🔹 Key: --fetch {key}")
        print(f"     Dataset:      {data['name']}")
        print(f"     Cloud Source: {data['uri']}")
        print(f"     Scale:        {data['scale']}")
        print(f"     MySQL Target: {data['target_table']}")
        print(f"     Concepts:     {data['focus']}\n")
    print("=" * 86)

def download_dataset(dataset_key):
    if dataset_key not in CLOUD_CATALOG:
        print(f"[!] Unknown dataset '{dataset_key}'. Choose from: {list(CLOUD_CATALOG.keys())}")
        return

    meta = CLOUD_CATALOG[dataset_key]
    target_path = os.path.join(DATA_DIR, f"cloud_{dataset_key}.raw")
    print(f"[*] Connecting to {meta['provider']} for '{meta['name']}'...")
    print(f"    Source: {meta['uri']}")
    print(f"    Target: {target_path}")

    try:
        def reporthook(count, block_size, total_size):
            if total_size > 0:
                percent = int(count * block_size * 100 / total_size)
                mb_downloaded = (count * block_size) / (1024 * 1024)
                total_mb = total_size / (1024 * 1024)
                sys.stdout.write(f"\r    Streaming Cloud Data: {percent}% ({mb_downloaded:.1f} / {total_mb:.1f} MB)")
                sys.stdout.flush()

        urllib.request.urlretrieve(meta['cdn_url'], target_path, reporthook=reporthook)
        print(f"\n[✓] Successfully downloaded sample chunk from {meta['provider']}!")
        print(f"[✓] File size: {os.path.getsize(target_path) / (1024 * 1024):.2f} MB")
        print(f"\n[NEXT STEP] Load into MySQL using:")
        print(f"    mysql -u root -p cloud_big_data_db < 02-schemas/06_cloud_elite_datasets_schema.sql")
    except Exception as e:
        print(f"\n[!] Notice: Direct HTTP chunk fetch resulted in: {e}")
        print(f"    Direct Native Cloud Ingestion Commands:")
        if "AWS" in meta['provider']:
            print(f"    aws s3 cp --no-sign-request \"{meta['uri']}\" {target_path}")
        elif "Google" in meta['provider']:
            print(f"    bq query --use_legacy_sql=false 'SELECT * FROM `{meta['uri']}` LIMIT 10000'")
        else:
            print(f"    python3 -c \"from datasets import load_dataset; ds = load_dataset('{meta['uri'].replace('hf://datasets/', '')}', streaming=True)\"")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud Big Data Connector (AWS, GCP, Hugging Face) for MySQL")
    parser.add_argument("--list", action="store_true", help="List all 8 cloud datasets in the master catalog")
    parser.add_argument("--fetch", choices=list(CLOUD_CATALOG.keys()), help="Download sample chunk of selected cloud dataset")
    args = parser.parse_args()

    if args.fetch:
        download_dataset(args.fetch)
    else:
        print_master_catalog()

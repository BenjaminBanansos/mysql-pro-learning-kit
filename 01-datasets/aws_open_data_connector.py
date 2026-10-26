#!/usr/bin/env python3
"""
AWS Open Data Registry Connector for MySQL Pro Learning Kit.
Connects directly to AWS Open Data Registry public S3 buckets and CloudFront CDNs
(No AWS account or credentials required — uses public --no-sign-request access).
"""

import os
import sys
import urllib.request
import gzip
import csv
import argparse

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

AWS_REGISTRY_CATALOG = {
    "nyc_taxi": {
        "name": "NYC TLC Yellow Taxi Trip Records",
        "aws_registry_url": "https://registry.opendata.aws/nyc-tlc-records/",
        "s3_bucket": "s3://nyc-tlc/trip data/",
        "s3_uri": "s3://nyc-tlc/trip data/yellow_tripdata_2023-01.parquet",
        "public_cdn_url": "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet",
        "description": "Over 1.5 Billion real urban transit trips with pickup/dropoff coordinates, passenger counts, and fare breakdowns.",
        "mysql_table": "aws_open_data_db.nyc_yellow_taxi_trips",
        "scale": "~3,000,000 rows per monthly file (~50 MB compressed, ~250 MB in MySQL)"
    },
    "amazon_reviews": {
        "name": "Amazon Customer Product Reviews (US Camera / Tech)",
        "aws_registry_url": "https://registry.opendata.aws/amazon-reviews/",
        "s3_bucket": "s3://amazon-reviews-pds/tsv/",
        "s3_uri": "s3://amazon-reviews-pds/tsv/amazon_reviews_us_Camera_v1_00.tsv.gz",
        "public_cdn_url": "https://s3.amazonaws.com/amazon-reviews-pds/tsv/sample_us.tsv",
        "description": "130+ Million customer reviews from Amazon across 20 years. Ideal for Full-Text Search (FTS) and rating analytics.",
        "mysql_table": "aws_open_data_db.amazon_product_reviews",
        "scale": "Sample: ~10,000 rows | Full category: 1,800,000+ rows"
    },
    "aviation_airports": {
        "name": "OurAirports Worldwide Flight & Hub Telemetry",
        "aws_registry_url": "https://ourairports.com/data/",
        "s3_bucket": "s3://ourairports-data/",
        "s3_uri": "s3://ourairports-data/airports.csv",
        "public_cdn_url": "https://davidmegginson.github.io/ourairports-data/airports.csv",
        "description": "Global airport coordinate database with latitude/longitude for MySQL 8 Spatial GIS SQL.",
        "mysql_table": "aws_open_data_db.airports_gis",
        "scale": "75,000+ global airport nodes"
    }
}

def print_catalog():
    print("=" * 80)
    print("            AWS OPEN DATA REGISTRY - CONNECTOR CATALOG FOR MYSQL            ")
    print("=" * 80)
    print("All datasets below are hosted on AWS Open Data public S3 buckets.")
    print("No AWS API key or secret credentials required (Public S3 / No-Sign-Request).\n")
    
    for key, data in AWS_REGISTRY_CATALOG.items():
        print(f"🔹 [{key.upper()}] {data['name']}")
        print(f"   Registry Info: {data['aws_registry_url']}")
        print(f"   Public S3 URI: {data['s3_uri']}")
        print(f"   MySQL Target:  {data['mysql_table']}")
        print(f"   Dataset Scale: {data['scale']}")
        print(f"   Description:   {data['description']}\n")
    print("=" * 80)

def download_dataset(dataset_key):
    if dataset_key not in AWS_REGISTRY_CATALOG:
        print(f"[!] Unknown dataset '{dataset_key}'. Choose from: {list(AWS_REGISTRY_CATALOG.keys())}")
        return

    meta = AWS_REGISTRY_CATALOG[dataset_key]
    target_path = os.path.join(DATA_DIR, f"aws_{dataset_key}.raw")
    print(f"[*] Connecting to AWS Open Data CDN for '{meta['name']}'...")
    print(f"    URL: {meta['public_cdn_url']}")
    print(f"    Target: {target_path}")

    try:
        def reporthook(count, block_size, total_size):
            if total_size > 0:
                percent = int(count * block_size * 100 / total_size)
                mb_downloaded = (count * block_size) / (1024 * 1024)
                total_mb = total_size / (1024 * 1024)
                sys.stdout.write(f"\r    Downloading from AWS S3: {percent}% ({mb_downloaded:.1f} / {total_mb:.1f} MB)")
                sys.stdout.flush()

        urllib.request.urlretrieve(meta['public_cdn_url'], target_path, reporthook=reporthook)
        print(f"\n[✓] Successfully downloaded from AWS Open Data Registry!")
        print(f"[✓] File size: {os.path.getsize(target_path) / (1024 * 1024):.2f} MB")
        print(f"\n[NEXT STEP] Run 'mysql < 02-schemas/05_aws_open_data_schema.sql' to ingest into MySQL.")
    except Exception as e:
        print(f"\n[!] Download notice: {e}")
        print(f"    Direct S3 AWS CLI alternative (No AWS credentials needed):")
        print(f"    aws s3 cp --no-sign-request \"{meta['s3_uri']}\" {target_path}")

def print_aurora_native_s3_guide():
    print("""
========================================================================
     HOW TO CONNECT AWS RDS / AURORA MYSQL DIRECTLY TO S3 BUCKETS
========================================================================

If you are running MySQL on AWS (Amazon Aurora MySQL or Amazon RDS MySQL),
you can ingest data directly from S3 without downloading to your computer!

1. Grant RDS IAM Role access to Amazon S3:
   Create an IAM Role with AmazonS3ReadOnlyAccess and attach it to your RDS cluster.

2. Enable the S3 Ingestion Feature in MySQL:
   Aurora MySQL includes the native 'LOAD DATA FROM S3' command:

   LOAD DATA FROM S3 PREFIX 's3://nyc-tlc/trip data/yellow_tripdata_2023-01'
   INTO TABLE aws_open_data_db.nyc_yellow_taxi_trips
   FIELDS TERMINATED BY ','
   LINES TERMINATED BY '\\n'
   IGNORE 1 LINES;

This bypasses your local network and downloads directly across AWS's 100 Gbps
backbone network into your database in seconds!
========================================================================
""")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AWS Open Data Registry Connector for MySQL")
    parser.add_argument("--list", action="store_true", help="List available AWS Open Data datasets")
    parser.add_argument("--fetch", choices=["nyc_taxi", "amazon_reviews", "aviation_airports"], help="Download public AWS dataset")
    parser.add_argument("--aurora-s3", action="store_true", help="Show native AWS Aurora/RDS S3 ingestion guide")
    args = parser.parse_args()

    if args.fetch:
        download_dataset(args.fetch)
    elif args.aurora_s3:
        print_aurora_native_s3_guide()
    else:
        print_catalog()

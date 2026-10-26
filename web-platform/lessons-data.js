/**
 * MySQL Pro Academy: 10-Chapter Master Course Data
 * Zero-to-Hero curriculum covering cloud containers (AWS S3, BigQuery, Hugging Face)
 */

window.LESSON_DETAILS = {
  "1": {
    "chapter": 1,
    "month": 1,
    "week": 1,
    "title": "Chapter 1: Zero-to-One Foundations: What is Data, Databases & SQL?",
    "badge": "Zero-to-One Foundations",
    "cloudDataset": "Core Relational Engine & Tabular Fundamentals",
    "time": "45 min study",
    "overview": "Start from absolute zero: understand what data is, why spreadsheets (Excel/Google Sheets) fail at scale, how Relational Databases (RDBMS) work, and how SQL enables declarative querying without writing complex procedural code.",
    "content": "Every modern app on your phone\u2014from Instagram and Uber to Amazon and Netflix\u2014relies on a **Database** to store and retrieve information.\n\n### 1. What is Data?\nData is simply structured information:\n- Your name, email, and password.\n- The items currently sitting in your digital shopping cart.\n- The GPS pickup coordinates and fare of an NYC taxi ride.\n- The timestamp and value of a cryptocurrency transaction.\n\n### 2. Why Spreadsheets (Excel / Google Sheets) Fail at Scale\nMost people first experience tabular data using Microsoft Excel or Google Sheets. While spreadsheets are convenient for quick calculations, they fail in production for three critical reasons:\n1. **The 1-Million Row Hard Limit**: Microsoft Excel crashes after 1,048,576 rows. Real cloud datasets (like NYC Taxi or Amazon Reviews) contain tens of millions to billions of rows.\n2. **Multi-User Concurrency & File Corruption**: If 10,000 customers buy tickets at the exact same second on a website, a spreadsheet cannot handle simultaneous writes\u2014it locks up or corrupts the file.\n3. **Lack of Data Integrity**: In a spreadsheet, a user can accidentally type the word *\"twenty\"* into a column meant for numeric prices, breaking downstream calculations.\n\n### 3. What is an RDBMS (Relational Database Management System)?\nA Relational Database like **MySQL 8.0** organizes data into **Tables**. Think of a table as an ultra-fast, strictly enforced grid:\n- **Columns (Fields / Attributes)**: Define the blueprint of what data can be stored (e.g., `customer_id`, `email`, `created_at`).\n- **Rows (Records / Tuples)**: Each individual horizontal entry in the table represents a single entity (e.g., Customer #101).\n- **Primary Key**: The most fundamental concept in relational database design. A Primary Key is a column (or set of columns) guaranteed to be **unique** and **never NULL** for every single row. Think of it like a citizen's passport number or national ID\u2014no two people on earth can have the exact same passport number.\n\n### 4. What is SQL (Structured Query Language)?\nSQL is a **declarative language**. In programming languages like Python or Java (imperative languages), you must tell the computer *how* to loop through memory step-by-step. In SQL, you simply describe *what* data you want, and the database engine figures out the fastest way to retrieve it.\n\n```sql\nSELECT full_name, email \nFROM customers \nWHERE country = 'USA';\n```\nThe database engine automatically inspects the disk, uses its B+ Tree index, and returns only the matching customer rows in milliseconds!",
    "diagram": "+-------------------------------------------------------------------------------+\n|                 SPREADSHEET (EXCEL) VS RELATIONAL DATABASE (MYSQL)            |\n+-------------------------------------------------------------------------------+\n  SPREADSHEETS (EXCEL / SHEETS):\n  - Limit: ~1,048,576 rows max before freezing.\n  - Concurrency: Multiple users editing causes sync collisions & data loss.\n  - Integrity: Anyone can type \"twenty\" into a numeric price cell.\n\n  RELATIONAL DATABASE (MYSQL 8.0):\n  - Scale: Handles millions to billions of rows with B+ Tree indexes.\n  - Concurrency: Row-level locking & ACID transactions (thousands of edits/sec).\n  - Integrity: Strict column data types & constraints prevent bad data.\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "A database is an optimized engine designed for massive scale, multi-user concurrency, and strict data integrity.",
      "Every table must have a Primary Key that uniquely identifies each row (like a passport number or national ID).",
      "SQL is declarative: you describe what records you want to retrieve, and the database engine optimizes the execution path."
    ],
    "cloudCaseStudy": {
      "title": "Tabular Storage Architecture in Production Systems",
      "source": "MySQL 8.0 InnoDB Storage Engine",
      "table": "customers & orders",
      "description": "Production e-commerce systems decouple customer identities from their transaction histories using relational tables, ensuring customer profiles are never duplicated across millions of individual orders."
    },
    "codeTitle": "Inspect Sample Relational Records in MySQL",
    "code": "-- Inspect the first 5 records in the customers table\nSELECT customer_id, full_name, email, country, created_at \nFROM customers \nLIMIT 5;",
    "codeExplanation": "The SELECT statement projects specific columns (customer_id, full_name, email, country, created_at) from the base table 'customers'. The LIMIT 5 clause instructs MySQL to return only the first 5 matching rows, preventing network and memory overhead.",
    "pitfalls": "Never run unconstrained 'SELECT * FROM table' on production tables with millions of rows. Always specify explicit column names and utilize LIMIT during initial exploration.",
    "exercise": "Examine the `customers` table in the SQL Playground. Write a query to retrieve only the `customer_id`, `full_name`, and `country` for the first 10 customers.",
    "solution": "-- Chapter 1 Solution: Reading specific columns with LIMIT\nSELECT customer_id, full_name, country \nFROM customers \nLIMIT 10;",
    "quiz": {
      "question": "What is the primary purpose of a Primary Key in a relational database table?",
      "options": [
        "It uniquely identifies each row in the table and guarantees no duplicates exist",
        "It encrypts the table so unauthorized users cannot read it",
        "It automatically converts text columns into numeric data types",
        "It limits the table to a maximum of 1,000 rows"
      ],
      "answer": 0,
      "explanation": "A Primary Key uniquely identifies every record in a table, ensuring no two rows can have duplicate identification values and that every record can be referenced unambiguously."
    }
  },
  "2": {
    "chapter": 2,
    "month": 1,
    "week": 2,
    "title": "Chapter 2: The Modern Cloud Big Data Ecosystem & Containers (AWS S3, BigQuery, Hugging Face)",
    "badge": "Cloud Storage & Ecosystem",
    "cloudDataset": "AWS S3 Public Buckets \u2022 Google Cloud BigQuery \u2022 Hugging Face Hub",
    "time": "50 min study",
    "overview": "Learn where massive real-world datasets live in the modern cloud, why companies use Amazon S3 buckets, Google Cloud BigQuery, and Hugging Face Hub, and how Parquet and CSV container formats work.",
    "content": "When data grows to millions or billions of rows (hundreds of gigabytes or terabytes), it cannot live on a single developer's laptop. It lives in **Cloud Storage Containers**.\n\n### 1. Where Does Big Data Live in the Cloud?\nMajor technology companies and research institutions host open datasets across three primary cloud ecosystems:\n1. **Amazon Web Services (AWS) Open Data Registry (Amazon S3)**:\n   - **NYC Taxi & Limousine Commission**: Hundreds of millions of taxi trips (`s3://nyc-tlc/trip data/`).\n   - **Amazon Customer Reviews**: 130+ million real product reviews across 20+ years (`s3://amazon-reviews-pds/tsv/`).\n   - **Common Crawl**: Petabytes of raw internet web scrapes (`s3://commoncrawl/`).\n2. **Google Cloud Public Datasets (BigQuery)**:\n   - **GitHub Public Archive**: Every commit, pull request, and issue in open-source history (`bigquery-public-data.github_repos`).\n   - **Stack Overflow Public Dataset**: Every programming question, answer, and vote since 2008 (`bigquery-public-data.stackoverflow`).\n   - **Bitcoin & Ethereum Blockchain**: The complete public ledger of every cryptocurrency transaction ever mined (`bigquery-public-data.crypto_bitcoin`).\n3. **Hugging Face Hub**:\n   - **FineWeb & RedPajama**: 15+ trillion tokens (44+ Terabytes) of curated text used for training state-of-the-art Large Language Models (`HuggingFaceFW/fineweb`).\n\n### 2. What is an AWS S3 Bucket?\nAmazon Simple Storage Service (S3) is an **Object Store**. Unlike a traditional file system with nested folders on a hard drive, S3 stores files as \"objects\" identified by a unique URI:\n- URI format: `s3://[bucket-name]/[path]/[filename]`\n- Example: `s3://nyc-tlc/trip data/yellow_tripdata_2024-01.parquet`\nS3 is infinitely scalable, highly durable (99.999999999% durability), and allows public anonymous reads for Open Data buckets.\n\n### 3. File Formats: CSV vs. Parquet\nCloud datasets are stored in two primary formats:\n- **CSV / TSV (Comma / Tab Separated Values)**: Plain text. Human-readable in any text editor, but very large and slow to query because every single character must be parsed row-by-row.\n- **Apache Parquet**: A binary, compressed, **columnar storage format**. In Parquet, values for the same column are stored together on disk. If your SQL query only asks for `fare_amount`, the engine reads ONLY the fare column from disk, skipping 90% of the file!",
    "diagram": "+-------------------------------------------------------------------------------+\n|                 MULTI-CLOUD BIG DATA OBJECT STORAGE ECOSYSTEM                 |\n+-------------------------------------------------------------------------------+\n  [AWS S3 Open Data]      -> NYC Taxi (Billions of trips), Amazon 130M+ Reviews\n  [Google BigQuery]       -> GitHub Repos (Commit DAGs), Stack Overflow (All Q&As)\n  [Hugging Face Hub]      -> FineWeb / RedPajama (15T+ Tokens LLM Data)\n          \u2502\n          \u25bc\n  [Ingestion Pipe]        -> aws s3 cp --no-sign-request / curl / Python Connector\n          \u2502\n          \u25bc\n  [MySQL 8 Engine]        -> Ingest via LOAD DATA LOCAL INFILE -> Query with SQL\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Cloud datasets live in scalable object stores like Amazon S3 and Google Cloud BigQuery.",
      "Public Open Data buckets can be read anonymously without needing an AWS account or API key.",
      "Parquet stores data in columns rather than rows, reducing cloud storage and I/O query costs by up to 90%."
    ],
    "cloudCaseStudy": {
      "title": "AWS S3 Open Data Registry Ingestion",
      "source": "s3://nyc-tlc/trip data/ (AWS Public Bucket)",
      "table": "nyc_taxi_trips",
      "description": "The NYC Taxi and Limousine Commission publishes monthly yellow and green taxi records to public S3 buckets. Data engineers stream these chunks into relational databases for urban transit and surge-pricing analysis."
    },
    "codeTitle": "Inspect Multi-Cloud Dataset Catalog in MySQL",
    "code": "-- Query the metadata of available cloud public datasets\nSELECT dataset_id, dataset_name, cloud_provider, format, record_count, compression \nFROM cloud_datasets \nORDER BY record_count DESC;",
    "codeExplanation": "This query retrieves the catalog of 8 multi-cloud public datasets configured in the MySQL Pro kit, sorting them by total record count so developers can immediately see dataset scales from AWS, Google Cloud, and Hugging Face.",
    "pitfalls": "Never download petabyte-scale cloud buckets in full onto your local drive. Always download targeted monthly sample chunks (e.g. 100,000 rows) for local development and analysis.",
    "exercise": "Identify the difference between CSV and Parquet storage formats. In which scenario is Parquet significantly faster than CSV?",
    "solution": "-- Parquet is a columnar binary format.\n-- When running analytical queries that project only a few columns (e.g., SELECT AVG(fare_amount) FROM trips),\n-- Parquet reads ONLY the requested column pages, reducing disk I/O and query time by up to 90% compared to row-based CSV.",
    "quiz": {
      "question": "Why is Apache Parquet preferred over CSV for petabyte-scale cloud analytical datasets?",
      "options": [
        "Parquet is columnar and compressed, allowing queries to read only the specific columns needed",
        "CSV files cannot be opened on Mac or Linux operating systems",
        "Parquet files can only hold a maximum of 1,000 rows",
        "CSV does not support numbers with decimal points"
      ],
      "answer": 0,
      "explanation": "Parquet is a columnar binary format that organizes data by columns instead of rows. When querying specific columns, the engine skips unneeded columns completely on disk."
    }
  },
  "3": {
    "chapter": 3,
    "month": 1,
    "week": 3,
    "title": "Chapter 3: Fetching Data from Cloud Containers (Hands-On Connection Guide)",
    "badge": "Hands-On Cloud Connection",
    "cloudDataset": "AWS CLI \u2022 curl \u2022 Python Cloud Connector Script",
    "time": "50 min study",
    "overview": "Learn the exact step-by-step commands to fetch real data chunks directly from public AWS S3 buckets, Google Cloud mirrors, and Hugging Face Hub without requiring an account or credit card.",
    "content": "The biggest hurdle for beginners is usually: *'How do I actually get the cloud data onto my computer without paying or signing up for cloud accounts?'*\n\nThe answer is **anonymous, unauthenticated access** provided by cloud providers for open public research.\n\n### 1. Fetching from AWS S3 Using the AWS CLI\nThe AWS Command Line Interface allows you to interact with S3. The secret trick for beginners is the `--no-sign-request` flag, which instructs AWS to bypass credentials:\n\n```bash\n# 1. List files inside the public NYC Taxi S3 bucket:\naws s3 ls s3://nyc-tlc/trip\\ data/ --no-sign-request\n\n# 2. Download a real monthly yellow taxi parquet file (~50 MB):\naws s3 cp s3://nyc-tlc/trip\\ data/yellow_tripdata_2024-01.parquet ./data/ --no-sign-request\n\n# 3. Download Amazon Customer Reviews (Wireless Category TSV):\naws s3 cp s3://amazon-reviews-pds/tsv/amazon_reviews_us_Wireless_v1_00.tsv.gz ./data/ --no-sign-request\n```\n\n### 2. Fetching via Direct HTTPS (curl or wget)\nIf you do not have the AWS CLI installed, public cloud buckets often have CloudFront CDN mirrors accessible via standard web requests:\n\n```bash\n# Download NYC Taxi trip data directly using curl:\ncurl -O https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet\n```\n\n### 3. Fetching from Hugging Face Hub (FineWeb LLM Tokens)\nHugging Face datasets can be downloaded using the `huggingface-cli` or via Python's `huggingface_hub` package:\n\n```bash\npip install huggingface_hub\npython3 -c \"from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='HuggingFaceFW/fineweb', filename='sample/10BT/000_00000.parquet', repo_type='dataset', local_dir='./data/')\"\n```\n\n### 4. The All-in-One MySQL Pro Python Connector\nTo make cloud ingestion effortless, this repository includes a master connector script:\n\n```bash\n# List all 8 cloud datasets in the master catalog:\npython3 01-datasets/cloud_public_datasets_connector.py --list\n\n# Download real sample chunks from AWS, GCP, or Hugging Face:\npython3 01-datasets/cloud_public_datasets_connector.py --fetch nyc_taxi\npython3 01-datasets/cloud_public_datasets_connector.py --fetch amazon_reviews\npython3 01-datasets/cloud_public_datasets_connector.py --fetch stack_overflow\n```",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       CLOUD DATA DOWNLOAD PIPELINE                            |\n+-------------------------------------------------------------------------------+\n  [AWS S3 Bucket]        -> s3://nyc-tlc/trip data/yellow_tripdata_2024-01.parquet\n         \u2502\n         \u2502 (aws s3 cp ... --no-sign-request)\n         \u25bc\n  [Local Staging Dir]    -> ./01-datasets/staging/nyc_taxi_sample.csv\n         \u2502\n         \u2502 (LOAD DATA LOCAL INFILE)\n         \u25bc\n  [MySQL 8 Engine]       -> nyc_taxi_trips table (ready for high-speed SQL queries)\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "The `--no-sign-request` flag allows you to download public AWS S3 data without an AWS account or API key.",
      "Datasets can be retrieved via AWS CLI, direct curl HTTP mirrors, or the repo's master Python connector.",
      "Once downloaded to a local staging directory, datasets can be ingested into MySQL in milliseconds."
    ],
    "cloudCaseStudy": {
      "title": "Amazon Customer Reviews Open Dataset",
      "source": "s3://amazon-reviews-pds/tsv/ (AWS Open Data)",
      "table": "amazon_reviews",
      "description": "Containing over 130 million customer reviews from 1995 to 2015, this dataset is stored in tab-separated gzip archives on Amazon S3 and is used worldwide for recommendation modeling and sentiment analysis."
    },
    "codeTitle": "Inspect Sample Amazon Reviews Ingested in MySQL",
    "code": "-- Inspect real sample Amazon reviews loaded from S3\nSELECT review_id, product_title, star_rating, helpful_votes, total_votes \nFROM amazon_reviews \nORDER BY helpful_votes DESC \nLIMIT 5;",
    "codeExplanation": "Queries customer reviews imported from the Amazon Customer Reviews dataset, ordering by helpful_votes descending to identify the most impactful community feedback.",
    "pitfalls": "Large TSV files from S3 are frequently gzip compressed (.gz). Always ensure you either decompress them first or configure your ingestion pipeline to stream through zcat.",
    "exercise": "What flag must you provide to the AWS CLI to download public open data from S3 without entering credentials?",
    "solution": "-- The required flag is:\n-- --no-sign-request\n-- Example: aws s3 cp s3://nyc-tlc/trip\\ data/yellow_tripdata_2024-01.parquet . --no-sign-request",
    "quiz": {
      "question": "What is the purpose of the '--no-sign-request' flag when using the AWS CLI?",
      "options": [
        "It tells the CLI to bypass authentication and access public buckets anonymously without an AWS account",
        "It automatically encrypts the downloaded file with a password",
        "It skips downloading any rows that contain NULL values",
        "It converts Parquet files into Microsoft Excel spreadsheets"
      ],
      "answer": 0,
      "explanation": "The '--no-sign-request' flag instructs the AWS CLI not to sign HTTP requests with AWS credentials, enabling direct unauthenticated access to public S3 buckets."
    }
  },
  "4": {
    "chapter": 4,
    "month": 1,
    "week": 4,
    "title": "Chapter 4: Designing the Table Blueprint (DDL & Data Types)",
    "badge": "Database Design & Schemas",
    "cloudDataset": "MySQL 8.0 DDL \u2022 Schema Engineering",
    "time": "55 min study",
    "overview": "Master Data Definition Language (DDL): create robust schemas using CREATE TABLE, choose the right numeric, string, and temporal data types, and enforce data integrity with PRIMARY KEY, NOT NULL, and CHECK constraints.",
    "content": "Before you can load a single row from an AWS S3 bucket or CSV file, MySQL needs a strict **Blueprint** called a **Table Schema**.\n\n### 1. Creating and Dropping Tables\nIn SQL, schemas are built using **DDL (Data Definition Language)**:\n- `CREATE TABLE [table_name] (...)`: Creates a new table structure.\n- `DROP TABLE IF EXISTS [table_name]`: Safely deletes a table if it already exists, avoiding errors when re-running initialization scripts.\n\n### 2. Choosing the Right Data Types\nChoosing the wrong data type leads to wasted disk storage, slow queries, and arithmetic rounding bugs. Here is the golden guide:\n\n#### A. Numeric Types:\n- `TINYINT`: 1 byte (-128 to 127). Perfect for status flags (0 = pending, 1 = completed) or ratings (1 to 5 stars).\n- `INT`: 4 bytes (-2.14 billion to +2.14 billion). The standard choice for IDs and row counts.\n- `BIGINT`: 8 bytes. Used for identifiers in massive tables (like cryptocurrency wei or taxi trip counters exceeding 2 billion).\n- `DECIMAL(M, D)`: Exact fixed-point numeric. `M` is total digits, `D` is decimal places. **ALWAYS use `DECIMAL(10,2)` for money!** Never use `FLOAT` or `DOUBLE` for financial amounts, because floating-point binary math creates rounding errors (e.g. $0.1 + 0.2 = 0.30000000000000004$).\n\n#### B. Character / String Types:\n- `VARCHAR(N)`: Variable-length string up to $N$ characters. If you store \"NYC\" in a `VARCHAR(50)`, it only consumes 3 bytes of data plus 1 byte of length overhead.\n- `TEXT`: Used for long, unbounded descriptions or blog post bodies.\n\n#### C. Temporal (Date & Time) Types:\n- `DATE`: Stores date only (`YYYY-MM-DD`).\n- `DATETIME`: Stores date and time (`YYYY-MM-DD HH:MM:SS`).\n- `TIMESTAMP`: Stores UTC timestamp and automatically adjusts to the server's time zone.\n\n### 3. Constraints: Enforcing Business Rules\nConstraints prevent corrupt data from ever entering your database:\n- `PRIMARY KEY`: Guarantees every row has a unique identifier and automatically creates a clustered B+ Tree index.\n- `NOT NULL`: Rejects any attempt to insert an empty/missing value.\n- `DEFAULT [val]`: Automatically supplies a value if none is provided.\n- `CHECK (expression)`: Rejects rows that violate a logical condition (e.g., `CHECK (base_price > 0)`).",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       TABLE SCHEMA BLUEPRINT ARCHITECTURE                     |\n+-------------------------------------------------------------------------------+\n  CREATE TABLE products (\n    product_id   INT PRIMARY KEY,              <- Unique row identifier (B+ Tree)\n    name         VARCHAR(100) NOT NULL,        <- Variable text (1 to 100 chars)\n    category     VARCHAR(50) NOT NULL,         <- Product bucket\n    base_price   DECIMAL(10,2) NOT NULL,       <- Exact currency (No float drift!)\n    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP, <- Auto timestamp\n    CONSTRAINT chk_price CHECK (base_price > 0) <- Rejects negative prices\n  );\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Always use `DECIMAL(10,2)` for currency and money\u2014never use FLOAT or DOUBLE due to rounding drift.",
      "Every table should declare a PRIMARY KEY to guarantee unique identity and fast row lookup.",
      "CHECK constraints enforce domain invariants at the engine level, preventing bad data from entering the database."
    ],
    "cloudCaseStudy": {
      "title": "NYC Taxi Trip Record Schema Design",
      "source": "NYC TLC Yellow Taxi Schema",
      "table": "nyc_taxi_trips",
      "description": "Taxi trip records capture pickup and dropoff datetimes, passenger counts (TINYINT), trip distance (DECIMAL), and fare totals (DECIMAL). Strict typing ensures fare computations reconcile with credit card merchant accounts."
    },
    "codeTitle": "Create an E-Commerce Products Table Schema",
    "code": "-- Create a robust products schema with primary key and price check\nCREATE TABLE IF NOT EXISTS demo_products (\n    product_id   INT PRIMARY KEY,\n    name         VARCHAR(100) NOT NULL,\n    category     VARCHAR(50) NOT NULL,\n    base_price   DECIMAL(10,2) NOT NULL,\n    created_at   DATETIME DEFAULT '2024-01-01 00:00:00',\n    CHECK (base_price > 0)\n);\n\n-- Insert sample records\nINSERT INTO demo_products (product_id, name, category, base_price) VALUES\n(1, 'Cloud Data Engineering Handbook', 'Books', 49.99),\n(2, 'Mechanical Ergonomic Keyboard', 'Hardware', 129.50);\n\n-- Query the created schema\nSELECT * FROM demo_products;",
    "codeExplanation": "Demonstrates DDL creation of a table with proper data types (INT, VARCHAR, DECIMAL, DATETIME), enforces a CHECK constraint ensuring prices are positive, inserts sample rows, and queries the result.",
    "pitfalls": "Using FLOAT or DOUBLE for financial transactions causes pennies to vanish due to IEEE-754 binary floating-point representation. Always declare monetary amounts as DECIMAL(10,2).",
    "exercise": "Write a `CREATE TABLE` statement for a `taxi_trips` table containing `trip_id` (Primary Key), `pickup_time` (DATETIME), `passenger_count` (TINYINT), and `total_fare` (DECIMAL with 2 decimal places).",
    "solution": "-- Chapter 4 Solution: Designing the taxi_trips schema\nCREATE TABLE IF NOT EXISTS taxi_trips (\n    trip_id         BIGINT PRIMARY KEY,\n    pickup_time     DATETIME NOT NULL,\n    passenger_count TINYINT NOT NULL DEFAULT 1,\n    total_fare      DECIMAL(10,2) NOT NULL CHECK (total_fare >= 0)\n);",
    "quiz": {
      "question": "Which data type should you ALWAYS use to store financial monetary amounts in MySQL?",
      "options": [
        "DECIMAL(10,2) \u2014 because it stores exact fixed-point numbers with zero rounding drift",
        "FLOAT \u2014 because it is faster and allows infinite decimals",
        "VARCHAR(20) \u2014 because numbers should be stored as plain text",
        "TINYINT \u2014 because money never exceeds 100 dollars"
      ],
      "answer": 0,
      "explanation": "DECIMAL stores exact fixed-point numbers with strict precision. FLOAT and DOUBLE use binary floating-point math which introduces tiny rounding discrepancies that corrupt financial ledgers."
    }
  },
  "5": {
    "chapter": 5,
    "month": 2,
    "week": 5,
    "title": "Chapter 5: Blazing-Fast Ingestion: Loading Cloud Data into MySQL",
    "badge": "Bulk Ingestion & LOAD DATA",
    "cloudDataset": "High-Speed CSV / TSV Cloud File Loading",
    "time": "50 min study",
    "overview": "Learn how production database engineers ingest millions of rows from cloud containers in seconds using LOAD DATA LOCAL INFILE instead of slow line-by-line INSERT statements.",
    "content": "Imagine you just downloaded a 1-million row taxi trips CSV file from an AWS S3 bucket. If you write a Python script that runs `INSERT INTO taxi_trips VALUES (...)` in a loop, it will take over **4 hours** to complete!\n\nWhy? Because each individual `INSERT` sends a separate network packet, opens a transaction, locks rows, writes to the transaction log (redo log), and waits for disk confirmation.\n\n### 1. The Production Solution: LOAD DATA LOCAL INFILE\nMySQL provides a built-in bulk streaming command called `LOAD DATA LOCAL INFILE`. It reads raw CSV or TSV files directly from your hard drive, bypasses the SQL parser for each row, and writes memory pages in massive batches.\n- Speed: **100,000+ rows per second** (1 million rows loads in ~10 seconds!).\n\n### 2. Anatomy of the LOAD DATA Command\n```sql\nLOAD DATA LOCAL INFILE '/path/to/yellow_tripdata.csv'\nINTO TABLE nyc_taxi_trips\nFIELDS TERMINATED BY ','\nENCLOSED BY '\"'\nLINES TERMINATED BY '\\n'\nIGNORE 1 ROWS\n(trip_id, pickup_datetime, dropoff_datetime, passenger_count, trip_distance, total_amount);\n```\n\nLet's break down each clause:\n1. `FIELDS TERMINATED BY ','`: Tells MySQL that columns are separated by commas (use `'\\t'` for tab-separated TSV files like Amazon Reviews).\n2. `ENCLOSED BY '\"'`: Handles fields that have quotes around them (e.g., `\"New York, NY\"` where the comma inside the city name should not be treated as a column separator).\n3. `LINES TERMINATED BY '\\n'`: Tells MySQL where each row ends.\n4. `IGNORE 1 ROWS`: Skips the very first header line of the CSV (`id,name,price...`) so it doesn't get inserted as invalid data!\n5. Column list `(...)`: Explicitly maps CSV columns to your table's columns.\n\n### 3. Handling Date Mismatches with Variables\nSometimes a CSV file has dates formatted as `MM/DD/YYYY`, but MySQL requires `YYYY-MM-DD`. You can load the raw string into a temporary variable `@date_str` and transform it on the fly:\n\n```sql\nLOAD DATA LOCAL INFILE 'orders.csv'\nINTO TABLE orders\nFIELDS TERMINATED BY ','\nIGNORE 1 ROWS\n(order_id, customer_id, @date_str, total_amount)\nSET order_date = STR_TO_DATE(@date_str, '%m/%d/%Y');\n```",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       HIGH-SPEED BULK INGESTION PIPELINE                      |\n+-------------------------------------------------------------------------------+\n  Line-by-Line INSERT INTO:\n  [Row 1] -> Network Round-Trip -> Parser -> Log Flush -> Disk Commit (100 rows/s)\n  [Row 2] -> Network Round-Trip -> Parser -> Log Flush -> Disk Commit (Slow!)\n\n  LOAD DATA LOCAL INFILE:\n  [CSV on Disk] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550> [Streaming Buffer] \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550> [InnoDB Buffer Pool]\n                             (100,000+ rows/sec direct batch page write!)\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "`LOAD DATA LOCAL INFILE` is 50x to 100x faster than running individual INSERT statements.",
      "Always use `IGNORE 1 ROWS` to prevent CSV column headers from being inserted as corrupt data rows.",
      "Delimiters (`FIELDS TERMINATED BY` and `ENCLOSED BY`) ensure commas inside quoted text don't split columns."
    ],
    "cloudCaseStudy": {
      "title": "Bulk Ingesting Amazon Reviews TSV Data",
      "source": "s3://amazon-reviews-pds/tsv/",
      "table": "amazon_reviews",
      "description": "Amazon customer review datasets use tab delimiters ('\\t') rather than commas because review text naturally contains commas. Bulk loading with FIELDS TERMINATED BY '\\t' imports millions of reviews without parsing collisions."
    },
    "codeTitle": "Inspect Loaded Cloud Datasets and Row Counts",
    "code": "-- Inspect record counts across our ingested cloud tables\nSELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers\nUNION ALL\nSELECT 'orders' AS table_name, COUNT(*) AS row_count FROM orders\nUNION ALL\nSELECT 'products' AS table_name, COUNT(*) AS row_count FROM products\nUNION ALL\nSELECT 'cloud_datasets' AS table_name, COUNT(*) AS row_count FROM cloud_datasets;",
    "codeExplanation": "Uses UNION ALL to combine record counts across 4 core tables in the database, verifying that data ingestion has populated the relational tables for querying.",
    "pitfalls": "Forgetting 'IGNORE 1 ROWS' will attempt to insert column header strings like 'price' into numeric columns, throwing a data truncation or type mismatch error.",
    "exercise": "What does the `IGNORE 1 ROWS` clause do in a `LOAD DATA` statement, and what error occurs if you omit it when importing a CSV with headers?",
    "solution": "-- 'IGNORE 1 ROWS' skips the first line of the file (the header containing column names).\n-- If omitted, MySQL attempts to parse text strings like 'total_fare' into numeric columns,\n-- resulting in an 'Incorrect decimal value' or 'Data truncation' error.",
    "quiz": {
      "question": "Why is 'LOAD DATA LOCAL INFILE' preferred over individual 'INSERT INTO' statements for importing large CSV datasets?",
      "options": [
        "It streams records in memory batches, bypassing per-row network roundtrips and parser overhead (100x faster)",
        "It automatically translates foreign languages in review text to English",
        "It encrypts the CSV file and deletes it from disk immediately",
        "It can only load a maximum of 10 rows at a time"
      ],
      "answer": 0,
      "explanation": "LOAD DATA LOCAL INFILE streams data in large memory blocks directly into InnoDB pages, bypassing individual SQL parsing and transaction overhead for each row."
    }
  },
  "6": {
    "chapter": 6,
    "month": 2,
    "week": 6,
    "title": "Chapter 6: Reading & Projecting Data (SELECT, LIMIT, ORDER BY)",
    "badge": "Query Fundamentals & Projection",
    "cloudDataset": "E-Commerce & NYC Taxi Relational Records",
    "time": "50 min study",
    "overview": "Master foundational data retrieval: project specific columns, understand why SELECT * is dangerous in production, implement safe row pagination with LIMIT and OFFSET, and sort records with ORDER BY.",
    "content": "Now that our tables are populated with data from our cloud containers, we are ready to write our first SQL queries!\n\n### 1. The SELECT and FROM Clauses\nThe most fundamental command in SQL is:\n```sql\nSELECT column_a, column_b \nFROM table_name;\n```\n- **Projection**: Specifying *which* columns you want back.\n- **Source**: Specifying *which* table contains the data via `FROM`.\n\n### 2. Why `SELECT *` is a Dangerous Production Anti-Pattern\nBeginners often write `SELECT * FROM table;` (`*` means \"give me all columns\"). While acceptable in small homework exercises, **never run `SELECT *` in production!**\n- If a table has 50 columns (including heavy text and binary fields), `SELECT *` forces MySQL to read every byte from disk, wasting RAM and saturating network bandwidth.\n- Always name the explicit columns you actually need:\n  `SELECT product_id, name, base_price FROM products;`\n\n### 3. Renaming Output with Aliases (`AS`)\nYou can give columns clearer, human-friendly names in your query output using the `AS` keyword:\n```sql\nSELECT name AS product_name, base_price AS retail_usd \nFROM products;\n```\n\n### 4. Safe Row Exploration with `LIMIT` and `OFFSET`\nWhen querying tables with millions of rows, returning everything at once will freeze your browser or crash your application server. Always cap the output using `LIMIT`:\n```sql\nSELECT product_id, name, base_price \nFROM products \nLIMIT 5;\n```\nTo implement pagination (e.g. Page 2 of a website showing 5 items per page), use `OFFSET`:\n```sql\nSELECT product_id, name, base_price \nFROM products \nLIMIT 5 OFFSET 5;  -- Skips first 5, returns next 5\n```\n\n### 5. Sorting Results with `ORDER BY`\nIn a relational database, **rows have no default physical order**. If you do not specify an `ORDER BY` clause, MySQL is free to return rows in any arbitrary order.\n- `ASC` (Ascending): Smallest to largest (1, 2, 3... or A to Z). This is the default.\n- `DESC` (Descending): Largest to smallest (100, 99, 98... or Z to A).\n\n```sql\n-- Top 5 most expensive products\nSELECT name, category, base_price \nFROM products \nORDER BY base_price DESC \nLIMIT 5;\n```",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       PROJECTION & PAGINATION VISUAL FLOW                     |\n+-------------------------------------------------------------------------------+\n  Base Table (1,000,000 Rows, 25 Columns):\n  [Row 1]   [Col 1] [Col 2] [Col 3] ... [Col 25]\n  [Row 2]   [Col 1] [Col 2] [Col 3] ... [Col 25]\n  ...\n            \u2502\n            \u25bc (SELECT name, base_price FROM products ORDER BY base_price DESC LIMIT 3)\n  Filtered Output (Only 2 Columns Projected, Top 3 Rows Returned):\n  1. Ergonomic Chair       | $299.99\n  2. UltraWide Monitor     | $249.00\n  3. Noise-Canceling Buds  | $149.99\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Avoid `SELECT *` in production; always project only the specific columns your application requires.",
      "Without an `ORDER BY` clause, row order is completely non-deterministic.",
      "Use `LIMIT` and `OFFSET` to implement clean, safe page-based pagination."
    ],
    "cloudCaseStudy": {
      "title": "NYC Taxi Trip Fare Sorting",
      "source": "s3://nyc-tlc/trip data/",
      "table": "nyc_taxi_trips",
      "description": "Transit analysts query the highest-fare taxi rides in Manhattan during snowstorms using ORDER BY total_amount DESC LIMIT 10 to inspect peak pricing surge multiples."
    },
    "codeTitle": "Retrieve Top Expensive Products with Explicit Projection",
    "code": "-- Retrieve top 5 most expensive products with custom column aliases\nSELECT product_id, name AS product_name, category, base_price AS price_usd \nFROM products \nORDER BY base_price DESC \nLIMIT 5;",
    "codeExplanation": "Projects 4 explicit columns from 'products', aliases two columns for presentation clarity, sorts by base_price descending, and caps output at 5 rows.",
    "pitfalls": "Assuming rows will always return in insertion order without an ORDER BY clause. MySQL storage engines make zero order guarantees without an explicit ORDER BY.",
    "exercise": "Write a query to retrieve the 3 cheapest products in the `products` table, showing only `name` and `base_price`.",
    "solution": "-- Chapter 6 Solution: Finding cheapest products with ASC order\nSELECT name, base_price \nFROM products \nORDER BY base_price ASC \nLIMIT 3;",
    "quiz": {
      "question": "Why is 'SELECT *' considered bad practice when querying production databases?",
      "options": [
        "It forces the engine to read and transmit all columns across the network, wasting RAM, disk I/O, and bandwidth",
        "It permanently deletes all columns except the first one",
        "It converts all numeric data into text strings",
        "It prevents the query from using the ORDER BY clause"
      ],
      "answer": 0,
      "explanation": "SELECT * fetches every single column from disk and transmits it across the network, causing massive unnecessary I/O overhead on wide tables."
    }
  },
  "7": {
    "chapter": 7,
    "month": 2,
    "week": 7,
    "title": "Chapter 7: Filtering Real Records: The WHERE Clause & Logic",
    "badge": "Record Filtering & Logic",
    "cloudDataset": "Stack Overflow Questions & E-Commerce Orders",
    "time": "55 min study",
    "overview": "Learn how to filter candidate records using WHERE: master comparison operators, pattern matching with LIKE, range and set filters with BETWEEN and IN, compound boolean logic, and the critical 3-valued NULL trap.",
    "content": "When working with million-row tables, you rarely want to inspect every single record. You want to filter for specific records: *'Show me orders over $200 placed in California'*.\n\nThis is the job of the **`WHERE`** clause.\n\n### 1. Comparison Operators\nThe `WHERE` clause evaluates an expression for every candidate row. If the expression is TRUE, the row survives; if FALSE or UNKNOWN, it is discarded:\n- `=` (Equal): `WHERE country = 'USA'`\n- `!=` or `<>` (Not Equal): `WHERE status != 'CANCELLED'`\n- `<`, `>`, `<=`, `>=` (Numeric Comparisons): `WHERE total_amount >= 150.00`\n\n### 2. Pattern Matching with `LIKE` and Wildcards\nWhen searching through text (like customer names or product titles), use `LIKE`:\n- `%` (Percent): Matches zero, one, or multiple characters.\n  `WHERE name LIKE 'Pro%'` (Starts with \"Pro\")\n  `WHERE email LIKE '%@gmail.com'` (Ends with \"@gmail.com\")\n  `WHERE name LIKE '%Air%'` (Contains \"Air\" anywhere)\n- `_` (Underscore): Matches exactly one single character.\n\n### 3. Range and Set Membership: `BETWEEN` and `IN`\n- **Range (`BETWEEN ... AND ...`)**:\n  ```sql\n  WHERE base_price BETWEEN 50.00 AND 200.00;\n  -- Equivalent to: base_price >= 50.00 AND base_price <= 200.00 (Inclusive!)\n  ```\n- **Set Membership (`IN`)**:\n  ```sql\n  WHERE country IN ('USA', 'Canada', 'Germany');\n  -- Equivalent to: country = 'USA' OR country = 'Canada' OR country = 'Germany'\n  ```\n\n### 4. Compound Boolean Logic: `AND`, `OR`, `NOT`\nYou can combine multiple criteria:\n- `AND`: Both conditions must be TRUE.\n- `OR`: At least one condition must be TRUE.\n- `NOT`: Inverts the condition.\n\n**The Parenthesis Trap**: In SQL, `AND` takes precedence over `OR`!\nLook at this query:\n```sql\nWHERE total_amount > 200 AND status = 'COMPLETED' OR status = 'DELIVERED'\n```\nBecause `AND` binds first, this will return *any* order with status 'DELIVERED', regardless of amount! Always use parentheses:\n```sql\nWHERE total_amount > 200 AND (status = 'COMPLETED' OR status = 'DELIVERED')\n```\n\n### 5. The Critical 3-Valued Logic of `NULL`\nIn SQL, `NULL` does NOT mean zero or empty string. **`NULL` means UNKNOWN / MISSING VALUE.**\nBecause `NULL` is unknown, the comparison `NULL = NULL` evaluates to `UNKNOWN` (falsy)!\n- **WRONG**: `WHERE email = NULL` (Returns 0 rows forever!)\n- **CORRECT**: `WHERE email IS NULL` or `WHERE email IS NOT NULL`",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       WHERE FILTERING LOGIC EVALUATION                        |\n+-------------------------------------------------------------------------------+\n  Candidate Row Stream:\n  [Order #1: Total $250, Status 'COMPLETED'] -> (250 > 200 AND 'COMPLETED') -> TRUE  (Kept)\n  [Order #2: Total $45,  Status 'COMPLETED'] -> (45 > 200)                  -> FALSE (Dropped)\n  [Order #3: Total NULL, Status 'PENDING']   -> (NULL > 200)                -> UNKNOWN (Dropped)\n\n  Golden Rule for NULL:\n  Never write: WHERE col = NULL\n  Always write: WHERE col IS NULL\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "In SQL, `AND` binds before `OR`; always use parentheses to make compound boolean logic unambiguous.",
      "`NULL` represents unknown data; never use `= NULL`, always use `IS NULL` or `IS NOT NULL`.",
      "`BETWEEN` is inclusive on both ends, and `IN (...)` simplifies long chains of `OR` statements."
    ],
    "cloudCaseStudy": {
      "title": "Stack Overflow Public Archive Tag Filtering",
      "source": "bigquery-public-data.stackoverflow",
      "table": "posts_questions",
      "description": "Developers filter hundreds of millions of Stack Overflow questions using WHERE score > 10 AND view_count >= 1000 AND tags LIKE '%<mysql>%' to isolate high-value answers for developer documentation."
    },
    "codeTitle": "Filter High-Value Completed Orders with Compound Logic",
    "code": "-- Filter high-value completed orders with compound boolean conditions\nSELECT order_id, customer_id, order_date, total_amount, status \nFROM orders \nWHERE total_amount > 100.00 \n  AND (status = 'COMPLETED' OR status = 'DELIVERED')\nORDER BY total_amount DESC;",
    "codeExplanation": "Applies a numeric comparison (total_amount > 100.00) combined with a grouped OR condition for status, sorting the surviving matching orders from largest to smallest.",
    "pitfalls": "Writing 'WHERE col = NULL'. In relational SQL, comparing anything to NULL with '=' evaluates to UNKNOWN, returning zero results. Always use 'IS NULL'.",
    "exercise": "Write a query to find all products in `products` that belong to either 'Electronics' or 'Hardware' and have a `base_price` under $100.",
    "solution": "-- Chapter 7 Solution: Set filtering with IN and price comparison\nSELECT product_id, name, category, base_price \nFROM products \nWHERE category IN ('Electronics', 'Hardware') \n  AND base_price < 100.00;",
    "quiz": {
      "question": "What is the result of running the query: 'SELECT * FROM customers WHERE email = NULL'?",
      "options": [
        "It returns zero rows, because comparing anything to NULL with '=' yields UNKNOWN (you must use IS NULL)",
        "It returns all customers whose email is empty",
        "It throws a syntax error because NULL cannot be used in WHERE",
        "It returns all customers with invalid email formats"
      ],
      "answer": 0,
      "explanation": "In SQL, NULL represents missing/unknown data. Comparisons like 'email = NULL' evaluate to UNKNOWN, which evaluates as false in a WHERE clause. You must use 'IS NULL'."
    }
  },
  "8": {
    "chapter": 8,
    "month": 2,
    "week": 8,
    "title": "Chapter 8: Data Summarization: Aggregate Functions & GROUP BY",
    "badge": "Aggregations & Summaries",
    "cloudDataset": "Amazon 130M+ Reviews & NYC Taxi Zones",
    "time": "55 min study",
    "overview": "Master big data summarization: compute metrics across millions of rows using COUNT, SUM, AVG, MIN, and MAX, bucket data into categories with GROUP BY, and understand the critical difference between WHERE and HAVING.",
    "content": "Up until now, our queries have returned individual rows. But the real power of SQL is **Data Summarization**\u2014condensing millions of raw cloud records into executive business insights.\n\n### 1. The 5 Core Aggregate Functions\nAggregate functions take a collection of values across many rows and compute a single summary metric:\n1. `COUNT(*)`: Counts the total number of rows (including NULLs).\n   `COUNT(column)`: Counts only rows where `column` is NOT NULL.\n2. `SUM(column)`: Calculates the mathematical sum of numeric values.\n3. `AVG(column)`: Computes the arithmetic mean (`SUM / COUNT`).\n4. `MIN(column)`: Finds the minimum (lowest) value.\n5. `MAX(column)`: Finds the maximum (highest) value.\n\n```sql\nSELECT \n    COUNT(*) AS total_orders,\n    SUM(total_amount) AS total_revenue,\n    ROUND(AVG(total_amount), 2) AS avg_order_value,\n    MIN(total_amount) AS smallest_order,\n    MAX(total_amount) AS largest_order\nFROM orders;\n```\n\n### 2. Grouping Rows with `GROUP BY`\nInstead of calculating one grand total for the whole table, what if you want metrics broken down by category, city, or status?\n\nThat is what **`GROUP BY`** does. It buckets rows sharing the same value into discrete groups, then runs the aggregate function on each group:\n\n```sql\nSELECT category, COUNT(*) AS product_count, ROUND(AVG(base_price), 2) AS avg_price\nFROM products\nGROUP BY category;\n```\n\n**The Cardinal Rule of `GROUP BY`**:\nEvery column that appears in your `SELECT` list MUST either:\n1. Appear in the `GROUP BY` clause, OR\n2. Be wrapped inside an aggregate function (`SUM`, `AVG`, `COUNT`...)\nIf you try to select a raw non-aggregated column without grouping by it, MySQL 8 will reject the query under `ONLY_FULL_GROUP_BY` mode!\n\n### 3. The Grand Showdown: `WHERE` vs. `HAVING`\nThis is the single most tested question in technical SQL interviews:\n- **`WHERE`**: Filters individual candidate rows **BEFORE** aggregation happens. Cannot use aggregate functions!\n- **`HAVING`**: Filters summarized group buckets **AFTER** aggregation happens. Used to filter on `COUNT()`, `AVG()`, etc.\n\n```sql\nSELECT category, COUNT(*) AS items, AVG(base_price) AS avg_price\nFROM products\nWHERE base_price > 20.00         -- Step 1: Filter out cheap items BEFORE grouping\nGROUP BY category               -- Step 2: Group surviving items\nHAVING COUNT(*) >= 2;           -- Step 3: Filter groups with at least 2 items\n```",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       AGGREGATION & GROUPING PIPELINE                         |\n+-------------------------------------------------------------------------------+\n  Raw Rows:\n  (Shoes, $50), (Shoes, $90), (Shoes, $10), (Hat, $25), (Hat, $15)\n        \u2502\n        \u25bc  [WHERE price > 20]  (Filters individual rows BEFORE grouping)\n  (Shoes, $50), (Shoes, $90), (Hat, $25)\n        \u2502\n        \u25bc  [GROUP BY category] (Buckets rows into distinct groups)\n  [Shoes Group]: ($50, $90) -> COUNT=2, AVG=$70\n  [Hat Group]:   ($25)      -> COUNT=1, AVG=$25\n        \u2502\n        \u25bc  [HAVING COUNT(*) >= 2] (Filters summary groups AFTER aggregation)\n  Final Output:\n  Shoes | 2 items | $70.00 average price\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Use aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) to calculate summary metrics across rows.",
      "Every non-aggregated column in `SELECT` must appear in the `GROUP BY` clause.",
      "`WHERE` filters individual rows before grouping; `HAVING` filters aggregated groups after grouping."
    ],
    "cloudCaseStudy": {
      "title": "Amazon Reviews Product Category Rating Aggregations",
      "source": "s3://amazon-reviews-pds/tsv/",
      "table": "amazon_reviews",
      "description": "Analytics platforms summarize 130 million product reviews by grouping on product_category and computing COUNT(review_id) and AVG(star_rating) to detect trending consumer product quality shifts."
    },
    "codeTitle": "Summarize Orders Revenue and Metrics by Status",
    "code": "-- Compute count, total revenue, and average order value grouped by status\nSELECT \n    status,\n    COUNT(*) AS total_orders,\n    SUM(total_amount) AS total_revenue,\n    ROUND(AVG(total_amount), 2) AS avg_order_amount,\n    MAX(total_amount) AS peak_order\nFROM orders\nGROUP BY status\nHAVING COUNT(*) >= 1\nORDER BY total_revenue DESC;",
    "codeExplanation": "Buckets orders by status, computes 4 aggregate metrics per status bucket, applies a HAVING clause to verify group size, and sorts by total revenue descending.",
    "pitfalls": "Attempting to use an aggregate function like 'WHERE COUNT(*) > 5'. Aggregate functions cannot be evaluated in WHERE because rows have not been grouped yet. Use HAVING.",
    "exercise": "Write a query grouping the `products` table by `category`, calculating the total count of products and the average price for each category, ordered by average price descending.",
    "solution": "-- Chapter 8 Solution: Category aggregations with GROUP BY\nSELECT category, COUNT(*) AS product_count, ROUND(AVG(base_price), 2) AS avg_price \nFROM products \nGROUP BY category \nORDER BY avg_price DESC;",
    "quiz": {
      "question": "What is the fundamental difference between the WHERE clause and the HAVING clause?",
      "options": [
        "WHERE filters individual rows before grouping occurs; HAVING filters aggregated groups after grouping occurs",
        "WHERE only works on text columns, while HAVING only works on numbers",
        "HAVING is an older SQL keyword that has been deprecated in MySQL 8.0",
        "There is no difference; they can be used interchangeably anywhere in a query"
      ],
      "answer": 0,
      "explanation": "WHERE filters candidate rows before GROUP BY aggregation takes place. HAVING evaluates after GROUP BY and can filter based on aggregate function outputs like COUNT() or AVG()."
    }
  },
  "9": {
    "chapter": 9,
    "month": 3,
    "week": 9,
    "title": "Chapter 9: Combining Datasets: Relational Joins & Engine Pipeline",
    "badge": "Joins & Engine Execution Order",
    "cloudDataset": "Customers, Orders & GitHub Repo Fork DAGs",
    "time": "60 min study",
    "overview": "Learn why databases normalize data across multiple tables, master INNER JOIN and LEFT JOIN to combine records, understand Self-Joins, and memorize the 10-step internal query execution sequence.",
    "content": "In real-world applications, data is never stored in one giant table. Storing customer names, emails, order dates, and shipping addresses in a single table causes massive data redundancy.\n\nInstead, databases use **Normalization**:\n- `customers` table stores customer profiles once.\n- `orders` table stores order amounts, referencing `customer_id`.\nTo answer questions like *'Which customers placed orders over $150?'*, we connect them using **`JOIN`**.\n\n### 1. The Inner Join (`INNER JOIN ... ON`)\nAn Inner Join returns rows only when there is a match in **both** tables. If a customer has never placed an order, they will NOT appear in an `INNER JOIN`.\n\n```sql\nSELECT c.full_name, c.country, o.order_id, o.total_amount\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id;\n```\n- `c` and `o` are **table aliases**, saving keystrokes.\n- The `ON` clause specifies the foreign key relationship (`c.customer_id = o.customer_id`).\n\n### 2. The Left Outer Join (`LEFT JOIN ... ON`)\nWhat if you want a report of ALL customers, including those who have never placed an order?\nA `LEFT JOIN` returns all rows from the left table (`customers`), plus matching rows from the right table (`orders`). If there is no match, the columns from the right table are filled with `NULL`:\n\n```sql\nSELECT c.customer_id, c.full_name, COUNT(o.order_id) AS orders_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name;\n```\n\n### 3. The 10-Step Logical Query Processing Pipeline\nDevelopers write SQL starting with `SELECT`. But the MySQL engine executes clauses in an entirely different sequence:\n1. `FROM`: Identify base tables.\n2. `ON`: Evaluate join conditions.\n3. `JOIN`: Merge tables into joined virtual table.\n4. `WHERE`: Filter individual candidate rows (No aliases allowed!).\n5. `GROUP BY`: Bucket surviving rows into groups.\n6. `WITH ROLLUP`: Generate super-aggregate rows.\n7. `HAVING`: Filter aggregated groups.\n8. `SELECT`: Project columns, evaluate expressions & window functions.\n9. `DISTINCT`: Eliminate duplicate rows.\n10. `ORDER BY`: Sort the final rows (Aliases declared in SELECT are valid here!).\n11. `LIMIT`: Truncate and paginate final returned rows.\n\n**Why Aliases Fail in WHERE**:\nBecause `WHERE` evaluates at **Step 4**, while `SELECT` (which creates column aliases) doesn't evaluate until **Step 8**! The engine literally does not know what the alias is yet when evaluating `WHERE`!",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       LOGICAL SQL QUERY PROCESSING PIPELINE                   |\n+-------------------------------------------------------------------------------+\n  [Step 1]  FROM         -> Identify base tables and table sources\n  [Step 2]  ON           -> Evaluate join predicates for table pairs\n  [Step 3]  JOIN         -> Produce combined virtual Cartesian / joined product\n  [Step 4]  WHERE        -> Filter individual candidate rows (No aliases allowed!)\n  [Step 5]  GROUP BY     -> Bucket surviving rows into discrete aggregation groups\n  [Step 6]  WITH ROLLUP  -> Compute hierarchical subtotal and super-aggregate rows\n  [Step 7]  HAVING       -> Filter aggregated groups based on summary expressions\n  [Step 8]  SELECT       -> Project output columns, compute expressions\n  [Step 9]  DISTINCT     -> Eliminate duplicate rows from the projected result set\n  [Step 10] ORDER BY     -> Sort output (Can reference SELECT aliases!)\n  [Step 11] LIMIT        -> Truncate and paginate final returned rows\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Use `INNER JOIN` when you only want rows that have matches in both tables.",
      "Use `LEFT JOIN` when you want all rows from the primary table, even if no related records exist in the secondary table.",
      "Aliases declared in `SELECT` cannot be used in `WHERE` because `WHERE` executes at Step 4 while `SELECT` executes at Step 8."
    ],
    "cloudCaseStudy": {
      "title": "GitHub Commit DAG Parent-Child Relational Joins",
      "source": "bigquery-public-data.github_repos",
      "table": "commits",
      "description": "Git commit graphs model parent-child relationships. Analytical queries join commit hashes against parent commit arrays to track code branches and developer collaboration networks."
    },
    "codeTitle": "Join Customers and Orders with Aggregated Spend",
    "code": "-- Join customers with orders to compute total spend per customer\nSELECT \n    c.customer_id,\n    c.full_name,\n    c.country,\n    COUNT(o.order_id) AS total_orders,\n    COALESCE(SUM(o.total_amount), 0.00) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.full_name, c.country\nORDER BY total_spent DESC;",
    "codeExplanation": "Uses LEFT JOIN so customers with zero orders still appear in the report, uses COALESCE to turn NULL spend into 0.00, and sorts by total spent descending.",
    "pitfalls": "Trying to filter on a SELECT alias in a WHERE clause (e.g., 'WHERE total_spent > 100'). WHERE evaluates at Step 4 before SELECT creates the alias at Step 8. Use HAVING or repeat the expression.",
    "exercise": "Write an `INNER JOIN` query connecting `customers` and `orders`, selecting the customer's `full_name`, the `order_id`, and the `total_amount` for orders above $100.",
    "solution": "-- Chapter 9 Solution: Inner Join between customers and orders\nSELECT c.full_name, o.order_id, o.total_amount \nFROM customers c \nINNER JOIN orders o ON c.customer_id = o.customer_id \nWHERE o.total_amount > 100.00 \nORDER BY o.total_amount DESC;",
    "quiz": {
      "question": "Why can you NOT use a column alias defined in SELECT inside the WHERE clause?",
      "options": [
        "Because WHERE executes at Step 4 of the query pipeline, while SELECT does not evaluate until Step 8",
        "Because aliases can only contain numbers",
        "Because WHERE only works on tables stored in memory",
        "Because MySQL requires all aliases to be approved in the configuration file"
      ],
      "answer": 0,
      "explanation": "In MySQL's logical execution order, WHERE executes at Step 4 before SELECT projects columns and creates aliases at Step 8. Therefore, the engine does not know the alias when evaluating WHERE."
    }
  },
  "10": {
    "chapter": 10,
    "month": 3,
    "week": 10,
    "title": "Chapter 10: Advanced Analytics, Window Functions & Real-World Capstone",
    "badge": "Advanced Analytics & Capstone",
    "cloudDataset": "Multi-Cloud Analytics Capstone \u2022 Bitcoin, NYC Taxi & FineWeb",
    "time": "60 min study",
    "overview": "Master advanced analytics using Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD), compute running totals, and complete 10 hands-on capstone challenges analyzing multi-cloud datasets.",
    "content": "Welcome to the Graduation Chapter! You have journeyed from knowing zero SQL to designing schemas, ingesting cloud data, filtering, and joining tables.\n\nNow, we unlock **Window Functions**\u2014the secret weapon of Senior Data Engineers and Business Intelligence Architects.\n\n### 1. What is a Window Function?\nStandard `GROUP BY` collapses multiple rows into a single summary row.\nA **Window Function** performs calculations across related rows **WITHOUT collapsing the rows**! Each row retains its individual identity while displaying computed group rankings, running totals, and moving averages.\n\n### 2. Ranking Functions: `ROW_NUMBER`, `RANK`, `DENSE_RANK`\n- `ROW_NUMBER()`: Assigns a strict sequential integer (1, 2, 3, 4...) with no ties.\n- `RANK()`: Assigns ranks with ties, skipping subsequent ranks (1, 2, 2, 4...).\n- `DENSE_RANK()`: Assigns ranks with ties, but **never skips** numbers (1, 2, 2, 3...).\n\n```sql\n-- Rank products by price within each category\nSELECT \n    product_id,\n    name,\n    category,\n    base_price,\n    DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) AS category_rank\nFROM products;\n```\n- `PARTITION BY category`: Resets the ranking counter for each product category!\n- `ORDER BY base_price DESC`: Determines the ranking order inside each category partition.\n\n### 3. Navigating Adjacent Rows: `LAG()` and `LEAD()`\nIn spreadsheets, you can easily reference cell `A1` and `A2`. In traditional SQL, rows are independent.\n`LAG()` and `LEAD()` allow you to look at previous or next rows without self-joins:\n- `LAG(column, 1)`: Accesses the value of the row immediately before the current row. Perfect for calculating month-over-month growth or time between taxi trips!\n- `LEAD(column, 1)`: Accesses the value of the row immediately after the current row.\n\n### 4. Running Totals (Cumulative Sums)\n```sql\nSELECT \n    order_id,\n    order_date,\n    total_amount,\n    SUM(total_amount) OVER (ORDER BY order_date) AS running_revenue_total\nFROM orders;\n```\n\n### 5. The Capstone Graduation Project\nYou are now ready to tackle real-world multi-cloud queries across our sample datasets:\n- Calculating top customer lifetime value.\n- Identifying high-frequency taxi routes.\n- Analyzing product review rating velocity.",
    "diagram": "+-------------------------------------------------------------------------------+\n|                       WINDOW FUNCTION EXECUTION FRAMEWORK                     |\n+-------------------------------------------------------------------------------+\n  PARTITION BY category (Buckets rows WITHOUT collapsing them):\n\n  Category: 'Electronics'\n  [Product A: $249] -> DENSE_RANK = 1  (Row stays visible!)\n  [Product B: $149] -> DENSE_RANK = 2  (Row stays visible!)\n  [Product C: $99]  -> DENSE_RANK = 3  (Row stays visible!)\n\n  Category: 'Hardware'\n  [Product D: $129] -> DENSE_RANK = 1  (Counter resets per partition!)\n  [Product E: $49]  -> DENSE_RANK = 2  (Counter resets per partition!)\n+-------------------------------------------------------------------------------+",
    "takeaways": [
      "Window functions perform calculations across partitions of rows without collapsing rows like GROUP BY.",
      "`DENSE_RANK()` ranks items without leaving gaps when values tie.",
      "`LAG()` and `LEAD()` enable time-series velocity and month-over-month growth calculations directly in SQL."
    ],
    "cloudCaseStudy": {
      "title": "Bitcoin Blockchain Transaction Ledger Analysis",
      "source": "bigquery-public-data.crypto_bitcoin",
      "table": "transactions",
      "description": "Cryptocurrency forensic analysts use window functions (LAG and SUM OVER) to trace UTXO wallet balance flows and identify large whale transfers across Bitcoin ledger blocks."
    },
    "codeTitle": "Rank Products Within Category and Calculate Spend Velocity",
    "code": "-- Rank products within their category using DENSE_RANK\nSELECT \n    product_id,\n    name,\n    category,\n    base_price,\n    DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) AS price_rank_in_category\nFROM products\nORDER BY category, price_rank_in_category;",
    "codeExplanation": "Uses DENSE_RANK() OVER (PARTITION BY category ORDER BY base_price DESC) to rank products from highest to lowest price within each discrete category without collapsing the table rows.",
    "pitfalls": "Confusing RANK() and DENSE_RANK(). RANK() skips rank numbers after ties (1, 2, 2, 4), while DENSE_RANK() never leaves gaps (1, 2, 2, 3).",
    "exercise": "Write a query to rank all orders in `orders` by `total_amount` descending using `DENSE_RANK()`, projecting `order_id`, `customer_id`, `total_amount`, and the rank.",
    "solution": "-- Chapter 10 Solution: Ranking orders by total amount\nSELECT \n    order_id,\n    customer_id,\n    total_amount,\n    DENSE_RANK() OVER (ORDER BY total_amount DESC) AS revenue_rank \nFROM orders;",
    "quiz": {
      "question": "What is the primary advantage of a Window Function compared to a standard GROUP BY aggregation?",
      "options": [
        "Window functions perform calculations across related rows without collapsing the individual rows into a single row",
        "Window functions only work on tables with less than 10 rows",
        "Window functions automatically delete all duplicate rows from disk",
        "Window functions convert all SQL queries into Python code"
      ],
      "answer": 0,
      "explanation": "Unlike GROUP BY which aggregates and collapses rows into category summaries, Window Functions compute running totals, ranks, and partition metrics while preserving every individual row."
    }
  }
};

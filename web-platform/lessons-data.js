/**
 * MySQL Pro Academy: Comprehensive Course Lessons Data (Weeks 1 - 24)
 * 10 Chapters per lesson for zero-knowledge beginners and advanced DBAs.
 */

window.LESSON_DETAILS = {
  "1": {
    "month": 1,
    "week": 1,
    "title": "Week 1: SQL Execution Order, Advanced Joins & Hash Joins",
    "cloudDataset": "Google Cloud Stack Overflow Public Dataset (bigquery-public-data.stackoverflow)",
    "time": "60 min deep study",
    "overview": "A complete 10-Chapter zero-knowledge masterclass: from what a database is and how to fetch data from AWS S3 cloud containers, to writing your first SELECT, filtering with WHERE, grouping with GROUP BY, and executing real cloud analytics.",
    "sections": [
      {
        "heading": "1. The 10-Step Logical Query Processing Pipeline",
        "content": "While developers write SQL starting with SELECT, the SQL engine evaluates clauses in an entirely different sequence. Understanding this sequence is vital to avoid syntax errors and optimize execution costs:",
        "diagram": "+-----------------------------------------------------------------------------------+\n|                           LOGICAL SQL EXECUTION PIPELINE                         |\n+-----------------------------------------------------------------------------------+\n  [Step 1]  FROM         -> Identify base tables and table sources\n  [Step 2]  ON           -> Evaluate join predicates for table pairs\n  [Step 3]  JOIN         -> Produce combined virtual Cartesian / joined product\n  [Step 4]  WHERE        -> Filter individual candidate rows (No aliases allowed!)\n  [Step 5]  GROUP BY     -> Bucket surviving rows into discrete aggregation groups\n  [Step 6]  WITH ROLLUP  -> Compute hierarchical subtotal and super-aggregate rows\n  [Step 7]  HAVING       -> Filter aggregated groups based on summary expressions\n  [Step 8]  SELECT       -> Project output columns, compute expressions & window functions\n  [Step 9]  DISTINCT     -> Eliminate duplicate rows from the projected result set\n  [Step 10] ORDER BY     -> Sort output (Can reference SELECT aliases & window outputs)\n  [Step 11] LIMIT        -> Truncate and paginate final returned rows\n+-----------------------------------------------------------------------------------+",
        "takeaways": [
          "Aliases created in SELECT cannot be used in WHERE because WHERE evaluates at Step 4, while SELECT evaluates at Step 8.",
          "HAVING evaluates at Step 7 after GROUP BY; therefore, it can filter on aggregate functions like COUNT() and SUM(), whereas WHERE cannot.",
          "ORDER BY evaluates at Step 10, meaning it is one of the only clauses that can freely reference aliases declared in SELECT."
        ]
      },
      {
        "heading": "2. High-Performance Self-Joins & Inequality Filters",
        "content": "In multi-tenant analytics and recommendation engines (e.g., Stack Overflow tag co-occurrences or Market Basket analysis), tables must be joined with themselves to find co-occurring entities. Without strict inequality filters, the join produces redundant symmetric duplicates (A-B and B-A) and self-matches (A-A).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       SELF-JOIN CARTESIAN REDUCTION                           |\n+-------------------------------------------------------------------------------+\n  Unrestricted Join:   (A, A), (A, B), (B, A), (B, B) -> 4 pairs (O(N^2) explosion)\n  With (tag_a < tag_b): Only (A, B) survives           -> Exactly 1 unique pair!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use ON a.id < b.id (strict inequality) instead of ON a.id != b.id to cut result rows by exactly 50% and eliminate reflexive pairings.",
          "Ensure composite indexes exist on (grouping_col, join_key) to allow the optimizer to perform an index-only stream merge."
        ]
      },
      {
        "heading": "3. MySQL 8.0.18+ In-Memory Hash Joins",
        "content": "Prior to MySQL 8.0.18, queries without equijoined indexes suffered from Block Nested Loop (BNL) joins, consuming O(N * M) CPU cycles. Modern MySQL builds an in-memory hash table on the smaller table (Build phase) using join_buffer_size, then reads the larger table line-by-line and probes the hash table (Probe phase) with linear O(N + M) complexity.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         HASH JOIN BUILD & PROBE PHASES                        |\n+-------------------------------------------------------------------------------+\n  [Build Phase]:  Read small table (10k rows) -> Hash(join_key) -> Hash Table in RAM\n  [Probe Phase]:  Stream big table (10M rows) -> Hash(join_key) -> Instant RAM Lookup!\n  Time Complexity: O(N + M) linear vs O(N * M) quadratic!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Hash joins automatically replace Block Nested Loops for equi-joins lacking an index.",
          "If the build table exceeds join_buffer_size, MySQL spills chunks to disk temporary files, degrading throughput. Sizing join_buffer_size properly is crucial."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Stack Overflow Tag Co-Occurrence Matrix",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.stackoverflow.posts_questions)",
      "table": "so_posts (50M+ rows)",
      "description": "Analyzing 50 Million developer questions to find which technologies are most frequently asked together (e.g., MySQL + Docker). Demonstrates how strict inequality self-joins eliminate millions of redundant calculations on public cloud datasets."
    },
    "codeTitle": "Stack Overflow Technology Affinity Self-Join",
    "code": "-- Stack Overflow Tag Affinity Self-Join\n-- Finds technologies most frequently co-occurring on developer questions\nSELECT \n    p1.tags AS primary_tech,\n    p2.tags AS paired_tech,\n    COUNT(DISTINCT p1.post_id) AS co_occurrence_count,\n    ROUND(AVG(p1.score), 2) AS avg_question_score\nFROM so_posts p1\nJOIN so_posts p2 \n    ON p1.post_id = p2.post_id \n   AND p1.tags < p2.tags                  -- Strict inequality prevents symmetric pairs & self-joins\nWHERE p1.post_type_id = 1                 -- 1 = Question\n  AND p1.tags IS NOT NULL\nGROUP BY p1.tags, p2.tags\nHAVING co_occurrence_count >= 1\nORDER BY co_occurrence_count DESC\nLIMIT 10;",
    "codeExplanation": "The query joins `so_posts` against itself on identical `post_id`. The condition `p1.tags < p2.tags` guarantees that (<docker>, <mysql>) is counted once, but (<mysql>, <docker>) is ignored. HAVING filters the co-occurrence threshold after GROUP BY.",
    "pitfalls": "Common Senior DBA Pitfall: Filtering with WHERE on column aliases created in SELECT (e.g., WHERE co_occurrence_count > 5). This fails with ER_BAD_FIELD_ERROR because WHERE executes at Step 4, while SELECT executes at Step 8. Always use HAVING or wrap the query in a Common Table Expression (CTE).",
    "quiz": {
      "question": "Why does MySQL throw an 'Unknown column' error when you reference a SELECT alias in a WHERE clause?",
      "options": [
        "Aliases are only permitted in PostgreSQL and Oracle",
        "WHERE evaluates at Step 4 before SELECT projects column expressions at Step 8",
        "The query parser runs in reverse order",
        "WHERE clauses only accept primary key integers"
      ],
      "answer": 1,
      "explanation": "Because the relational engine filters source rows in the WHERE phase (Step 4) before creating column aliases in the SELECT phase (Step 8), the alias name does not exist yet when WHERE runs."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Absolute Beginner Foundations",
        "title": "Chapter 1: What is a Database and What is SQL?",
        "overview": "If you have never written a line of code or worked with databases before, welcome! This chapter introduces what data is, why spreadsheets fail at scale, and what SQL actually does.",
        "content": "Every modern app on your phone\u2014from Instagram and Netflix to Amazon and Uber\u2014stores information in a **Database**.\n\n### 1. What is Data?\nData is simply structured information:\n- Your name, email, and password.\n- The items in your shopping cart.\n- The GPS pickup coordinates of a taxi ride.\n- The timestamp of a cryptocurrency transaction.\n\n### 2. Why Spreadsheets (Excel / Google Sheets) Fail at Scale\nMost people start organizing information in spreadsheets like Microsoft Excel or Google Sheets. While spreadsheets are fine for a grocery list of 50 items, they break down immediately in real-world systems:\n- **The 1-Million Row Hard Limit**: Excel physically cannot hold more than 1,048,576 rows. If an e-commerce site gets 5 million orders, Excel crashes.\n- **Concurrency Conflicts**: If two people edit the exact same cell at the exact same millisecond, spreadsheets create duplicate conflicted copies.\n- **Accidental Deletions**: In a spreadsheet, anyone can accidentally hit Backspace and delete an entire column of bank balances.\n- **Slow Searches**: Searching for 1 record among 10 million rows in Excel takes several minutes. In a database with an index, it takes **0.001 seconds (1 millisecond)**!\n\n### 3. What is an RDBMS and What is SQL?\nA **Relational Database Management System (RDBMS)**\u2014such as **MySQL 8.0**\u2014is specialized software engineered to store, protect, and search hundreds of millions of records at lightning speed.\n\n**SQL** stands for **Structured Query Language** (pronounced *\"Sequel\"*). It is the universal language used to communicate with databases. Instead of writing complex computer code, SQL uses plain English words like `SELECT`, `FROM`, `WHERE`, and `INSERT` to ask questions and manipulate data.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        SPREADSHEET vs RELATIONAL DATABASE                     |\n+-------------------------------------------------------------------------------+\n  EXCEL SPREADSHEET:\n  - Max ~1 Million rows (Crashes on big data)\n  - No concurrency (File gets locked or corrupted when multiple users write)\n  - Manual sorting (Takes seconds to minutes)\n  \n  MYSQL RELATIONAL DATABASE:\n  - Scales to Billions of rows across gigabytes and terabytes of disk\n  - ACID Concurrency (Thousands of users write simultaneously with zero conflicts)\n  - B+ Tree Indexing (Point lookups execute in 0.001 seconds / 1 millisecond!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "A database is an organized electronic filing cabinet for massive amounts of data.",
          "SQL is the English-like declarative language used to query and manage relational databases.",
          "Tables consist of Columns (Fields/Attributes) and Rows (Individual Records).",
          "Every table should have a Primary Key\u2014a unique ID number that distinguishes each row."
        ],
        "exercise": "Examine the customers table. What column serves as the unique identifier for each person?",
        "solution": "-- In relational design, 'customer_id' is the Primary Key that uniquely identifies each customer."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Architecture",
        "title": "Chapter 2: What are Cloud Big Data Containers? (AWS S3 & Beyond)",
        "overview": "Learn where massive real-world datasets live in the modern cloud, why companies use Amazon S3 buckets, and the difference between CSV, TSV, and Parquet files.",
        "content": "When data grows to millions or billions of rows (hundreds of gigabytes or terabytes), you cannot simply download it onto a flash drive or attach it to an email. It lives in **Cloud Storage Containers**.\n\n### 1. What is an Amazon S3 Bucket?\nAmazon Web Services (AWS) provides **S3 (Simple Storage Service)**. Think of an S3 bucket as an infinite, high-speed hard drive in the cloud. Companies store raw files in S3 buckets with names like `s3://nyc-tlc/` or `s3://amazon-reviews-pds/`.\n\n### 2. The AWS Open Data Registry (Free Public Data)\nAWS hosts the **AWS Open Data Registry**. These are public S3 storage buckets sponsored by AWS to make massive scientific, transit, and consumer datasets freely available to researchers, developers, and students around the world.\n- **NYC TLC Taxi**: Over **1.5 Billion taxi trips** in New York City (`s3://nyc-tlc/trip data/`).\n- **Amazon Customer Reviews**: Over **130 Million real product reviews** spanning 20+ years (`s3://amazon-reviews-pds/tsv/`).\n- **Common Crawl**: Petabytes of raw internet web scrapes (`s3://commoncrawl/`).\n\n### 3. File Formats: CSV vs TSV vs Parquet\nWhen you look inside an S3 bucket, files are stored in different formats:\n- **CSV (Comma-Separated Values)**: Plain text where values are separated by commas: `1,Alice,alice@example.com,50.00`. Easy for humans to read, but large file size.\n- **TSV (Tab-Separated Values)**: Plain text where values are separated by tab characters. Common for review text so commas inside sentences don't break columns.\n- **Parquet (Columnar Storage)**: Modern binary format used by big data engines. It compresses data by 80% and stores columns together, making analytics 10x faster.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       CLOUD BIG DATA CONTAINER PIPELINE                       |\n+-------------------------------------------------------------------------------+\n  [AWS S3 Public Bucket: s3://nyc-tlc/]  (1.5 Billion Trips, Parquet format)\n                   |\n                   v (Zero Credentials / Public Anonymous HTTP GET)\n  [Your Local Machine / Cloud Docker Codespaces]\n                   |\n                   v (LOAD DATA LOCAL INFILE)\n  [MySQL 8.0 Relational Engine: nyc_yellow_taxi_trips table]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "An S3 bucket is a cloud-hosted folder holding large files (CSV, Parquet, TSV).",
          "The AWS Open Data Registry allows anyone in the world to read big data for free without an AWS account.",
          "Parquet is a compressed columnar format; CSV is a human-readable text format."
        ],
        "exercise": "What is the difference between a CSV file and a Parquet file?",
        "solution": "-- CSV is uncompressed plain text with commas. Parquet is a compressed binary columnar format designed for fast analytics."
      },
      {
        "chapter": 3,
        "badge": "Hands-On Cloud Connection",
        "title": "Chapter 3: Fetching Data from the Cloud Container (Step-by-Step)",
        "overview": "Step-by-step terminal instructions to fetch real cloud data chunks directly from AWS S3 buckets without needing an AWS account or API key.",
        "content": "The biggest hurdle for beginners is usually: *'How do I actually get the cloud data onto my computer without paying or signing up for cloud accounts?'*\n\nThe answer is **anonymous, unauthenticated access** using the `--no-sign-request` flag.\n\n### Method 1: Using the AWS CLI (Zero Login Required)\nIf you have the AWS command-line tool installed, you simply add `--no-sign-request`:\n```bash\n# 1. List the files in the public NYC Taxi bucket:\naws s3 ls --no-sign-request \"s3://nyc-tlc/trip data/\"\n\n# 2. Download one month of real yellow taxi trips (~50 MB compressed Parquet):\naws s3 cp --no-sign-request \"s3://nyc-tlc/trip data/yellow_tripdata_2023-01.parquet\" ./nyc_taxi_sample.parquet\n```\n\n### Method 2: Direct Download via Web Browser or curl (No Tools Needed!)\nEvery file in the AWS Open Data Registry is also mapped to a direct web URL:\n```bash\n# Download directly with curl:\ncurl -O \"https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet\"\n```\n\n### Method 3: Using the Learning Kit's Automated Connector\nIn your learning kit directory, we built an automated python tool that downloads and extracts sample chunks for you:\n```bash\ncd /Users/benjamin/.gemini/antigravity/scratch/mysql-pro-kit\n\n# List all available cloud datasets:\npython3 01-datasets/cloud_public_datasets_connector.py --list\n\n# Download sample chunks from AWS S3:\npython3 01-datasets/cloud_public_datasets_connector.py --fetch nyc_taxi\npython3 01-datasets/cloud_public_datasets_connector.py --fetch amazon_reviews\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      ANONYMOUS S3 BUCKET FETCH WORKFLOW                       |\n+-------------------------------------------------------------------------------+\n  Client Terminal:   aws s3 cp --no-sign-request s3://nyc-tlc/... ./local.parquet\n                              |\n                              v\n  AWS S3 Gateway:    Inspects request -> Flag '--no-sign-request' detected!\n                     -> Skips authentication & credential check!\n                     -> Streams public data over HTTPS -> Download Complete!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "The `--no-sign-request` flag tells the AWS CLI to bypass authentication entirely.",
          "You never need to enter an access key, secret key, or credit card to read AWS Open Data.",
          "All public bucket files are also directly downloadable over HTTPS via CloudFront."
        ],
        "exercise": "What flag must you provide to the AWS CLI to download public open data without signing into an AWS account?",
        "solution": "-- The flag is: --no-sign-request"
      },
      {
        "chapter": 4,
        "badge": "Schema Architecture & DDL",
        "title": "Chapter 4: Designing the Table Blueprint (CREATE TABLE & Data Types)",
        "overview": "Learn how to write the architectural blueprint for a database table from scratch using CREATE TABLE and understand SQL data types.",
        "content": "Before you can load cloud data into MySQL, you must build the **Table Blueprint**. In SQL, this is done using **DDL (Data Definition Language)** via the `CREATE TABLE` statement.\n\n### 1. Fundamental SQL Data Types for Beginners\nEvery column in a table must have a declared data type that tells MySQL what kind of information it can store:\n- `INT` or `BIGINT`: Whole integers (e.g. `1`, `42`, `1000000`). Use `BIGINT` for IDs and trip numbers that could grow to billions.\n- `VARCHAR(length)`: Text of variable length (e.g. `VARCHAR(255)` for names or email addresses).\n- `DECIMAL(precision, scale)`: Exact numbers for money, prices, and fares. For example, `DECIMAL(10, 2)` stores numbers with up to 10 digits total and exactly 2 decimal places (e.g. `$1,425.50`). **Never use FLOAT or DOUBLE for money** because they introduce floating-point rounding errors!\n- `DATETIME`: Date and time timestamps formatted as `'YYYY-MM-DD HH:MM:SS'`.\n\n### 2. Constraints: The Rules of the Table\n- `PRIMARY KEY`: The unique ID of the row. No two rows can ever have the same primary key value.\n- `NOT NULL`: Enforces that the column cannot be left empty or blank.\n- `AUTO_INCREMENT`: MySQL automatically assigns consecutive IDs (1, 2, 3...) whenever a new row is inserted.\n\n### 3. Writing the Blueprint:\n```sql\nCREATE TABLE IF NOT EXISTS customers (\n    customer_id INT AUTO_INCREMENT PRIMARY KEY,\n    first_name VARCHAR(50) NOT NULL,\n    last_name VARCHAR(50) NOT NULL,\n    email VARCHAR(100) UNIQUE NOT NULL,\n    tier VARCHAR(20) DEFAULT 'Standard',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       TABLE BLUEPRINT (SCHEMA DEFINITION)                     |\n+-------------------------------------------------------------------------------+\n  Column Name      Data Type        Rules / Constraints\n  customer_id      INT              PRIMARY KEY, AUTO_INCREMENT (Unique passport #)\n  first_name       VARCHAR(50)      NOT NULL (Cannot be empty)\n  last_name        VARCHAR(50)      NOT NULL (Cannot be empty)\n  email            VARCHAR(100)     UNIQUE, NOT NULL (No duplicate emails allowed!)\n  created_at       DATETIME         DEFAULT CURRENT_TIMESTAMP (Auto-timestamps row)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "CREATE TABLE defines the columns, data types, and integrity constraints of a table.",
          "Always use DECIMAL(10,2) for currency and financial amounts to prevent rounding bugs.",
          "A PRIMARY KEY ensures every row can be uniquely identified without ambiguity."
        ],
        "exercise": "Write a CREATE TABLE statement for a products table with product_id (PK), name (VARCHAR 100), and base_price (DECIMAL 10,2).",
        "solution": "CREATE TABLE products (\n    product_id INT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    base_price DECIMAL(10, 2) NOT NULL\n);"
      },
      {
        "chapter": 5,
        "badge": "High-Speed Ingestion",
        "title": "Chapter 5: Loading Cloud Data into MySQL (LOAD DATA LOCAL INFILE)",
        "overview": "Learn how to take the downloaded CSV or TSV cloud data file and ingest millions of rows into MySQL in seconds.",
        "content": "Now that you have downloaded data from the cloud container and created the table blueprint, how do you load the data into MySQL?\n\nYou could write individual `INSERT INTO ...` statements, but inserting 1 million rows one-by-one would take over 45 minutes! \n\nThe professional way used by Database Engineers is **`LOAD DATA LOCAL INFILE`**, which streams the raw file directly into the database engine at **50,000 to 100,000 rows per second**.\n\n### The Anatomy of LOAD DATA LOCAL INFILE:\n```sql\nLOAD DATA LOCAL INFILE '/path/to/nyc_taxi_sample.csv'\nINTO TABLE nyc_yellow_taxi_trips\nFIELDS TERMINATED BY ','       -- Commas separate columns in CSV\nENCLOSED BY '\"'               -- Text values might be wrapped in quotes\nLINES TERMINATED BY '\\n'       -- Each row is on a new line\nIGNORE 1 ROWS                  -- Skip the header row (column names)\n(vendor_id, pickup_datetime, dropoff_datetime, passenger_count, trip_distance, fare_amount, total_amount);\n```\n\n### The 3 Magic Speed Switches\nBefore loading multi-million row datasets, senior DBAs temporarily disable safety constraint validation:\n```sql\nSET foreign_key_checks = 0;   -- Don't check parent foreign keys for every row\nSET unique_checks = 0;        -- Buffer secondary index updates in RAM\nSET autocommit = 0;           -- Don't write to disk after every single row!\n```\nOnce the load finishes, commit and turn checks back on:\n```sql\nCOMMIT;\nSET foreign_key_checks = 1;\nSET unique_checks = 1;\nSET autocommit = 1;\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       HIGH-SPEED BULK INGESTION STREAM                        |\n+-------------------------------------------------------------------------------+\n  [Raw CSV File on Disk]\n           |\n           v (Bypasses SQL Query Parser!)\n  [LOAD DATA LOCAL INFILE Stream: 85,000 rows/second]\n           |\n           v (Buffers index updates in RAM Change Buffer)\n  [InnoDB 16KB Tablespace Data Pages on Disk]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "LOAD DATA LOCAL INFILE bypasses the SQL query parser, making it 50x faster than standard INSERTs.",
          "IGNORE 1 ROWS prevents the CSV header row (column names) from being inserted as a data row.",
          "Always re-enable foreign_key_checks and unique_checks after ingestion completes."
        ],
        "exercise": "Why do we specify 'IGNORE 1 ROWS' when loading a CSV file into MySQL?",
        "solution": "-- 'IGNORE 1 ROWS' skips the very first line of the CSV file, which contains the column headers (text names) rather than actual data records."
      },
      {
        "chapter": 6,
        "badge": "First Query & Projection",
        "title": "Chapter 6: Your First Query: Reading Data with SELECT & LIMIT",
        "overview": "Learn how to write your first SQL query, select specific columns, use aliases to rename output, and safely limit rows.",
        "content": "Now that data is inside your MySQL database, it is time to write your very first SQL query!\n\n### 1. The Simplest Query in the World\n```sql\nSELECT * FROM customers;\n```\n- `SELECT` tells the database: *\"Fetch these columns for me.\"*\n- `*` (asterisk) is a wildcard that means *\"Give me every single column.\"*\n- `FROM customers` specifies which table to read from.\n- `;` (semicolon) ends the SQL statement.\n\n### 2. Why Senior DBAs NEVER Run 'SELECT *' in Production\nWhile `SELECT *` is easy for beginners, in production databases with millions of rows, running `SELECT *` is dangerous:\n- It forces the database to read every single column from disk (including large text blobs).\n- It wastes network bandwidth transferring columns your application doesn't need.\n- It prevents the optimizer from using fast **Covering Indexes**.\n\n**Rule: Always explicitly name the columns you need:**\n```sql\nSELECT first_name, last_name, tier FROM customers;\n```\n\n### 3. The LIMIT Clause: Your Safety Brake\nIf a table has 10 million rows, asking for all rows will freeze your terminal and browser. Always append `LIMIT N` to preview a small sample:\n```sql\nSELECT customer_id, first_name, tier \nFROM customers \nLIMIT 5;\n```\n\n### 4. Renaming Columns with Aliases (The AS Keyword)\nYou can rename columns in the output to make them friendly and readable:\n```sql\nSELECT \n    first_name AS customer_first_name,\n    tier AS loyalty_program_status\nFROM customers\nLIMIT 5;\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       COLUMN PROJECTION & ROW LIMIT                           |\n+-------------------------------------------------------------------------------+\n  Table has 8 columns and 1,000,000 rows.\n  Query: SELECT first_name, tier FROM customers LIMIT 3;\n  \n  Result:\n  +------------+----------+\n  | first_name | tier     |  <- Only 2 columns projected!\n  +------------+----------+\n  | Alice      | VIP      |  <- Row 1\n  | Bob        | Gold     |  <- Row 2\n  | Charlie    | Standard |  <- Row 3 (Truncated at LIMIT 3!)\n  +------------+----------+\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SELECT chooses which columns to project; FROM chooses which table to read.",
          "Avoid SELECT * in production; always specify the exact columns required.",
          "LIMIT restricts the number of rows returned, preventing memory and network crashes."
        ],
        "exercise": "Write a query to display product_id, name, and base_price from products, limiting to the first 5 rows.",
        "solution": "SELECT product_id, name, base_price \nFROM products \nLIMIT 5;"
      },
      {
        "chapter": 7,
        "badge": "Filtering & Logic",
        "title": "Chapter 7: Filtering Real Records: The WHERE Clause & Operators",
        "overview": "Master the WHERE clause. Learn how to filter rows using equality, ranges, lists, pattern matching, compound boolean logic, and the special case of NULL.",
        "content": "In real life, you rarely want to see all data. You want to see: *'Which customers are in the VIP tier?'* or *'Which orders were over $500?'*\n\nThe **`WHERE` clause** filters rows. The database engine examines each row one-by-one. If the condition evaluates to `TRUE`, the row is kept; if `FALSE` (or `NULL`), the row is discarded.\n\n### 1. Comparison Operators\n- `=` : Equals (`WHERE tier = 'VIP'`)\n- `!=` or `<>` : Not Equals (`WHERE status != 'CANCELLED'`)\n- `>` and `<` : Greater Than / Less Than (`WHERE total_amount > 100.00`)\n- `>=` and `<=` : Greater/Less Than or Equal To (`WHERE base_price <= 50.00`)\n\n### 2. Range & List Operators\n- `BETWEEN min AND max`: Inclusive range (`WHERE total_amount BETWEEN 50 AND 200`)\n- `IN (val1, val2, ...)`: Matches any value in the list (`WHERE country IN ('USA', 'Canada', 'UK')`)\n\n### 3. Text Pattern Matching with LIKE\n- `%` matches **zero or more characters**.\n- `WHERE email LIKE '%.com'` -> matches any email ending with `.com`.\n- `WHERE first_name LIKE 'A%'` -> matches Alice, Alex, Aaron.\n\n### 4. Combining Conditions with AND, OR, and NOT\n- `AND`: Both conditions must be true:\n  `WHERE tier = 'VIP' AND country = 'USA'`\n- `OR`: At least one condition must be true:\n  `WHERE country = 'USA' OR country = 'Canada'`\n- **Crucial Rule on Parentheses**: When mixing `AND` and `OR`, always wrap groups in parentheses:\n  `WHERE (tier = 'VIP' OR tier = 'Gold') AND country = 'USA'`\n\n### 5. The Dangerous NULL Trap\n`NULL` means **unknown / missing value**. It does NOT equal zero, and it does NOT equal an empty string `\"\"`!\nBecause `NULL` is unknown, writing `WHERE phone = NULL` will **NEVER match any rows** (even rows with NULL)!\n**Rule: Always use `IS NULL` or `IS NOT NULL`:**\n```sql\nSELECT customer_id, email FROM customers WHERE tier IS NOT NULL;\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         WHERE CLAUSE ROW FILTERING                            |\n+-------------------------------------------------------------------------------+\n  Candidate Row 1: [ID: 1, Total: $120, Status: 'PAID']   -> WHERE Total > 100 -> PASS (Kept)\n  Candidate Row 2: [ID: 2, Total: $45,  Status: 'PAID']   -> WHERE Total > 100 -> FAIL (Discarded)\n  Candidate Row 3: [ID: 3, Total: $500, Status: 'VOID']   -> WHERE Status != 'VOID' -> FAIL (Discarded)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "WHERE filters individual rows before any grouping or aggregation takes place.",
          "Always use parentheses when combining AND and OR to enforce evaluation precedence.",
          "Never use `= NULL`. Always use `IS NULL` or `IS NOT NULL`."
        ],
        "exercise": "Write a query to find all orders where status is 'COMPLETED' and total_amount is greater than 150.00.",
        "solution": "SELECT order_id, customer_id, order_date, total_amount \nFROM orders \nWHERE status = 'COMPLETED' AND total_amount > 150.00;"
      },
      {
        "chapter": 8,
        "badge": "Aggregation & Analytics",
        "title": "Chapter 8: Data Summarization: Aggregate Functions & GROUP BY",
        "overview": "Learn how to turn millions of raw data points into actionable executive summaries using aggregate functions, GROUP BY, and HAVING.",
        "content": "Now you know how to fetch and filter individual rows. But businesses need answers to big summary questions:\n- *What was our total revenue last month?*\n- *How many orders did each customer place?*\n- *What is the average price of products in each category?*\n\n### 1. The 5 Essential Aggregate Functions\nAggregate functions take multiple numbers from many rows and collapse them into a single summary figure:\n- `COUNT(*)`: Counts the total number of rows.\n- `SUM(column)`: Calculates the sum of all values in the column.\n- `AVG(column)`: Calculates the arithmetic average (mean).\n- `MIN(column)`: Finds the lowest value.\n- `MAX(column)`: Finds the highest value.\n\n```sql\nSELECT \n    COUNT(*) AS total_orders,\n    SUM(total_amount) AS total_revenue,\n    ROUND(AVG(total_amount), 2) AS average_order_value,\n    MIN(total_amount) AS smallest_order,\n    MAX(total_amount) AS largest_order\nFROM orders;\n```\n\n### 2. Grouping Rows with GROUP BY\nWhat if you want to see total revenue broken down **per customer tier** or **per product category**?\nThe **`GROUP BY` clause** groups identical values into buckets and runs the aggregate function on each bucket separately:\n```sql\nSELECT \n    tier,\n    COUNT(*) AS customer_count\nFROM customers\nGROUP BY tier;\n```\n\n### 3. The Golden Law of GROUP BY\n**If you select a column that is NOT inside an aggregate function (like SUM or AVG), that column MUST be listed in your GROUP BY clause!**\nIf you write `SELECT category, name, AVG(base_price) FROM products GROUP BY category;`, MySQL will throw an error because it doesn't know *which* product name to pick for the category summary.\n\n### 4. HAVING vs WHERE: The Critical Distinction\n- **`WHERE`** filters individual rows **BEFORE** grouping.\n- **`HAVING`** filters aggregated summary buckets **AFTER** grouping.\n```sql\nSELECT \n    category,\n    COUNT(*) AS total_items,\n    AVG(base_price) AS avg_price\nFROM products\nGROUP BY category\nHAVING total_items >= 2;   -- Only show categories with 2 or more products!\n```",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       GROUP BY AGGREGATION COLLAPSE                           |\n+-------------------------------------------------------------------------------+\n  Raw Table (6 Rows):\n    [Electronics, $100] --\\\n    [Electronics, $200] ---> [Electronics: 3 Items, Total: $600, Avg: $200]\n    [Electronics, $300] --/\n    \n    [Furniture,   $500] --\\\n    [Furniture,   $250] ---> [Furniture:   2 Items, Total: $750, Avg: $375]\n    [Furniture,   $250] --/\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Aggregate functions (SUM, AVG, COUNT, MIN, MAX) collapse multiple values into one summary.",
          "GROUP BY categorizes rows into distinct buckets before running aggregates.",
          "WHERE filters raw rows before grouping; HAVING filters summary results after grouping."
        ],
        "exercise": "Write a query to calculate total orders and total revenue per customer_id from orders, ordered by total revenue descending.",
        "solution": "SELECT \n    customer_id, \n    COUNT(*) AS total_orders, \n    ROUND(SUM(total_amount), 2) AS total_spent \nFROM orders \nGROUP BY customer_id \nORDER BY total_spent DESC;"
      },
      {
        "chapter": 9,
        "badge": "Engine Internals & Traps",
        "title": "Chapter 9: The 10-Step Query Engine Pipeline & Beginner Traps",
        "overview": "Understand why SQL syntax is written backwards, examine the 10-step engine execution pipeline, and master ORDER BY sorting.",
        "content": "One of the most confusing things for beginners is: *'Why do I write SELECT at the beginning of the query, but MySQL gives me an error when I use my SELECT alias in the WHERE clause?'*\n\nThe reason is that **human SQL syntax is written in a different order than the physical database engine executes it!**\n\n### The 10-Step Internal Query Processing Sequence\n```\n1. FROM        -> Identifies the base source tables\n2. ON          -> Evaluates join conditions between tables\n3. JOIN        -> Merges matching tables together\n4. WHERE       -> Filters raw individual rows\n5. GROUP BY    -> Buckets surviving rows into categories\n6. WITH ROLLUP -> Calculates sub-totals and super-aggregates\n7. HAVING      -> Filters the aggregated summary groups\n8. SELECT      -> Projects the final columns and computes aliases\n9. DISTINCT    -> Removes duplicate rows from output\n10. ORDER BY   -> Sorts the final result rows\n11. LIMIT      -> Truncates the final output to N rows\n```\n\n### The #1 Beginner Mistake Explained:\nLook at this query:\n```sql\nSELECT total_amount * 1.1 AS amount_with_tax\nFROM orders\nWHERE amount_with_tax > 100.00;   -- THIS FAILS WITH ERROR 1054!\n```\nWhy does it fail? Look at the pipeline above:\n- `WHERE` executes at **Step 4**.\n- `SELECT` (which creates `amount_with_tax`) executes at **Step 8**.\nWhen the database runs Step 4, `amount_with_tax` **does not exist yet!**\n\n**The Fix**: Either repeat the formula in WHERE:\n`WHERE (total_amount * 1.1) > 100.00`\nOr wrap it in a Common Table Expression (CTE).\n\n### Sorting Results with ORDER BY\n`ORDER BY` runs at **Step 10** (after SELECT), so it CAN use column aliases!\n- `ORDER BY total_spent ASC` : Ascending (smallest to largest, 1 to 9, A to Z). Default.\n- `ORDER BY total_spent DESC` : Descending (largest to smallest, 9 to 1, Z to A).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       LOGICAL QUERY EXECUTION TIMELINE                        |\n+-------------------------------------------------------------------------------+\n  [Step 1: FROM]      Base tables loaded from disk\n  [Step 4: WHERE]     Rows filtered (Aliases do NOT exist yet!)\n  [Step 5: GROUP BY]  Rows bucketed into categories\n  [Step 7: HAVING]    Aggregates filtered\n  [Step 8: SELECT]    Aliases created here! (AS total_revenue)\n  [Step 10: ORDER BY] Result sorted (Can use SELECT aliases!)\n  [Step 11: LIMIT]    Final row count truncated\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SQL is evaluated: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.",
          "You cannot use aliases in WHERE because WHERE evaluates at Step 4, while SELECT evaluates at Step 8.",
          "ORDER BY runs at Step 10, meaning it can freely use aliases defined in SELECT."
        ],
        "exercise": "Why can an ORDER BY clause reference an alias created in SELECT, but a WHERE clause cannot?",
        "solution": "-- Because WHERE executes at Step 4 before SELECT creates the alias at Step 8. ORDER BY executes at Step 10 after SELECT, so the alias is already available."
      },
      {
        "chapter": 10,
        "badge": "Guided Lab & Exercises",
        "title": "Chapter 10: Guided Hands-On Exercises, Challenges & Solution Lab",
        "overview": "Put everything into practice! Solve 5 progressive hands-on exercises on real cloud-style datasets with guided tasks, hints, and interactive SQL solutions.",
        "content": "Congratulations on reaching Chapter 10! You have gone from having zero knowledge of databases to understanding cloud containers, table blueprints, high-speed ingestion, projection, filtering, grouping, and execution internals.\n\nNow, solve these 5 progressive challenges. You can run all solutions directly in the **SQL Playground**!\n\n---\n\n### Challenge 1 (Warm-Up): High-Value Order Inspection\n- **Task**: Select `order_id`, `order_date`, and `total_amount` from `orders` for all orders greater than $100.00, sorted from highest to lowest amount, showing the top 5.\n- **Hint**: Use `SELECT`, `FROM`, `WHERE total_amount > 100`, `ORDER BY total_amount DESC`, `LIMIT 5`.\n\n---\n\n### Challenge 2 (Filtering & Aliases): Customer Directory\n- **Task**: Find all customers in the `'VIP'` or `'Gold'` loyalty tier whose email ends with `'.com'`. Display their full name as `customer_full_name` and tier as `loyalty_tier`.\n- **Hint**: Use `CONCAT(first_name, ' ', last_name)`, `WHERE tier IN ('VIP', 'Gold') AND email LIKE '%.com'`.\n\n---\n\n### Challenge 3 (Aggregation): Category Revenue Leaderboard\n- **Task**: Calculate the total number of products, average price, and maximum price for each product category. Only show categories where the average price is greater than $50.00.\n- **Hint**: Use `GROUP BY category` and `HAVING AVG(base_price) > 50.00`.\n\n---\n\n### Challenge 4 (Cloud Container Big Data): NYC Taxi Transit Fare Analysis\n- **Task**: Simulate querying fetched AWS S3 NYC Taxi trips. Calculate total trips, average trip distance, and total revenue per pickup vendor.\n- **Hint**: Group by vendor and use `SUM(total_amount)` and `AVG(trip_distance)`.\n\n---\n\n### Challenge 5 (The Grand Master Challenge): Top 3 Spending Customers\n- **Task**: Find the top 3 customers who have spent the most money across all orders. Output their `customer_id`, total orders placed, and total amount spent formatted to 2 decimals.\n- **Hint**: `GROUP BY customer_id`, `ORDER BY SUM(total_amount) DESC LIMIT 3`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       HANDS-ON EXERCISE SCORECARD MATRIX                      |\n+-------------------------------------------------------------------------------+\n  Challenge 1: Basic Projection, Filtering & Sorting        [\u2605\u2606\u2606\u2606\u2606 Easy]\n  Challenge 2: Text Concatenation, Sets & Pattern Matching   [\u2605\u2605\u2606\u2606\u2606 Easy-Medium]\n  Challenge 3: Multi-Column Aggregation with HAVING Filter   [\u2605\u2605\u2605\u2606\u2606 Medium]\n  Challenge 4: Cloud Big Data S3 Transit Analytics           [\u2605\u2605\u2605\u2605\u2606 Advanced]\n  Challenge 5: Top-N Financial Customer Spending Analysis    [\u2605\u2605\u2605\u2605\u2605 Mastery]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Practice writing SQL queries from scratch without copy-pasting.",
          "Verify your results in the SQL Playground using the interactive WASM database engine.",
          "Inspect execution times and query outputs to verify correctness."
        ],
        "exercise": "Run the Challenge 5 query in the SQL Playground to identify the top 3 spending customers.",
        "solution": "-- Challenge 5 Solution: Top 3 Spending Customers\nSELECT \n    customer_id,\n    COUNT(*) AS total_orders_placed,\n    ROUND(SUM(total_amount), 2) AS total_spent_usd\nFROM orders\nGROUP BY customer_id\nORDER BY total_spent_usd DESC\nLIMIT 3;"
      }
    ]
  },
  "2": {
    "month": 1,
    "week": 2,
    "title": "Week 2: Window Functions & Analytical Frameworks",
    "cloudDataset": "AWS Open Data NYC TLC Taxi & Stack Overflow Public Datasets",
    "time": "35 min read",
    "overview": "Understand non-collapsing analytical window functions across partitions. Learn the internal difference between ROW_NUMBER, RANK, and DENSE_RANK, understand sliding window frame physical memory bounds (ROWS vs RANGE), and calculate rolling moving averages and Month-over-Month (MoM) growth rates.",
    "sections": [
      {
        "heading": "1. Window Functions vs GROUP BY: The Fundamental Distinction",
        "content": "While GROUP BY collapses multiple rows into a single aggregate row (losing individual row granularity), a Window Function performs calculations across a set of table rows related to the current row, while retaining the individual identity of every single row in the output.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    GROUP BY vs WINDOW FUNCTIONS (OVER)                        |\n+-------------------------------------------------------------------------------+\n  GROUP BY category:\n    [Row 1: Electronics, $100] --\\\n    [Row 2: Electronics, $200] ---> [Single Output Row: Electronics, Sum: $300]\n    \n  WINDOW FUNCTION OVER (PARTITION BY category):\n    [Row 1: Electronics, $100] ---> [Row 1: Electronics, $100, CatSum: $300]\n    [Row 2: Electronics, $200] ---> [Row 2: Electronics, $200, CatSum: $300]\n    (Every row retains its individual identity and attributes!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Window functions execute during Step 8 (SELECT phase) of the logical query execution pipeline.",
          "You cannot use window functions inside WHERE or HAVING directly; use a CTE or derived table to filter on window outputs."
        ]
      },
      {
        "heading": "2. Ranking Algorithms Comparison",
        "content": "MySQL 8 provides three distinct ranking functions, each handling score ties differently:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       RANKING ALGORITHMS WITH TIED VALUES                     |\n+-------------------------------------------------------------------------------+\n  Score Values:       100       90        90        80        70\n  ROW_NUMBER():        1         2         3         4         5   (Strictly consecutive)\n  RANK():              1         2         2         4         5   (Leaves gaps after ties)\n  DENSE_RANK():        1         2         2         3         4   (Zero gaps! Ideal for Top-N)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use DENSE_RANK() for leaderboard and top-N category ranking so subsequent tiers are not skipped.",
          "Use ROW_NUMBER() when you need unique pagination cursors or deterministic deduplication."
        ]
      },
      {
        "heading": "3. Sliding Frame Specifications (ROWS vs RANGE)",
        "content": "The frame clause specifies which subset of rows within the partition is included in the window calculation. By default, with an ORDER BY, MySQL defaults to `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Specifying physical `ROWS BETWEEN N PRECEDING AND CURRENT ROW` allows calculating running 7-day or 30-day centered moving averages.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       SLIDING WINDOW MOVING AVERAGE                           |\n+-------------------------------------------------------------------------------+\n  [Day 1]  [Day 2]  [Day 3]  [Day 4]  [Day 5]  [Day 6]  [Day 7]  ...\n  |------- Window Frame (7 Days) -------|\n                    Average calculated and attached to Day 7!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "RANGE evaluates duplicate order values identically, while ROWS counts physical offset rows regardless of value ties.",
          "Using LAST_VALUE() with default framing returns the current row! You must explicitly write `ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING`."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "NYC Taxi Revenue Velocity & Moving Averages",
      "source": "AWS Open Data Registry (s3://nyc-tlc/trip data/)",
      "table": "nyc_yellow_taxi_trips (1.5B+ rows)",
      "description": "Tracking daily transit fare volumes across New York boroughs, computing 7-day moving averages to smooth weekend transit spikes, and calculating day-over-day growth rates via LAG()."
    },
    "codeTitle": "7-Day Centered Moving Sales Average & LAG Velocity",
    "code": "-- 7-Day Centered Moving Average and Day-over-Day Revenue Velocity\nWITH daily_revenue AS (\n    SELECT \n        DATE(order_date) AS sales_date,\n        COUNT(*) AS total_orders,\n        ROUND(SUM(total_amount), 2) AS daily_rev\n    FROM orders\n    GROUP BY DATE(order_date)\n)\nSELECT \n    sales_date,\n    daily_rev,\n    -- 1. Previous day's revenue via LAG()\n    LAG(daily_rev, 1) OVER (ORDER BY sales_date) AS prev_day_rev,\n    -- 2. Day-over-Day Growth Percentage\n    ROUND(\n        (daily_rev - LAG(daily_rev, 1) OVER (ORDER BY sales_date)) \n        * 100.0 / LAG(daily_rev, 1) OVER (ORDER BY sales_date), \n        2\n    ) AS dod_growth_pct,\n    -- 3. 7-Day Centered Moving Average (3 days before + current + 3 days after)\n    ROUND(AVG(daily_rev) OVER (\n        ORDER BY sales_date \n        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING\n    ), 2) AS moving_avg_7day\nFROM daily_revenue\nORDER BY sales_date DESC\nLIMIT 14;",
    "codeExplanation": "The CTE rolls up raw orders into daily revenue. In the main query, `LAG(daily_rev, 1)` pulls the previous day's figure to compute percent velocity, while `AVG() OVER (ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING)` computes a smooth 7-day centered moving average.",
    "pitfalls": "Senior DBA Gotcha: Sorting inside window partitions (`OVER (PARTITION BY ... ORDER BY ...)`) without an appropriate covering composite index forces MySQL to build an in-memory or on-disk filesort for every partition, severely bottlenecking multi-million row queries.",
    "quiz": {
      "question": "If two employees tie for 2nd highest salary, what rank does DENSE_RANK() assign to the next highest salary?",
      "options": [
        "Rank 4",
        "Rank 3",
        "Rank 2.5",
        "Rank 1"
      ],
      "answer": 1,
      "explanation": "DENSE_RANK() does not skip rank values after ties. The tied employees both receive rank 2, and the next employee receives rank 3."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 2: Window Functions & Analytical Frameworks",
        "overview": "Understand non-collapsing analytical window functions across partitions. Learn the internal difference between ROW_NUMBER, RANK, and DENSE_RANK, understand sliding window frame physical memory bounds (ROWS vs RANGE), and calculate rolling moving averages and Month-over-Month (MoM) growth rates.",
        "content": "Welcome to Week 2. In this chapter, we bridge fundamental SQL with Week 2: Window Functions & Analytical Frameworks. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC TLC Taxi & Stack Overflow Public Datasets and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC TLC Taxi & Stack Overflow Public Datasets. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC TLC Taxi & Stack Overflow Public Datasets"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Window Functions vs GROUP BY: The Fundamental Distinction",
        "overview": "First major theoretical principle of this module.",
        "content": "While GROUP BY collapses multiple rows into a single aggregate row (losing individual row granularity), a Window Function performs calculations across a set of table rows related to the current row, while retaining the individual identity of every single row in the output.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    GROUP BY vs WINDOW FUNCTIONS (OVER)                        |\n+-------------------------------------------------------------------------------+\n  GROUP BY category:\n    [Row 1: Electronics, $100] --\\\n    [Row 2: Electronics, $200] ---> [Single Output Row: Electronics, Sum: $300]\n    \n  WINDOW FUNCTION OVER (PARTITION BY category):\n    [Row 1: Electronics, $100] ---> [Row 1: Electronics, $100, CatSum: $300]\n    [Row 2: Electronics, $200] ---> [Row 2: Electronics, $200, CatSum: $300]\n    (Every row retains its individual identity and attributes!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Window functions execute during Step 8 (SELECT phase) of the logical query execution pipeline.",
          "You cannot use window functions inside WHERE or HAVING directly; use a CTE or derived table to filter on window outputs."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Ranking Algorithms Comparison",
        "overview": "Second major theoretical principle of this module.",
        "content": "MySQL 8 provides three distinct ranking functions, each handling score ties differently:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       RANKING ALGORITHMS WITH TIED VALUES                     |\n+-------------------------------------------------------------------------------+\n  Score Values:       100       90        90        80        70\n  ROW_NUMBER():        1         2         3         4         5   (Strictly consecutive)\n  RANK():              1         2         2         4         5   (Leaves gaps after ties)\n  DENSE_RANK():        1         2         2         3         4   (Zero gaps! Ideal for Top-N)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use DENSE_RANK() for leaderboard and top-N category ranking so subsequent tiers are not skipped.",
          "Use ROW_NUMBER() when you need unique pagination cursors or deterministic deduplication."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - 7-Day Centered Moving Sales Average & LAG Velocity",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nThe CTE rolls up raw orders into daily revenue. In the main query, `LAG(daily_rev, 1)` pulls the previous day's figure to compute percent velocity, while `AVG() OVER (ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING)` computes a smooth 7-day centered moving average.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- 7-Day Centered Moving Average and Day-over-Day Revenue Velocity\nWITH daily_revenue AS (\n    SELECT \n        DATE(order_date) AS sales_date,\n        COUNT(*) AS total_orders,\n        ROUND(SUM(total_amount), 2) AS daily_rev\n    FROM orders\n    GROUP BY DATE(order_date)\n)\nSELECT \n    sales_date,\n    daily_rev,\n    -- 1. Previous day's revenue via LAG()\n    LAG(daily_rev, 1) OVER (ORDER BY sales_date) AS prev_day_rev,\n    -- 2. Day-over-Day Growth Percentage\n    ROUND(\n        (daily_rev - LAG(daily_rev, 1) OVER (ORDER BY sales_date)) \n        * 100.0 / LAG(daily_rev, 1) OVER (ORDER BY sales_date), \n        2\n    ) AS dod_growth_pct,\n    -- 3. 7-Day Centered Moving Average (3 days before + current + 3 days after)\n    ROUND(AVG(daily_rev) OVER (\n        ORDER BY sales_date \n        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING\n    ), 2) AS moving_avg_7day\nFROM daily_revenue\nORDER BY sales_date DESC\nLIMIT 14;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Sorting inside window partitions (`OVER (PARTITION BY ... ORDER BY ...)`) without an appropriate covering composite index forces MySQL to build an in-memory or on-disk filesort for every partition, severely bottlenecking multi-million row queries.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- 7-Day Centered Moving Average and Day-over-Day Revenue Velocity\nWITH daily_revenue AS (\n    SELECT \n        DATE(order_date) AS sales_date,\n        COUNT(*) AS total_orders,\n        ROUND(SUM(total_amount), 2) AS daily_rev\n    FROM orders\n    GROUP BY DATE(order_date)\n)\nSELECT \n    sales_date,\n    daily_rev,\n    -- 1. Previous day's revenue via LAG()\n    LAG(daily_rev, 1) OVER (ORDER BY sales_date) AS prev_day_rev,\n    -- 2. Day-over-Day Growth Percentage\n    ROUND(\n        (daily_rev - LAG(daily_rev, 1) OVER (ORDER BY sales_date)) \n        * 100.0 / LAG(daily_rev, 1) OVER (ORDER BY sales_date), \n        2\n    ) AS dod_growth_pct,\n    -- 3. 7-Day Centered Moving Average (3 days before + current + 3 days after)\n    ROUND(AVG(daily_rev) OVER (\n        ORDER BY sales_date \n        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING\n    ), 2) AS moving_avg_7day\nFROM daily_revenue\nORDER BY sales_date DESC\nLIMIT 14;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 2:\\n\\n**Question**: If two employees tie for 2nd highest salary, what rank does DENSE_RANK() assign to the next highest salary?\\n\\n**Explanation**: DENSE_RANK() does not skip rank values after ties. The tied employees both receive rank 2, and the next employee receives rank 3.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "If two employees tie for 2nd highest salary, what rank does DENSE_RANK() assign to the next highest salary?",
        "solution": "-- Correct Answer: Option 2 (Rank 3)"
      }
    ]
  },
  "3": {
    "month": 1,
    "week": 3,
    "title": "Week 3: Recursive CTEs & Git Commit Hierarchical DAGs",
    "cloudDataset": "Google Cloud GitHub Public Archive (bigquery-public-data.github_repos)",
    "time": "30 min read",
    "overview": "Learn how to query complex graph structures, multi-level organization hierarchies, bill-of-materials, and Git commit Directed Acyclic Graphs (DAGs) using MySQL 8 Common Table Expressions (WITH RECURSIVE). Master recursion depth guards and dynamic calendar generators.",
    "sections": [
      {
        "heading": "1. Anatomy of a Recursive Common Table Expression",
        "content": "A Recursive CTE solves graph problems that cannot be answered with fixed joins because the traversal depth is unknown at query compile time. It is structured into three mandatory parts connected by UNION ALL:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       RECURSIVE CTE EXECUTION ENGINE                          |\n+-------------------------------------------------------------------------------+\n  [1. Anchor Member]:    Initial non-recursive SELECT (Seed row: depth = 1)\n                                     |\n                                UNION ALL\n                                     |\n  [2. Recursive Member]: Join CTE back to table on parent_id (depth = depth + 1)\n                                     |\n  [3. Termination Guard]: WHERE depth < max_allowed (Stops infinite cycles!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "UNION ALL is required; standard UNION triggers deduplication passes on intermediate recursion tables, causing major performance degradation.",
          "Always increment and bound a `depth` column to prevent cyclical graph traversal from locking the server thread."
        ]
      },
      {
        "heading": "2. Traversing Git Commit DAGs (Google Cloud GitHub Archive)",
        "content": "In Git, every commit points backwards to its parent SHA-1 hash (`parent_sha` -> `commit_sha`). When exploring merge histories, release branches, or cherry-picks across millions of commits in the GitHub Public Archive, recursive CTEs allow traversing backward through parent lineages.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         GIT COMMIT LINEAGE TRAVERSAL                          |\n+-------------------------------------------------------------------------------+\n  Commit: [ HEAD (c3d4) ]  (Depth 1 - Anchor)\n             |\n             v parent_sha\n  Commit: [ v2.1 (b2c3) ]  (Depth 2 - Iteration 1)\n             |\n             v parent_sha\n  Commit: [ v2.0 (a1b2) ]  (Depth 3 - Iteration 2)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Ensure parent_sha and commit_sha are indexed with binary charset (e.g. BINARY(20) or CHAR(40) CHARACTER SET ascii) to avoid collation conversion overhead during joins.",
          "Check system variable `cte_max_recursion_depth` (default 1000) if deep tree searches abort prematurely."
        ]
      },
      {
        "heading": "3. Dynamic Calendar Date-Series Generators",
        "content": "Real-world transactional reports often have missing dates where zero sales occurred. Using a recursive CTE, you can synthesize a contiguous 365-day calendar table on the fly and LEFT JOIN your sales data, guaranteeing zero-filled days without maintaining static tables.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      SYNTHESIZING CONTIGUOUS DATE SERIES                      |\n+-------------------------------------------------------------------------------+\n  Seed:      '2023-01-01'\n  Recurse:   '2023-01-01' + 1 Day -> '2023-01-02' -> ... -> '2023-01-31'\n  LEFT JOIN: orders ON calendar_date = order_date (Days with 0 orders show $0.00!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Avoid building physical 'numbers' or 'dates' tables; recursive CTEs generate sequences in memory with zero storage footprint.",
          "Use COALESCE(SUM(amount), 0) on the LEFT JOIN output to replace NULL values on days with no activity."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Git Commit Lineage & Fork Networks",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.github_repos.commits)",
      "table": "github_commits (Terabytes of commit logs)",
      "description": "Traversing multi-hop parent commits in high-profile open-source repositories to audit commit provenance, ancestor chains, and branch divergences."
    },
    "codeTitle": "Multi-Hop Git Commit Ancestor Traversal",
    "code": "-- Recursive CTE: Multi-Hop Git Commit Ancestor DAG Traversal\nWITH RECURSIVE git_lineage AS (\n    -- 1. Anchor Member: Start at the HEAD commit\n    SELECT \n        commit_sha,\n        parent_sha,\n        author_name,\n        commit_date,\n        message,\n        1 AS depth\n    FROM github_commits\n    WHERE commit_sha = 'c3d4e5f6a7b8c9d0'\n    \n    UNION ALL\n    \n    -- 2. Recursive Member: Traverse to parent commits\n    SELECT \n        parent.commit_sha,\n        parent.parent_sha,\n        parent.author_name,\n        parent.commit_date,\n        parent.message,\n        child.depth + 1\n    FROM github_commits parent\n    JOIN git_lineage child ON parent.commit_sha = child.parent_sha\n    WHERE child.depth < 10                -- Hard limit: 10 generations deep\n)\nSELECT \n    depth,\n    commit_sha,\n    author_name,\n    commit_date,\n    message\nFROM git_lineage\nORDER BY depth ASC;",
    "codeExplanation": "The Anchor queries the target commit at `depth = 1`. The Recursive Member joins `github_commits` where `commit_sha` matches the previous iteration's `parent_sha`. The condition `depth < 10` guarantees termination even in cyclical graph topologies.",
    "pitfalls": "Senior DBA Gotcha: If graph data contains cycles (e.g. A -> B -> A), an unbounded recursive query will loop indefinitely until it hits `cte_max_recursion_depth` or exhausts temp-table disk space. Always include an iteration counter guard (`depth < N`).",
    "quiz": {
      "question": "What is the consequence of using UNION instead of UNION ALL in a recursive CTE?",
      "options": [
        "MySQL throws an immediate syntax error",
        "MySQL performs an expensive deduplication sort on every iteration, severely degrading performance",
        "The query terminates immediately after the anchor row",
        "The depth column is reset to 0"
      ],
      "answer": 1,
      "explanation": "Standard UNION executes a distinct sort pass over intermediate tables on every recursive hop, causing massive CPU and temporary disk overhead. Always use UNION ALL."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 3: Recursive CTEs & Git Commit Hierarchical DAGs",
        "overview": "Learn how to query complex graph structures, multi-level organization hierarchies, bill-of-materials, and Git commit Directed Acyclic Graphs (DAGs) using MySQL 8 Common Table Expressions (WITH RECURSIVE). Master recursion depth guards and dynamic calendar generators.",
        "content": "Welcome to Week 3. In this chapter, we bridge fundamental SQL with Week 3: Recursive CTEs & Git Commit Hierarchical DAGs. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud GitHub Public Archive (bigquery-public-data.github_repos) and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud GitHub Public Archive (bigquery-public-data.github_repos). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud GitHub Public Archive (bigquery-public-data.github_repos)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Anatomy of a Recursive Common Table Expression",
        "overview": "First major theoretical principle of this module.",
        "content": "A Recursive CTE solves graph problems that cannot be answered with fixed joins because the traversal depth is unknown at query compile time. It is structured into three mandatory parts connected by UNION ALL:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       RECURSIVE CTE EXECUTION ENGINE                          |\n+-------------------------------------------------------------------------------+\n  [1. Anchor Member]:    Initial non-recursive SELECT (Seed row: depth = 1)\n                                     |\n                                UNION ALL\n                                     |\n  [2. Recursive Member]: Join CTE back to table on parent_id (depth = depth + 1)\n                                     |\n  [3. Termination Guard]: WHERE depth < max_allowed (Stops infinite cycles!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "UNION ALL is required; standard UNION triggers deduplication passes on intermediate recursion tables, causing major performance degradation.",
          "Always increment and bound a `depth` column to prevent cyclical graph traversal from locking the server thread."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Traversing Git Commit DAGs (Google Cloud GitHub Archive)",
        "overview": "Second major theoretical principle of this module.",
        "content": "In Git, every commit points backwards to its parent SHA-1 hash (`parent_sha` -> `commit_sha`). When exploring merge histories, release branches, or cherry-picks across millions of commits in the GitHub Public Archive, recursive CTEs allow traversing backward through parent lineages.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         GIT COMMIT LINEAGE TRAVERSAL                          |\n+-------------------------------------------------------------------------------+\n  Commit: [ HEAD (c3d4) ]  (Depth 1 - Anchor)\n             |\n             v parent_sha\n  Commit: [ v2.1 (b2c3) ]  (Depth 2 - Iteration 1)\n             |\n             v parent_sha\n  Commit: [ v2.0 (a1b2) ]  (Depth 3 - Iteration 2)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Ensure parent_sha and commit_sha are indexed with binary charset (e.g. BINARY(20) or CHAR(40) CHARACTER SET ascii) to avoid collation conversion overhead during joins.",
          "Check system variable `cte_max_recursion_depth` (default 1000) if deep tree searches abort prematurely."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Multi-Hop Git Commit Ancestor Traversal",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nThe Anchor queries the target commit at `depth = 1`. The Recursive Member joins `github_commits` where `commit_sha` matches the previous iteration's `parent_sha`. The condition `depth < 10` guarantees termination even in cyclical graph topologies.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Recursive CTE: Multi-Hop Git Commit Ancestor DAG Traversal\nWITH RECURSIVE git_lineage AS (\n    -- 1. Anchor Member: Start at the HEAD commit\n    SELECT \n        commit_sha,\n        parent_sha,\n        author_name,\n        commit_date,\n        message,\n        1 AS depth\n    FROM github_commits\n    WHERE commit_sha = 'c3d4e5f6a7b8c9d0'\n    \n    UNION ALL\n    \n    -- 2. Recursive Member: Traverse to parent commits\n    SELECT \n        parent.commit_sha,\n        parent.parent_sha,\n        parent.author_name,\n        parent.commit_date,\n        parent.message,\n        child.depth + 1\n    FROM github_commits parent\n    JOIN git_lineage child ON parent.commit_sha = child.parent_sha\n    WHERE child.depth < 10                -- Hard limit: 10 generations deep\n)\nSELECT \n    depth,\n    commit_sha,\n    author_name,\n    commit_date,\n    message\nFROM git_lineage\nORDER BY depth ASC;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: If graph data contains cycles (e.g. A -> B -> A), an unbounded recursive query will loop indefinitely until it hits `cte_max_recursion_depth` or exhausts temp-table disk space. Always include an iteration counter guard (`depth < N`).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Recursive CTE: Multi-Hop Git Commit Ancestor DAG Traversal\nWITH RECURSIVE git_lineage AS (\n    -- 1. Anchor Member: Start at the HEAD commit\n    SELECT \n        commit_sha,\n        parent_sha,\n        author_name,\n        commit_date,\n        message,\n        1 AS depth\n    FROM github_commits\n    WHERE commit_sha = 'c3d4e5f6a7b8c9d0'\n    \n    UNION ALL\n    \n    -- 2. Recursive Member: Traverse to parent commits\n    SELECT \n        parent.commit_sha,\n        parent.parent_sha,\n        parent.author_name,\n        parent.commit_date,\n        parent.message,\n        child.depth + 1\n    FROM github_commits parent\n    JOIN git_lineage child ON parent.commit_sha = child.parent_sha\n    WHERE child.depth < 10                -- Hard limit: 10 generations deep\n)\nSELECT \n    depth,\n    commit_sha,\n    author_name,\n    commit_date,\n    message\nFROM git_lineage\nORDER BY depth ASC;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 3:\\n\\n**Question**: What is the consequence of using UNION instead of UNION ALL in a recursive CTE?\\n\\n**Explanation**: Standard UNION executes a distinct sort pass over intermediate tables on every recursive hop, causing massive CPU and temporary disk overhead. Always use UNION ALL.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What is the consequence of using UNION instead of UNION ALL in a recursive CTE?",
        "solution": "-- Correct Answer: Option 2 (MySQL performs an expensive deduplication sort on every iteration, severely degrading performance)"
      }
    ]
  },
  "4": {
    "month": 1,
    "week": 4,
    "title": "Week 4: MySQL 8 Native JSON & Full-Text Search (130M+ Amazon Reviews)",
    "cloudDataset": "AWS Open Data Amazon Customer Reviews PDS (s3://amazon-reviews-pds/)",
    "time": "35 min read",
    "overview": "Learn how MySQL 8 bridges relational schemas with document stores. Master binary JSON storage, path extraction operators (->, ->>), the revolutionary JSON_TABLE relational projector, virtual generated column indexing, and InnoDB Full-Text Search (FTS) inverted indexes on 130M+ Amazon product reviews.",
    "sections": [
      {
        "heading": "1. Binary JSON Storage & Path Extraction Operators",
        "content": "Unlike PostgreSQL which stores JSON as raw text or JSONB, MySQL 8 converts JSON documents into an internal binary format that allows looking up keys without parsing the entire text. MySQL provides two fundamental extraction operators:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         MYSQL 8 JSON PATH OPERATORS                           |\n+-------------------------------------------------------------------------------+\n  Operator ->   (JSON Extract):   payload->'$.rating'    -> '\"5\"'  (Quoted JSON string)\n  Operator ->>  (Unquote Extract): payload->>'$.rating'   -> '5'    (Clean unquoted text!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use ->> when extracting strings intended for comparisons, joins, or mathematical functions to avoid invisible quote-matching bugs.",
          "JSON documents are limited to 4GB, but production best practice is keeping documents below 1MB to prevent buffer pool memory exhaustion."
        ]
      },
      {
        "heading": "2. Indexing JSON via Generated Virtual Columns",
        "content": "You cannot place a traditional B+ Tree index directly on an entire JSON column. Instead, MySQL allows defining a Generated Virtual Column that extracts the specific JSON key and indexing that virtual column with standard B+ Tree indexes:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    VIRTUAL COLUMN INDEXING ON JSON ATTRIBUTE                  |\n+-------------------------------------------------------------------------------+\n  [Raw JSON Document]:   {\"user_id\": 42, \"device\": \"iOS\", \"ip\": \"192.168.1.1\"}\n                                        |\n  [Virtual Column]:      device_type VARCHAR(32) GENERATED ALWAYS AS (payload->>'$.device')\n                                        |\n  [B+ Tree Secondary Index]: CREATE INDEX idx_device ON telemetry(device_type);\n  (Point lookups execute in 0.2ms using standard B+ Tree traversal!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Virtual generated columns consume 0 bytes of disk storage for the column itself; only the secondary B+ Tree index consumes space.",
          "Queries filtering on `payload->>'$.device'` automatically leverage the index on `device_type` via the optimizer's expression matcher!"
        ]
      },
      {
        "heading": "3. InnoDB Full-Text Search Inverted Indexes (130M+ Amazon Reviews)",
        "content": "Traditional B+ Tree indexes cannot optimize wildcard text searches like `WHERE body LIKE '%battery life%'` (which causes a full table scan). InnoDB Full-Text Search builds an inverted word index (mapping tokens to document IDs) with auxiliary tables (`FTS_*_INDEX_*`), supporting Boolean Mode search with weighted relevance scoring.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    FULL-TEXT SEARCH INVERTED INDEX ARCHITECTURE               |\n+-------------------------------------------------------------------------------+\n  Document 101: \"Fast charging battery camera\"\n  Document 102: \"Terrible battery life defective\"\n  \n  Inverted Word Index:\n    'battery'   -> [Doc 101, Doc 102]\n    'camera'    -> [Doc 101]\n    'defective' -> [Doc 102]\n  Query: MATCH(body) AGAINST('+battery +camera -defective' IN BOOLEAN MODE)\n  (Result: Doc 101 matches instantly without scanning millions of rows!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "In Boolean Mode, `+` denotes mandatory terms, `-` denotes excluded terms, and quotes `\"...\"` enforce phrase proximity.",
          "MATCH() AGAINST() returns a floating-point relevance score that can be sorted in ORDER BY for natural search ranking."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Amazon Customer Reviews NLP & Sentiment Filtering",
      "source": "AWS Open Data Registry (s3://amazon-reviews-pds/tsv/)",
      "table": "amazon_product_reviews (130M+ rows)",
      "description": "Searching across 130 million product reviews across 20+ years for product defect terms and battery sentiment using InnoDB Full-Text Search with sub-millisecond latency."
    },
    "codeTitle": "Boolean Mode Full-Text Search with Relevancy Ranking",
    "code": "-- Full-Text Search in Boolean Mode on Amazon Customer Reviews\n-- Matches positive camera and battery mentions while excluding defective units\nSELECT \n    review_id,\n    product_title,\n    star_rating,\n    helpful_votes,\n    review_headline,\n    -- Calculate Full-Text Relevance Score\n    ROUND(\n        MATCH(review_headline, review_body) \n        AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE), \n        4\n    ) AS relevancy_score\nFROM amazon_product_reviews\nWHERE MATCH(review_headline, review_body) \n      AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE)\n  AND star_rating >= 4\nORDER BY relevancy_score DESC, helpful_votes DESC\nLIMIT 10;",
    "codeExplanation": "The query uses `MATCH(...) AGAINST(...)` in Boolean mode. `+battery` requires the word 'battery', `+\"fast charging\"` requires the exact phrase, and `-defective` excludes negative reviews. The calculated relevance score orders the top results.",
    "pitfalls": "Senior DBA Gotcha: InnoDB FTS drops words shorter than `innodb_ft_min_token_size` (default: 3 chars) or present in the stopword list. Searching for 'AI' or 'DB' returns 0 rows unless `innodb_ft_min_token_size` is lowered to 2 in my.cnf and the index is rebuilt.",
    "quiz": {
      "question": "What happens if you execute a Full-Text Search for a 2-letter word like '5G' under default InnoDB settings?",
      "options": [
        "MySQL throws an error code 1214",
        "It returns 0 rows because default innodb_ft_min_token_size is 3 characters",
        "It switches to a full table scan automatically",
        "It matches all rows containing the letter 5"
      ],
      "answer": 1,
      "explanation": "By default, InnoDB ignores words with fewer than 3 characters (`innodb_ft_min_token_size = 3`). To index 2-letter terms like '5G' or 'AI', the parameter must be adjusted and the index rebuilt."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 4: MySQL 8 Native JSON & Full-Text Search (130M+ Amazon Reviews)",
        "overview": "Learn how MySQL 8 bridges relational schemas with document stores. Master binary JSON storage, path extraction operators (->, ->>), the revolutionary JSON_TABLE relational projector, virtual generated column indexing, and InnoDB Full-Text Search (FTS) inverted indexes on 130M+ Amazon product reviews.",
        "content": "Welcome to Week 4. In this chapter, we bridge fundamental SQL with Week 4: MySQL 8 Native JSON & Full-Text Search (130M+ Amazon Reviews). We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data Amazon Customer Reviews PDS (s3://amazon-reviews-pds/) and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data Amazon Customer Reviews PDS (s3://amazon-reviews-pds/). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data Amazon Customer Reviews PDS (s3://amazon-reviews-pds/)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Binary JSON Storage & Path Extraction Operators",
        "overview": "First major theoretical principle of this module.",
        "content": "Unlike PostgreSQL which stores JSON as raw text or JSONB, MySQL 8 converts JSON documents into an internal binary format that allows looking up keys without parsing the entire text. MySQL provides two fundamental extraction operators:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         MYSQL 8 JSON PATH OPERATORS                           |\n+-------------------------------------------------------------------------------+\n  Operator ->   (JSON Extract):   payload->'$.rating'    -> '\"5\"'  (Quoted JSON string)\n  Operator ->>  (Unquote Extract): payload->>'$.rating'   -> '5'    (Clean unquoted text!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use ->> when extracting strings intended for comparisons, joins, or mathematical functions to avoid invisible quote-matching bugs.",
          "JSON documents are limited to 4GB, but production best practice is keeping documents below 1MB to prevent buffer pool memory exhaustion."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Indexing JSON via Generated Virtual Columns",
        "overview": "Second major theoretical principle of this module.",
        "content": "You cannot place a traditional B+ Tree index directly on an entire JSON column. Instead, MySQL allows defining a Generated Virtual Column that extracts the specific JSON key and indexing that virtual column with standard B+ Tree indexes:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    VIRTUAL COLUMN INDEXING ON JSON ATTRIBUTE                  |\n+-------------------------------------------------------------------------------+\n  [Raw JSON Document]:   {\"user_id\": 42, \"device\": \"iOS\", \"ip\": \"192.168.1.1\"}\n                                        |\n  [Virtual Column]:      device_type VARCHAR(32) GENERATED ALWAYS AS (payload->>'$.device')\n                                        |\n  [B+ Tree Secondary Index]: CREATE INDEX idx_device ON telemetry(device_type);\n  (Point lookups execute in 0.2ms using standard B+ Tree traversal!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Virtual generated columns consume 0 bytes of disk storage for the column itself; only the secondary B+ Tree index consumes space.",
          "Queries filtering on `payload->>'$.device'` automatically leverage the index on `device_type` via the optimizer's expression matcher!"
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Boolean Mode Full-Text Search with Relevancy Ranking",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nThe query uses `MATCH(...) AGAINST(...)` in Boolean mode. `+battery` requires the word 'battery', `+\"fast charging\"` requires the exact phrase, and `-defective` excludes negative reviews. The calculated relevance score orders the top results.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Full-Text Search in Boolean Mode on Amazon Customer Reviews\n-- Matches positive camera and battery mentions while excluding defective units\nSELECT \n    review_id,\n    product_title,\n    star_rating,\n    helpful_votes,\n    review_headline,\n    -- Calculate Full-Text Relevance Score\n    ROUND(\n        MATCH(review_headline, review_body) \n        AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE), \n        4\n    ) AS relevancy_score\nFROM amazon_product_reviews\nWHERE MATCH(review_headline, review_body) \n      AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE)\n  AND star_rating >= 4\nORDER BY relevancy_score DESC, helpful_votes DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: InnoDB FTS drops words shorter than `innodb_ft_min_token_size` (default: 3 chars) or present in the stopword list. Searching for 'AI' or 'DB' returns 0 rows unless `innodb_ft_min_token_size` is lowered to 2 in my.cnf and the index is rebuilt.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Full-Text Search in Boolean Mode on Amazon Customer Reviews\n-- Matches positive camera and battery mentions while excluding defective units\nSELECT \n    review_id,\n    product_title,\n    star_rating,\n    helpful_votes,\n    review_headline,\n    -- Calculate Full-Text Relevance Score\n    ROUND(\n        MATCH(review_headline, review_body) \n        AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE), \n        4\n    ) AS relevancy_score\nFROM amazon_product_reviews\nWHERE MATCH(review_headline, review_body) \n      AGAINST('+battery +\"fast charging\" -defective' IN BOOLEAN MODE)\n  AND star_rating >= 4\nORDER BY relevancy_score DESC, helpful_votes DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 4:\\n\\n**Question**: What happens if you execute a Full-Text Search for a 2-letter word like '5G' under default InnoDB settings?\\n\\n**Explanation**: By default, InnoDB ignores words with fewer than 3 characters (`innodb_ft_min_token_size = 3`). To index 2-letter terms like '5G' or 'AI', the parameter must be adjusted and the index rebuilt.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What happens if you execute a Full-Text Search for a 2-letter word like '5G' under default InnoDB settings?",
        "solution": "-- Correct Answer: Option 2 (It returns 0 rows because default innodb_ft_min_token_size is 3 characters)"
      }
    ]
  },
  "5": {
    "month": 2,
    "week": 5,
    "title": "Week 5: InnoDB Architecture & Memory/Disk Structures",
    "cloudDataset": "Google Cloud GitHub Commits & AWS NYC Taxi Ingestion",
    "time": "40 min read",
    "overview": "Deep dive into the internal anatomy of the InnoDB storage engine. Understand Buffer Pool memory segmentation (5/8 Young vs 3/8 Old midpoint insertion), Redo Log Write-Ahead Logging (WAL) circular buffers, the Doublewrite Buffer torn-page crash protection, and 16KB physical page layout on disk.",
    "sections": [
      {
        "heading": "1. Buffer Pool Architecture & LRU Midpoint Insertion",
        "content": "The Buffer Pool is the memory heart of MySQL. Because enterprise tables exceed available RAM, InnoDB manages memory using an advanced segmented LRU (Least Recently Used) list with midpoint insertion to prevent full table scans from evicting hot production caches:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       BUFFER POOL SEGMENTED LRU LIST                          |\n+-------------------------------------------------------------------------------+\n  [Head: Most Recently Used]                                 [Tail: Oldest Page]\n  |<----------------- 5/8 Young Sublist ----------------->|<--- 3/8 Old Sublist --->|\n  | [Hot Page 1] <-> [Hot Page 2] <-> [Hot Page 3] ... <->| [Old 1] <-> [Old 2]   |\n                                                         ^\n                                                         |\n                                     [Midpoint Insertion Point: 37% from Tail]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "New pages read from disk are inserted at the midpoint (the head of the Old sublist), NOT at the very front of the LRU list.",
          "Pages must remain accessed for longer than `innodb_old_blocks_time` (default 1000ms) before being promoted to the Young sublist, preventing batch scans from flushing hot data.",
          "On servers with > 32GB RAM, split into multiple buffer pool instances (`innodb_buffer_pool_instances = 8` to `16`) to eliminate mutex contention."
        ]
      },
      {
        "heading": "2. Write-Ahead Logging (WAL) & Redo Log Circular Rings",
        "content": "When an INSERT or UPDATE occurs, writing changes immediately to disk data files would cause catastrophic random I/O bottlenecks. Instead, InnoDB writes sequentially to the in-memory Redo Log Buffer and flushes to the Redo Log files on disk. Dirty data pages in the Buffer Pool are flushed to tablespace `.ibd` files asynchronously later.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        REDO LOG CIRCULAR RING BUFFER                          |\n+-------------------------------------------------------------------------------+\n  Redo Log File 1              Redo Log File 2              Redo Log File 3\n  [=== Written ===]  --->      [=== Written ===]  --->      [ Free Space ]\n         ^                            ^\n         | Write Pointer (Current)    | Checkpoint Pointer (Last Flushed Page)\n         +----------------------------+\n  (Distance between Write and Checkpoint = Checkpoint Age. If full, DB freezes to flush!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Redo logs guarantee ACID Durability (Crash Recovery). If the server loses power, InnoDB replays redo logs on startup to restore unwritten changes.",
          "If `innodb_log_file_size` is too small, MySQL triggers emergency synchronous flushing, freezing query execution during heavy write bursts."
        ]
      },
      {
        "heading": "3. The Doublewrite Buffer & Torn-Page Protection",
        "content": "Operating systems and hard disk controllers write in 4KB sectors, but InnoDB data pages are 16KB. If a hardware failure occurs mid-write, a 16KB page becomes half-written (torn page). Redo logs cannot recover a torn page because redo entries contain delta changes, not full page copies. The Doublewrite buffer solves this by writing the 16KB page contiguously to a reserved disk area before writing to the actual table file.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       DOUBLEWRITE BUFFER CRASH RECOVERY                       |\n+-------------------------------------------------------------------------------+\n  Buffer Pool Dirty Page (16KB)\n              |\n              +---> Step 1: Contiguous write to Doublewrite Buffer (Disk: 16KB intact)\n              |\n              +---> Step 2: Random write to Table File (.ibd) -> [POWER OUTAGE CRASH!]\n                                                                (Page is torn: 4KB/16KB)\n  On Restart: InnoDB detects page checksum mismatch -> Copies intact 16KB page from\n              Doublewrite Buffer -> Applies Redo Log -> Zero Data Loss!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Never disable `innodb_doublewrite` in production unless running on ZFS or specialized enterprise storage that natively guarantees atomic 16KB writes."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Buffer Pool Churn During Big Data Ingestion",
      "source": "AWS Open Data NYC Taxi & Google Cloud GitHub Commits",
      "table": "nyc_yellow_taxi_trips (500 GB)",
      "description": "Demonstrating how streaming millions of cloud records from AWS S3 without tuning innodb_old_blocks_time flushes production cache, and how proper Buffer Pool sizing maintains 99.8% cache hit ratios."
    },
    "codeTitle": "Inspecting Buffer Pool Hit Ratio & Dirty Page Percentage",
    "code": "-- Inspecting Real-Time InnoDB Buffer Pool Health & Hit Ratios\nSELECT \n    ROUND(\n        (1 - (variable_value / \n            (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_read_requests')\n        )) * 100, \n        4\n    ) AS buffer_pool_hit_ratio_pct\nFROM performance_schema.global_status \nWHERE variable_name = 'Innodb_buffer_pool_reads';\n\n-- Check Dirty Page Saturation (Dirty Pages vs Total Buffer Pool Capacity)\nSELECT \n    dirty.variable_value AS dirty_pages_in_ram,\n    total.variable_value AS total_pages_capacity,\n    ROUND((dirty.variable_value * 100.0 / total.variable_value), 2) AS dirty_page_saturation_pct\nFROM performance_schema.global_status dirty\nJOIN performance_schema.global_status total \n    ON total.variable_name = 'Innodb_buffer_pool_pages_total'\nWHERE dirty.variable_name = 'Innodb_buffer_pool_pages_dirty';",
    "codeExplanation": "Queries MySQL status counters: `Innodb_buffer_pool_read_requests` (logical memory reads) vs `Innodb_buffer_pool_reads` (physical disk reads). In healthy production systems, the hit ratio must remain above 99.0%.",
    "pitfalls": "Senior DBA Gotcha: Sizing `innodb_buffer_pool_size` to 95% of total server RAM causes Linux OOM (Out Of Memory) Killer to kill `mysqld`. Always leave 20-25% of RAM for OS buffers, connection memory (`sort_buffer_size`, `join_buffer_size`), and dictionary caches.",
    "quiz": {
      "question": "What is the primary purpose of the InnoDB Doublewrite Buffer?",
      "options": [
        "It duplicates all data to a secondary replica server",
        "It protects against torn pages caused by OS crashes during 16KB page writes",
        "It speeds up SELECT queries by caching results twice",
        "It encrypts passwords on disk"
      ],
      "answer": 1,
      "explanation": "Because operating systems write in 4KB chunks while InnoDB uses 16KB pages, an unexpected crash leaves half-written pages. The Doublewrite buffer guarantees an intact copy of the page for crash recovery."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 5: InnoDB Architecture & Memory/Disk Structures",
        "overview": "Deep dive into the internal anatomy of the InnoDB storage engine. Understand Buffer Pool memory segmentation (5/8 Young vs 3/8 Old midpoint insertion), Redo Log Write-Ahead Logging (WAL) circular buffers, the Doublewrite Buffer torn-page crash protection, and 16KB physical page layout on disk.",
        "content": "Welcome to Week 5. In this chapter, we bridge fundamental SQL with Week 5: InnoDB Architecture & Memory/Disk Structures. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud GitHub Commits & AWS NYC Taxi Ingestion and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud GitHub Commits & AWS NYC Taxi Ingestion. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud GitHub Commits & AWS NYC Taxi Ingestion"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Buffer Pool Architecture & LRU Midpoint Insertion",
        "overview": "First major theoretical principle of this module.",
        "content": "The Buffer Pool is the memory heart of MySQL. Because enterprise tables exceed available RAM, InnoDB manages memory using an advanced segmented LRU (Least Recently Used) list with midpoint insertion to prevent full table scans from evicting hot production caches:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       BUFFER POOL SEGMENTED LRU LIST                          |\n+-------------------------------------------------------------------------------+\n  [Head: Most Recently Used]                                 [Tail: Oldest Page]\n  |<----------------- 5/8 Young Sublist ----------------->|<--- 3/8 Old Sublist --->|\n  | [Hot Page 1] <-> [Hot Page 2] <-> [Hot Page 3] ... <->| [Old 1] <-> [Old 2]   |\n                                                         ^\n                                                         |\n                                     [Midpoint Insertion Point: 37% from Tail]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "New pages read from disk are inserted at the midpoint (the head of the Old sublist), NOT at the very front of the LRU list.",
          "Pages must remain accessed for longer than `innodb_old_blocks_time` (default 1000ms) before being promoted to the Young sublist, preventing batch scans from flushing hot data.",
          "On servers with > 32GB RAM, split into multiple buffer pool instances (`innodb_buffer_pool_instances = 8` to `16`) to eliminate mutex contention."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Write-Ahead Logging (WAL) & Redo Log Circular Rings",
        "overview": "Second major theoretical principle of this module.",
        "content": "When an INSERT or UPDATE occurs, writing changes immediately to disk data files would cause catastrophic random I/O bottlenecks. Instead, InnoDB writes sequentially to the in-memory Redo Log Buffer and flushes to the Redo Log files on disk. Dirty data pages in the Buffer Pool are flushed to tablespace `.ibd` files asynchronously later.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        REDO LOG CIRCULAR RING BUFFER                          |\n+-------------------------------------------------------------------------------+\n  Redo Log File 1              Redo Log File 2              Redo Log File 3\n  [=== Written ===]  --->      [=== Written ===]  --->      [ Free Space ]\n         ^                            ^\n         | Write Pointer (Current)    | Checkpoint Pointer (Last Flushed Page)\n         +----------------------------+\n  (Distance between Write and Checkpoint = Checkpoint Age. If full, DB freezes to flush!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Redo logs guarantee ACID Durability (Crash Recovery). If the server loses power, InnoDB replays redo logs on startup to restore unwritten changes.",
          "If `innodb_log_file_size` is too small, MySQL triggers emergency synchronous flushing, freezing query execution during heavy write bursts."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Inspecting Buffer Pool Hit Ratio & Dirty Page Percentage",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nQueries MySQL status counters: `Innodb_buffer_pool_read_requests` (logical memory reads) vs `Innodb_buffer_pool_reads` (physical disk reads). In healthy production systems, the hit ratio must remain above 99.0%.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Inspecting Real-Time InnoDB Buffer Pool Health & Hit Ratios\nSELECT \n    ROUND(\n        (1 - (variable_value / \n            (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_read_requests')\n        )) * 100, \n        4\n    ) AS buffer_pool_hit_ratio_pct\nFROM performance_schema.global_status \nWHERE variable_name = 'Innodb_buffer_pool_reads';\n\n-- Check Dirty Page Saturation (Dirty Pages vs Total Buffer Pool Capacity)\nSELECT \n    dirty.variable_value AS dirty_pages_in_ram,\n    total.variable_value AS total_pages_capacity,\n    ROUND((dirty.variable_value * 100.0 / total.variable_value), 2) AS dirty_page_saturation_pct\nFROM performance_schema.global_status dirty\nJOIN performance_schema.global_status total \n    ON total.variable_name = 'Innodb_buffer_pool_pages_total'\nWHERE dirty.variable_name = 'Innodb_buffer_pool_pages_dirty';"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Sizing `innodb_buffer_pool_size` to 95% of total server RAM causes Linux OOM (Out Of Memory) Killer to kill `mysqld`. Always leave 20-25% of RAM for OS buffers, connection memory (`sort_buffer_size`, `join_buffer_size`), and dictionary caches.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Inspecting Real-Time InnoDB Buffer Pool Health & Hit Ratios\nSELECT \n    ROUND(\n        (1 - (variable_value / \n            (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_read_requests')\n        )) * 100, \n        4\n    ) AS buffer_pool_hit_ratio_pct\nFROM performance_schema.global_status \nWHERE variable_name = 'Innodb_buffer_pool_reads';\n\n-- Check Dirty Page Saturation (Dirty Pages vs Total Buffer Pool Capacity)\nSELECT \n    dirty.variable_value AS dirty_pages_in_ram,\n    total.variable_value AS total_pages_capacity,\n    ROUND((dirty.variable_value * 100.0 / total.variable_value), 2) AS dirty_page_saturation_pct\nFROM performance_schema.global_status dirty\nJOIN performance_schema.global_status total \n    ON total.variable_name = 'Innodb_buffer_pool_pages_total'\nWHERE dirty.variable_name = 'Innodb_buffer_pool_pages_dirty';"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 5:\\n\\n**Question**: What is the primary purpose of the InnoDB Doublewrite Buffer?\\n\\n**Explanation**: Because operating systems write in 4KB chunks while InnoDB uses 16KB pages, an unexpected crash leaves half-written pages. The Doublewrite buffer guarantees an intact copy of the page for crash recovery.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What is the primary purpose of the InnoDB Doublewrite Buffer?",
        "solution": "-- Correct Answer: Option 2 (It protects against torn pages caused by OS crashes during 16KB page writes)"
      }
    ]
  },
  "6": {
    "month": 2,
    "week": 6,
    "title": "Week 6: B+ Tree Physical Anatomy & Key Packing on Hashes",
    "cloudDataset": "Google Cloud GitHub Commits (SHA-1) & Bitcoin Blockchain (SHA-256)",
    "time": "40 min read",
    "overview": "Master the physical internals of B+ Tree indexes inside 16KB InnoDB pages. Learn the anatomy of infimum and supremum records, page directory binary search slots, sequential 15/16 append splits vs destructive 50-50 random splits on UUID / SHA-1 hashes, and binary storage packing.",
    "sections": [
      {
        "heading": "1. Anatomy of a 16KB InnoDB Index Page",
        "content": "Every B+ Tree node in InnoDB is stored inside a 16KB physical page. The page contains distinct structural zones designed for fast binary search and low CPU cache misses:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        PHYSICAL 16KB INNODB INDEX PAGE                        |\n+-------------------------------------------------------------------------------+\n  [File Header]         (38 bytes: Checksums, Page LSN, Prev/Next Page Pointers)\n  [Page Header]         (56 bytes: Slot count, free space pointer, garbage bytes)\n  [Infimum Record]      (Predefined pseudo-record representing negative infinity)\n  [User Records]        (Singly linked list of row records in sorted key order)\n  [Free Space]          (Available unallocated bytes for future inserts)\n  [Page Directory]      (Sparse array of 2-byte slot offsets for Binary Search!)\n  [Supremum Record]     (Predefined pseudo-record representing positive infinity)\n  [File Trailer]        (8 bytes: Verification checksum matching File Header)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "User records are NOT stored contiguously in sorted array order; they are linked via singly linked list record pointers.",
          "Binary searching a page does NOT scan rows linearly; it binary-searches the Page Directory slots, which point to every 4 to 8 user records."
        ]
      },
      {
        "heading": "2. The Leaf Page Split Mechanics: Sequential vs Random Hashes",
        "content": "When a 16KB page fills with data and a new row is inserted, the page must split. The insertion pattern determines the split strategy, which dictates storage density and disk fragmentation:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       SEQUENTIAL vs RANDOM HASH SPLIT                         |\n+-------------------------------------------------------------------------------+\n  Pattern A: Auto-Increment / Sequential Key\n    Page fills to 15/16 capacity -> Splits at end -> New page created at 100% density!\n    Result: Clean, contiguous pages with 93% fill factor.\n    \n  Pattern B: Random SHA-1 (GitHub) / SHA-256 (Bitcoin) / UUIDv4\n    Key lands randomly in middle of full page -> 50-50 Split!\n    50% of records moved to new page -> Both pages now 50% empty!\n    Result: 2x index bloat, massive buffer pool thrashing, random disk writes!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Random UUID and SHA primary keys cause 50-50 page splits, inflating disk and memory usage by 40-50% compared to sequential IDs.",
          "Clustered primary keys must always be sequential or pseudo-sequential (e.g. ULID or UUIDv7)."
        ]
      },
      {
        "heading": "3. Binary Key Packing: CHAR(40) vs BINARY(20)",
        "content": "Storing 40-character SHA-1 hashes (from Git commits) or 64-character SHA-256 hashes (from Bitcoin transactions) as `VARCHAR(64)` wastes 64 bytes plus length bytes per row. Because secondary indexes store copies of the primary key in every leaf node, converting hexadecimal text to raw binary cuts key size by 50%:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        HEX TEXT vs BINARY KEY PACKING                         |\n+-------------------------------------------------------------------------------+\n  Hex Text:   'c3d4e5f6...' -> CHAR(40) / utf8mb4 -> 40 to 160 Bytes per key!\n  Raw Binary: UNHEX('c3d4e5f6...') -> BINARY(20)   -> Exactly 20 Bytes per key!\n  (Index fits 2.5x more keys per 16KB page; B+ Tree height drops from 4 to 3!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always store fixed cryptographic hashes as BINARY(20) for SHA-1, BINARY(32) for SHA-256, or BINARY(16) for UUIDs.",
          "Use `HEX(hash_col)` for display and `UNHEX('...')` for insertion."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Git & Blockchain Hash Fragmentation",
      "source": "Google Cloud GitHub Public Archive & Bitcoin Blockchain",
      "table": "github_commits (SHA-1) & blockchain_transactions (SHA-256)",
      "description": "Benchmarking index bloat and page split overhead when indexing raw SHA hex strings versus BINARY packed keys across millions of cloud commits and cryptocurrency transactions."
    },
    "codeTitle": "Optimized Binary Key Packing on Crypto Hashes",
    "code": "-- Demonstration: Packing High-Entropy Cryptographic Hashes\n-- Converting Hex strings to BINARY(32) cuts storage and index memory by 50%\nSELECT \n    tx_hash AS original_hex_string,\n    LENGTH(tx_hash) AS hex_string_bytes,\n    -- Converted to Raw 32-byte binary\n    UNHEX(tx_hash) AS raw_binary_packed,\n    LENGTH(UNHEX(tx_hash)) AS binary_bytes,\n    -- Space savings calculation\n    ROUND(\n        (LENGTH(tx_hash) - LENGTH(UNHEX(tx_hash))) * 100.0 / LENGTH(tx_hash), \n        2\n    ) AS storage_savings_pct\nFROM blockchain_transactions\nLIMIT 5;",
    "codeExplanation": "Demonstrates `UNHEX()` converting a 64-character hexadecimal SHA-256 string into a 32-byte raw binary representation, achieving an instant 50% reduction in storage footprint and index memory.",
    "pitfalls": "Senior DBA Gotcha: Using UUIDv4 or random SHA hashes as the CLUSTERED PRIMARY KEY is the #1 cause of unexplainable database slowdowns. Every insert causes a random I/O seek and a 50-50 leaf page split. Always use an auto-increment or UUIDv7 primary key, placing a secondary index on the hash.",
    "quiz": {
      "question": "Why do random UUIDv4 or SHA keys cause massive disk bloat compared to auto-increment integers?",
      "options": [
        "MySQL refuses to compress text columns",
        "Random keys insert into the middle of full pages, forcing 50-50 page splits that leave pages half empty",
        "B+ Trees cannot index strings",
        "UUIDs disable the Doublewrite buffer"
      ],
      "answer": 1,
      "explanation": "Random keys land across random leaves in the B+ Tree. When a full page is split in the middle, half the records are moved to a new page, leaving both pages roughly 50% empty and doubling storage requirements."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 6: B+ Tree Physical Anatomy & Key Packing on Hashes",
        "overview": "Master the physical internals of B+ Tree indexes inside 16KB InnoDB pages. Learn the anatomy of infimum and supremum records, page directory binary search slots, sequential 15/16 append splits vs destructive 50-50 random splits on UUID / SHA-1 hashes, and binary storage packing.",
        "content": "Welcome to Week 6. In this chapter, we bridge fundamental SQL with Week 6: B+ Tree Physical Anatomy & Key Packing on Hashes. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud GitHub Commits (SHA-1) & Bitcoin Blockchain (SHA-256) and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud GitHub Commits (SHA-1) & Bitcoin Blockchain (SHA-256). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud GitHub Commits (SHA-1) & Bitcoin Blockchain (SHA-256)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Anatomy of a 16KB InnoDB Index Page",
        "overview": "First major theoretical principle of this module.",
        "content": "Every B+ Tree node in InnoDB is stored inside a 16KB physical page. The page contains distinct structural zones designed for fast binary search and low CPU cache misses:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        PHYSICAL 16KB INNODB INDEX PAGE                        |\n+-------------------------------------------------------------------------------+\n  [File Header]         (38 bytes: Checksums, Page LSN, Prev/Next Page Pointers)\n  [Page Header]         (56 bytes: Slot count, free space pointer, garbage bytes)\n  [Infimum Record]      (Predefined pseudo-record representing negative infinity)\n  [User Records]        (Singly linked list of row records in sorted key order)\n  [Free Space]          (Available unallocated bytes for future inserts)\n  [Page Directory]      (Sparse array of 2-byte slot offsets for Binary Search!)\n  [Supremum Record]     (Predefined pseudo-record representing positive infinity)\n  [File Trailer]        (8 bytes: Verification checksum matching File Header)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "User records are NOT stored contiguously in sorted array order; they are linked via singly linked list record pointers.",
          "Binary searching a page does NOT scan rows linearly; it binary-searches the Page Directory slots, which point to every 4 to 8 user records."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Leaf Page Split Mechanics: Sequential vs Random Hashes",
        "overview": "Second major theoretical principle of this module.",
        "content": "When a 16KB page fills with data and a new row is inserted, the page must split. The insertion pattern determines the split strategy, which dictates storage density and disk fragmentation:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       SEQUENTIAL vs RANDOM HASH SPLIT                         |\n+-------------------------------------------------------------------------------+\n  Pattern A: Auto-Increment / Sequential Key\n    Page fills to 15/16 capacity -> Splits at end -> New page created at 100% density!\n    Result: Clean, contiguous pages with 93% fill factor.\n    \n  Pattern B: Random SHA-1 (GitHub) / SHA-256 (Bitcoin) / UUIDv4\n    Key lands randomly in middle of full page -> 50-50 Split!\n    50% of records moved to new page -> Both pages now 50% empty!\n    Result: 2x index bloat, massive buffer pool thrashing, random disk writes!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Random UUID and SHA primary keys cause 50-50 page splits, inflating disk and memory usage by 40-50% compared to sequential IDs.",
          "Clustered primary keys must always be sequential or pseudo-sequential (e.g. ULID or UUIDv7)."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Optimized Binary Key Packing on Crypto Hashes",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nDemonstrates `UNHEX()` converting a 64-character hexadecimal SHA-256 string into a 32-byte raw binary representation, achieving an instant 50% reduction in storage footprint and index memory.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Demonstration: Packing High-Entropy Cryptographic Hashes\n-- Converting Hex strings to BINARY(32) cuts storage and index memory by 50%\nSELECT \n    tx_hash AS original_hex_string,\n    LENGTH(tx_hash) AS hex_string_bytes,\n    -- Converted to Raw 32-byte binary\n    UNHEX(tx_hash) AS raw_binary_packed,\n    LENGTH(UNHEX(tx_hash)) AS binary_bytes,\n    -- Space savings calculation\n    ROUND(\n        (LENGTH(tx_hash) - LENGTH(UNHEX(tx_hash))) * 100.0 / LENGTH(tx_hash), \n        2\n    ) AS storage_savings_pct\nFROM blockchain_transactions\nLIMIT 5;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Using UUIDv4 or random SHA hashes as the CLUSTERED PRIMARY KEY is the #1 cause of unexplainable database slowdowns. Every insert causes a random I/O seek and a 50-50 leaf page split. Always use an auto-increment or UUIDv7 primary key, placing a secondary index on the hash.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Demonstration: Packing High-Entropy Cryptographic Hashes\n-- Converting Hex strings to BINARY(32) cuts storage and index memory by 50%\nSELECT \n    tx_hash AS original_hex_string,\n    LENGTH(tx_hash) AS hex_string_bytes,\n    -- Converted to Raw 32-byte binary\n    UNHEX(tx_hash) AS raw_binary_packed,\n    LENGTH(UNHEX(tx_hash)) AS binary_bytes,\n    -- Space savings calculation\n    ROUND(\n        (LENGTH(tx_hash) - LENGTH(UNHEX(tx_hash))) * 100.0 / LENGTH(tx_hash), \n        2\n    ) AS storage_savings_pct\nFROM blockchain_transactions\nLIMIT 5;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 6:\\n\\n**Question**: Why do random UUIDv4 or SHA keys cause massive disk bloat compared to auto-increment integers?\\n\\n**Explanation**: Random keys land across random leaves in the B+ Tree. When a full page is split in the middle, half the records are moved to a new page, leaving both pages roughly 50% empty and doubling storage requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Why do random UUIDv4 or SHA keys cause massive disk bloat compared to auto-increment integers?",
        "solution": "-- Correct Answer: Option 2 (Random keys insert into the middle of full pages, forcing 50-50 page splits that leave pages half empty)"
      }
    ]
  },
  "7": {
    "month": 2,
    "week": 7,
    "title": "Week 7: Covering Indexes, Clustered Bookmark Lookups & Index Skip Scans",
    "cloudDataset": "AWS Open Data NYC TLC Taxi Records (s3://nyc-tlc/)",
    "time": "35 min read",
    "overview": "Learn how to eliminate the most expensive database bottleneck: the Secondary-to-Clustered Index Bookmark Lookup. Understand the Leftmost Prefix Rule, composite index column ordering strategy (Equality -> Range -> Sort), and MySQL 8 Index Skip Scans.",
    "sections": [
      {
        "heading": "1. Anatomy of a Clustered Bookmark Lookup",
        "content": "In InnoDB, a secondary index leaf node does not store pointers to disk offsets; it stores the table's Clustered Primary Key value. When a query requests columns not present in the secondary index, MySQL must perform a secondary lookup into the Clustered Index (Bookmark Lookup) for every matching row, causing massive random I/O.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       CLUSTERED BOOKMARK LOOKUP OVERHEAD                      |\n+-------------------------------------------------------------------------------+\n  Query: SELECT customer_id, order_date, total_amount FROM orders WHERE customer_id = 42;\n  \n  [Non-Covering Index on (customer_id)]:\n    Step 1: Traverse Secondary B+ Tree on customer_id -> Find matching Primary Key: 98142\n    Step 2: Traverse Clustered B+ Tree on order_id (98142) -> Read full 16KB row!\n    (For 10,000 orders, this executes 10,000 random page reads!)\n    \n  [Covering Index on (customer_id, order_date, total_amount)]:\n    Step 1: Traverse Secondary B+ Tree -> All columns found directly in leaf node!\n    Step 2: ZERO Clustered Lookups! Execution is 100x faster! (0 random disk I/O)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "A Covering Index contains all columns referenced in SELECT, WHERE, JOIN, and ORDER BY.",
          "In EXPLAIN output, look for `Using index` in the Extra column; this confirms a covering index with zero clustered lookups."
        ]
      },
      {
        "heading": "2. Composite Index Column Ordering: Equality -> Range -> Sort",
        "content": "The order of columns in a composite index (A, B, C) dictates which queries can utilize it. Follow the golden rule: place equality columns first, followed by range comparison columns, followed by sort columns.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      COMPOSITE INDEX GOLDEN ORDERING RULE                     |\n+-------------------------------------------------------------------------------+\n  Query: WHERE status = 'COMPLETED' AND order_date >= '2023-01-01' ORDER BY total_amount\n  \n  Optimal Composite Index:\n    Column 1: status        (Equality filter: filters candidate space immediately)\n    Column 2: order_date    (Range filter: B+ Tree scans contiguous range)\n    Column 3: total_amount  (Projection / Covering column)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "A range condition (`<`, `>`, `BETWEEN`, `LIKE 'abc%'`) prevents subsequent index columns from being used for B+ Tree lookups.",
          "Leftmost Prefix Rule: An index on (A, B, C) can satisfy queries on (A), (A, B), and (A, B, C), but NOT (B) or (C) alone."
        ]
      },
      {
        "heading": "3. MySQL 8 Index Skip Scans",
        "content": "Prior to MySQL 8, querying column B in an index (A, B) forced a full table scan. MySQL 8 introduced Index Skip Scans: if column A has very low cardinality (e.g. `gender` or `status` with 2-3 distinct values), MySQL will logically skip A by executing sub-scans for each distinct value of A.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            INDEX SKIP SCAN ENGINE                             |\n+-------------------------------------------------------------------------------+\n  Index on: (status, created_at)   Query: WHERE created_at > '2023-01-01'\n  Distinct values of status: 'PENDING', 'COMPLETED', 'CANCELLED'\n  \n  Optimizer executes 3 sub-scans:\n    Sub-scan 1: status = 'PENDING'   AND created_at > '2023-01-01'\n    Sub-scan 2: status = 'COMPLETED' AND created_at > '2023-01-01'\n    Sub-scan 3: status = 'CANCELLED' AND created_at > '2023-01-01'\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Index Skip Scan appears in EXPLAIN Extra as `Using index for skip scan`.",
          "It works best when the prefix column has low cardinality and the secondary column has high cardinality."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "NYC Taxi 100x Speedup via Covering Indexes",
      "source": "AWS Open Data Registry (s3://nyc-tlc/trip data/)",
      "table": "nyc_yellow_taxi_trips (1.5B+ rows)",
      "description": "Slashing query latency on transit fare aggregates from 1,420ms to 12ms by replacing a non-covering index with a composite covering index on (pickup_location_id, pickup_datetime, total_amount)."
    },
    "codeTitle": "Proving Covering Index Elimination of Clustered Lookups",
    "code": "-- Benchmarking Covering Index on Orders\n-- Satisfies query directly from secondary index leaves without touching base rows\nSELECT \n    customer_id,\n    order_date,\n    status,\n    total_amount\nFROM orders\nWHERE customer_id = 25\nORDER BY order_date DESC;\n\n-- Verification in EXPLAIN:\n-- EXPLAIN SELECT customer_id, order_date, status, total_amount FROM orders WHERE customer_id = 25;\n-- Extra column displays: 'Using index' (Guarantees 100% covering index)",
    "codeExplanation": "Because the index contains `(customer_id, order_date, status, total_amount)`, MySQL satisfies the projection and sorting entirely within the secondary B+ Tree leaf pages.",
    "pitfalls": "Senior DBA Gotcha: Adding too many columns to a secondary index ('fat index') causes significant write amplification on INSERT/UPDATE statements and inflates the Buffer Pool footprint. Only cover high-frequency p99 latency queries.",
    "quiz": {
      "question": "What phrase in the EXPLAIN 'Extra' column confirms that a query is satisfied by a Covering Index?",
      "options": [
        "Using filesort",
        "Using where",
        "Using index",
        "Using temporary"
      ],
      "answer": 2,
      "explanation": "'Using index' confirms that the storage engine resolved the entire query directly from the secondary index pages without visiting the clustered primary key records."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 7: Covering Indexes, Clustered Bookmark Lookups & Index Skip Scans",
        "overview": "Learn how to eliminate the most expensive database bottleneck: the Secondary-to-Clustered Index Bookmark Lookup. Understand the Leftmost Prefix Rule, composite index column ordering strategy (Equality -> Range -> Sort), and MySQL 8 Index Skip Scans.",
        "content": "Welcome to Week 7. In this chapter, we bridge fundamental SQL with Week 7: Covering Indexes, Clustered Bookmark Lookups & Index Skip Scans. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC TLC Taxi Records (s3://nyc-tlc/) and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC TLC Taxi Records (s3://nyc-tlc/). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC TLC Taxi Records (s3://nyc-tlc/)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Anatomy of a Clustered Bookmark Lookup",
        "overview": "First major theoretical principle of this module.",
        "content": "In InnoDB, a secondary index leaf node does not store pointers to disk offsets; it stores the table's Clustered Primary Key value. When a query requests columns not present in the secondary index, MySQL must perform a secondary lookup into the Clustered Index (Bookmark Lookup) for every matching row, causing massive random I/O.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       CLUSTERED BOOKMARK LOOKUP OVERHEAD                      |\n+-------------------------------------------------------------------------------+\n  Query: SELECT customer_id, order_date, total_amount FROM orders WHERE customer_id = 42;\n  \n  [Non-Covering Index on (customer_id)]:\n    Step 1: Traverse Secondary B+ Tree on customer_id -> Find matching Primary Key: 98142\n    Step 2: Traverse Clustered B+ Tree on order_id (98142) -> Read full 16KB row!\n    (For 10,000 orders, this executes 10,000 random page reads!)\n    \n  [Covering Index on (customer_id, order_date, total_amount)]:\n    Step 1: Traverse Secondary B+ Tree -> All columns found directly in leaf node!\n    Step 2: ZERO Clustered Lookups! Execution is 100x faster! (0 random disk I/O)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "A Covering Index contains all columns referenced in SELECT, WHERE, JOIN, and ORDER BY.",
          "In EXPLAIN output, look for `Using index` in the Extra column; this confirms a covering index with zero clustered lookups."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Composite Index Column Ordering: Equality -> Range -> Sort",
        "overview": "Second major theoretical principle of this module.",
        "content": "The order of columns in a composite index (A, B, C) dictates which queries can utilize it. Follow the golden rule: place equality columns first, followed by range comparison columns, followed by sort columns.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      COMPOSITE INDEX GOLDEN ORDERING RULE                     |\n+-------------------------------------------------------------------------------+\n  Query: WHERE status = 'COMPLETED' AND order_date >= '2023-01-01' ORDER BY total_amount\n  \n  Optimal Composite Index:\n    Column 1: status        (Equality filter: filters candidate space immediately)\n    Column 2: order_date    (Range filter: B+ Tree scans contiguous range)\n    Column 3: total_amount  (Projection / Covering column)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "A range condition (`<`, `>`, `BETWEEN`, `LIKE 'abc%'`) prevents subsequent index columns from being used for B+ Tree lookups.",
          "Leftmost Prefix Rule: An index on (A, B, C) can satisfy queries on (A), (A, B), and (A, B, C), but NOT (B) or (C) alone."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Proving Covering Index Elimination of Clustered Lookups",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nBecause the index contains `(customer_id, order_date, status, total_amount)`, MySQL satisfies the projection and sorting entirely within the secondary B+ Tree leaf pages.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Benchmarking Covering Index on Orders\n-- Satisfies query directly from secondary index leaves without touching base rows\nSELECT \n    customer_id,\n    order_date,\n    status,\n    total_amount\nFROM orders\nWHERE customer_id = 25\nORDER BY order_date DESC;\n\n-- Verification in EXPLAIN:\n-- EXPLAIN SELECT customer_id, order_date, status, total_amount FROM orders WHERE customer_id = 25;\n-- Extra column displays: 'Using index' (Guarantees 100% covering index)"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Adding too many columns to a secondary index ('fat index') causes significant write amplification on INSERT/UPDATE statements and inflates the Buffer Pool footprint. Only cover high-frequency p99 latency queries.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Benchmarking Covering Index on Orders\n-- Satisfies query directly from secondary index leaves without touching base rows\nSELECT \n    customer_id,\n    order_date,\n    status,\n    total_amount\nFROM orders\nWHERE customer_id = 25\nORDER BY order_date DESC;\n\n-- Verification in EXPLAIN:\n-- EXPLAIN SELECT customer_id, order_date, status, total_amount FROM orders WHERE customer_id = 25;\n-- Extra column displays: 'Using index' (Guarantees 100% covering index)"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 7:\\n\\n**Question**: What phrase in the EXPLAIN 'Extra' column confirms that a query is satisfied by a Covering Index?\\n\\n**Explanation**: 'Using index' confirms that the storage engine resolved the entire query directly from the secondary index pages without visiting the clustered primary key records.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What phrase in the EXPLAIN 'Extra' column confirms that a query is satisfied by a Covering Index?",
        "solution": "-- Correct Answer: Option 3 (Using index)"
      }
    ]
  },
  "8": {
    "month": 2,
    "week": 8,
    "title": "Week 8: Query Execution Plan Diagnostics (EXPLAIN ANALYZE)",
    "cloudDataset": "Google Cloud GitHub Commits & Stack Overflow Public Datasets",
    "time": "40 min read",
    "overview": "Master query profiling using modern EXPLAIN and EXPLAIN ANALYZE in MySQL 8. Learn how to interpret the volcano iterator tree, compare optimizer cost estimates against actual execution times, identify access type hierarchy, and eliminate expensive disk FileSorts.",
    "sections": [
      {
        "heading": "1. EXPLAIN vs EXPLAIN ANALYZE: Estimated vs Actual",
        "content": "Traditional `EXPLAIN` only shows what the optimizer *thinks* will happen based on table statistics. `EXPLAIN ANALYZE` actually executes the query, instrumenting every iterator in the execution tree to measure actual wall-clock time, loop counts, and rows returned.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       EXPLAIN ANALYZE TREE INTERPRETATION                     |\n+-------------------------------------------------------------------------------+\n  -> Limit: 10 row(s)  (cost=12.4 rows=10) (actual time=0.082..0.091 rows=10 loops=1)\n      -> Index lookup on o using idx_cust (cost=12.4 rows=15) (actual time=0.080..0.088 rows=10 loops=1)\n         |                                |                   |                   |\n         +--- Cost Model Units            +-- Estimated Rows  +-- Actual Time ms  +-- Execution Loops\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Read the iterator tree from the inside-out and bottom-to-top.",
          "If estimated rows diverge by more than 10x from actual rows, table statistics are stale; run `ANALYZE TABLE` to refresh histograms."
        ]
      },
      {
        "heading": "2. Access Types Hierarchy (From Fastest to Slowest)",
        "content": "The `type` column in EXPLAIN indicates how MySQL accesses rows. Understanding this hierarchy allows diagnosing query bottlenecks instantly:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        EXPLAIN ACCESS TYPE HIERARCHY                          |\n+-------------------------------------------------------------------------------+\n  [system]   -> System table with 1 row (Instant)\n  [const]    -> Primary Key or Unique Index lookup with constant value (0.01ms)\n  [eq_ref]   -> 1 row read from primary/unique index for each row from previous table\n  [ref]      -> Non-unique secondary index lookup (Fast)\n  [range]    -> Index range scan (BETWEEN, <, >, IN) (Good)\n  [index]    -> Full Index Scan (Scans entire B+ Tree leaves) (Suboptimal)\n  [ALL]      -> Full Table Scan (Reads entire tablespace from disk) (DANGEROUS AT SCALE!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "In high-scale OLTP systems, never allow `type: ALL` on tables with > 50,000 rows.",
          "`type: eq_ref` is the gold standard for high-performance relational joins."
        ]
      },
      {
        "heading": "3. Eliminating FileSort and Temporary Tables",
        "content": "When a query specifies `ORDER BY` or `GROUP BY` on columns not sorted by the chosen index, MySQL must buffer rows into the Sort Buffer and execute an in-memory or on-disk FileSort. Aligning index column order with ORDER BY eliminates FileSort completely.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         FILESORT vs INDEX STREAM MERGE                        |\n+-------------------------------------------------------------------------------+\n  Without Index:  Fetch rows -> Load to sort_buffer -> Quicksort -> Spill to disk temp file!\n  With Index:     Read index leaves (already in pre-sorted order) -> Instant Stream Output!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "If `Using filesort` appears in Extra, consider adding a composite index matching the WHERE and ORDER BY columns.",
          "If `sort_buffer_size` is too small, MySQL creates temporary disk files, visible in `Sort_merge_passes` status counter."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Optimizing Developer Question Searches",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.stackoverflow)",
      "table": "so_posts (50M+ rows)",
      "description": "Using EXPLAIN ANALYZE to diagnose an expensive full-table filesort query on developer posts, reducing execution cost from 48,200 units to 3.1 units."
    },
    "codeTitle": "Profiling Query Iterators with EXPLAIN ANALYZE",
    "code": "-- Diagnostic Query Execution with EXPLAIN ANALYZE\n-- Compares estimated optimizer cost against actual iterator runtimes\nEXPLAIN \nSELECT \n    o.order_id,\n    o.customer_id,\n    o.order_date,\n    o.status,\n    o.total_amount\nFROM orders o\nWHERE o.customer_id = 42\nORDER BY o.order_date DESC\nLIMIT 10;",
    "codeExplanation": "Running EXPLAIN reveals the access type, selected index, and whether FileSort is triggered. When executed with covering indexes, the query shows `type: ref` and `Using index`.",
    "pitfalls": "Senior DBA Gotcha: Running EXPLAIN ANALYZE on destructive queries (DELETE or UPDATE) WILL EXECUTE THEM! Unlike standard EXPLAIN which only plans, EXPLAIN ANALYZE runs the SQL against your data. Never run EXPLAIN ANALYZE with DELETE in production without a transaction rollback.",
    "quiz": {
      "question": "Which access type in EXPLAIN indicates that MySQL is reading every single page of the table from disk?",
      "options": [
        "const",
        "ref",
        "range",
        "ALL"
      ],
      "answer": 3,
      "explanation": "Access type 'ALL' signifies a Full Table Scan, meaning MySQL was unable to use an index and had to read every row from the tablespace."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 8: Query Execution Plan Diagnostics (EXPLAIN ANALYZE)",
        "overview": "Master query profiling using modern EXPLAIN and EXPLAIN ANALYZE in MySQL 8. Learn how to interpret the volcano iterator tree, compare optimizer cost estimates against actual execution times, identify access type hierarchy, and eliminate expensive disk FileSorts.",
        "content": "Welcome to Week 8. In this chapter, we bridge fundamental SQL with Week 8: Query Execution Plan Diagnostics (EXPLAIN ANALYZE). We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud GitHub Commits & Stack Overflow Public Datasets and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud GitHub Commits & Stack Overflow Public Datasets. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud GitHub Commits & Stack Overflow Public Datasets"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. EXPLAIN vs EXPLAIN ANALYZE: Estimated vs Actual",
        "overview": "First major theoretical principle of this module.",
        "content": "Traditional `EXPLAIN` only shows what the optimizer *thinks* will happen based on table statistics. `EXPLAIN ANALYZE` actually executes the query, instrumenting every iterator in the execution tree to measure actual wall-clock time, loop counts, and rows returned.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       EXPLAIN ANALYZE TREE INTERPRETATION                     |\n+-------------------------------------------------------------------------------+\n  -> Limit: 10 row(s)  (cost=12.4 rows=10) (actual time=0.082..0.091 rows=10 loops=1)\n      -> Index lookup on o using idx_cust (cost=12.4 rows=15) (actual time=0.080..0.088 rows=10 loops=1)\n         |                                |                   |                   |\n         +--- Cost Model Units            +-- Estimated Rows  +-- Actual Time ms  +-- Execution Loops\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Read the iterator tree from the inside-out and bottom-to-top.",
          "If estimated rows diverge by more than 10x from actual rows, table statistics are stale; run `ANALYZE TABLE` to refresh histograms."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Access Types Hierarchy (From Fastest to Slowest)",
        "overview": "Second major theoretical principle of this module.",
        "content": "The `type` column in EXPLAIN indicates how MySQL accesses rows. Understanding this hierarchy allows diagnosing query bottlenecks instantly:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        EXPLAIN ACCESS TYPE HIERARCHY                          |\n+-------------------------------------------------------------------------------+\n  [system]   -> System table with 1 row (Instant)\n  [const]    -> Primary Key or Unique Index lookup with constant value (0.01ms)\n  [eq_ref]   -> 1 row read from primary/unique index for each row from previous table\n  [ref]      -> Non-unique secondary index lookup (Fast)\n  [range]    -> Index range scan (BETWEEN, <, >, IN) (Good)\n  [index]    -> Full Index Scan (Scans entire B+ Tree leaves) (Suboptimal)\n  [ALL]      -> Full Table Scan (Reads entire tablespace from disk) (DANGEROUS AT SCALE!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "In high-scale OLTP systems, never allow `type: ALL` on tables with > 50,000 rows.",
          "`type: eq_ref` is the gold standard for high-performance relational joins."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Profiling Query Iterators with EXPLAIN ANALYZE",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nRunning EXPLAIN reveals the access type, selected index, and whether FileSort is triggered. When executed with covering indexes, the query shows `type: ref` and `Using index`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Diagnostic Query Execution with EXPLAIN ANALYZE\n-- Compares estimated optimizer cost against actual iterator runtimes\nEXPLAIN \nSELECT \n    o.order_id,\n    o.customer_id,\n    o.order_date,\n    o.status,\n    o.total_amount\nFROM orders o\nWHERE o.customer_id = 42\nORDER BY o.order_date DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running EXPLAIN ANALYZE on destructive queries (DELETE or UPDATE) WILL EXECUTE THEM! Unlike standard EXPLAIN which only plans, EXPLAIN ANALYZE runs the SQL against your data. Never run EXPLAIN ANALYZE with DELETE in production without a transaction rollback.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Diagnostic Query Execution with EXPLAIN ANALYZE\n-- Compares estimated optimizer cost against actual iterator runtimes\nEXPLAIN \nSELECT \n    o.order_id,\n    o.customer_id,\n    o.order_date,\n    o.status,\n    o.total_amount\nFROM orders o\nWHERE o.customer_id = 42\nORDER BY o.order_date DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 8:\\n\\n**Question**: Which access type in EXPLAIN indicates that MySQL is reading every single page of the table from disk?\\n\\n**Explanation**: Access type 'ALL' signifies a Full Table Scan, meaning MySQL was unable to use an index and had to read every row from the tablespace.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Which access type in EXPLAIN indicates that MySQL is reading every single page of the table from disk?",
        "solution": "-- Correct Answer: Option 4 (ALL)"
      }
    ]
  },
  "9": {
    "month": 3,
    "week": 9,
    "title": "Week 9: ACID Transaction Internals & WAL Durability Tuning",
    "cloudDataset": "Google Cloud Bitcoin & Ethereum Public Blockchain (bigquery-public-data.crypto_bitcoin)",
    "time": "40 min read",
    "overview": "Master the physical mechanics of ACID transactions in high-throughput financial ledgers. Understand Write-Ahead Logging (WAL), transaction commit phases, the two-phase commit (2PC) between InnoDB and Binary Logs, and tuning innodb_flush_log_at_trx_commit vs sync_binlog for 50,000+ TPS.",
    "sections": [
      {
        "heading": "1. ACID Guarantees in Financial Ledgers",
        "content": "In financial systems and blockchain ledgers, data anomalies lead to catastrophic monetary loss. MySQL guarantees ACID properties through coordinated storage mechanisms:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         ACID IMPLEMENTATION MECHANISMS                        |\n+-------------------------------------------------------------------------------+\n  [A] Atomicity    -> Undo Logs (Reverses uncommitted transactions upon ROLLBACK)\n  [C] Consistency  -> Constraints, Foreign Keys, Unique Indexes, Application Rules\n  [I] Isolation    -> Row Locks (Record, Gap, Next-Key) + MVCC Read Views\n  [D] Durability   -> Redo Logs (WAL) + Doublewrite Buffer (Survives power failure)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Atomicity guarantees all-or-nothing execution via Undo Log rollbacks.",
          "Durability guarantees committed transactions survive system crashes by flushing Redo Logs before returning success to the client."
        ]
      },
      {
        "heading": "2. Durability Tuning: innodb_flush_log_at_trx_commit",
        "content": "The parameter `innodb_flush_log_at_trx_commit` controls how aggressively the Redo Log Buffer is flushed to physical disk:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                 innodb_flush_log_at_trx_commit COMPARISON                     |\n+-------------------------------------------------------------------------------+\n  Setting = 1 (Full ACID): Flush and fsync() to disk on EVERY commit.\n    Safety: 100% crash proof. Throughput: ~2,000 TPS on standard disks.\n    \n  Setting = 2 (OS Buffer): Flush to OS buffer cache on commit; fsync() once per second.\n    Safety: Survives MySQL crash, but 1s data loss on OS crash. Throughput: ~25,000 TPS!\n    \n  Setting = 0 (Memory): Flush and fsync() once per second via background thread.\n    Safety: 1s data loss on MySQL crash. Highest throughput: ~50,000+ TPS!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Financial, banking, and ledger databases must ALWAYS use `innodb_flush_log_at_trx_commit = 1` and `sync_binlog = 1`.",
          "For high-volume non-critical analytics or ingest workers, setting to 2 provides a 10x throughput boost while surviving MySQL server restarts."
        ]
      },
      {
        "heading": "3. Two-Phase Commit (2PC) Between InnoDB and Binlog",
        "content": "MySQL uses XA Two-Phase Commit internally to ensure the storage engine (InnoDB) and the replication coordinator (Binary Log) stay strictly synchronized during a commit.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       INTERNAL TWO-PHASE COMMIT (2PC)                         |\n+-------------------------------------------------------------------------------+\n  Phase 1 (Prepare): InnoDB writes transaction to Redo Log & sets state to PREPARE.\n  Phase 2 (Binlog):  MySQL writes transaction to Binary Log file & flushes disk.\n  Phase 3 (Commit):  InnoDB marks Redo Log state as COMMITTED.\n  (If crash happens between Prepare and Commit, MySQL checks Binlog to decide commit/abort!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Internal 2PC guarantees that master and read replicas never diverge after a crash recovery.",
          "Group commit (`binlog_group_commit_sync_delay`) batches fsync calls across concurrent transactions, boosting throughput under load."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Crypto Blockchain Transaction Ledgers",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.crypto_bitcoin)",
      "table": "blockchain_transactions (1.5+ TB)",
      "description": "Modeling immutable UTXO double-entry cryptocurrency transfers, auditing debit/credit equality, and benchmarking throughput under strict ACID isolation."
    },
    "codeTitle": "Strict ACID Double-Entry Financial Transfer",
    "code": "-- Strict ACID Double-Entry Financial Transfer\n-- Guarantees atomic debit and credit with balance validation\nSTART TRANSACTION;\n\n-- 1. Debit Source Account\nUPDATE accounts \nSET current_balance = current_balance - 250.00\nWHERE account_id = 10 AND current_balance >= 250.00;\n\n-- 2. Credit Destination Account\nUPDATE accounts \nSET current_balance = current_balance + 250.00\nWHERE account_id = 50;\n\n-- 3. Record Audited Ledger Entry\nINSERT INTO blockchain_transactions \n    (tx_hash, from_address, to_address, amount_satoshis, fee_satoshis)\nVALUES \n    ('e4f5a6b7c8d9e0f1', 'acct_10', 'acct_50', 25000000, 1000);\n\n-- Commit transaction atomically\nCOMMIT;",
    "codeExplanation": "Executes two updates and an audit insert inside an atomic transaction. The `current_balance >= 250.00` check prevents negative balances at the engine level.",
    "pitfalls": "Senior DBA Gotcha: Running with `autocommit = 1` in application code without explicit `START TRANSACTION` wraps every single SQL statement in its own commit and fsync disk write, causing a 50x slowdown.",
    "quiz": {
      "question": "What setting of innodb_flush_log_at_trx_commit guarantees 100% ACID compliance with zero data loss during power failure?",
      "options": [
        "Setting = 0",
        "Setting = 1",
        "Setting = 2",
        "Setting = 3"
      ],
      "answer": 1,
      "explanation": "Setting = 1 forces a synchronous flush and disk fsync of the Redo Log on every single transaction commit, guaranteeing durability across hardware power loss."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 9: ACID Transaction Internals & WAL Durability Tuning",
        "overview": "Master the physical mechanics of ACID transactions in high-throughput financial ledgers. Understand Write-Ahead Logging (WAL), transaction commit phases, the two-phase commit (2PC) between InnoDB and Binary Logs, and tuning innodb_flush_log_at_trx_commit vs sync_binlog for 50,000+ TPS.",
        "content": "Welcome to Week 9. In this chapter, we bridge fundamental SQL with Week 9: ACID Transaction Internals & WAL Durability Tuning. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud Bitcoin & Ethereum Public Blockchain (bigquery-public-data.crypto_bitcoin) and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud Bitcoin & Ethereum Public Blockchain (bigquery-public-data.crypto_bitcoin). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud Bitcoin & Ethereum Public Blockchain (bigquery-public-data.crypto_bitcoin)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. ACID Guarantees in Financial Ledgers",
        "overview": "First major theoretical principle of this module.",
        "content": "In financial systems and blockchain ledgers, data anomalies lead to catastrophic monetary loss. MySQL guarantees ACID properties through coordinated storage mechanisms:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         ACID IMPLEMENTATION MECHANISMS                        |\n+-------------------------------------------------------------------------------+\n  [A] Atomicity    -> Undo Logs (Reverses uncommitted transactions upon ROLLBACK)\n  [C] Consistency  -> Constraints, Foreign Keys, Unique Indexes, Application Rules\n  [I] Isolation    -> Row Locks (Record, Gap, Next-Key) + MVCC Read Views\n  [D] Durability   -> Redo Logs (WAL) + Doublewrite Buffer (Survives power failure)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Atomicity guarantees all-or-nothing execution via Undo Log rollbacks.",
          "Durability guarantees committed transactions survive system crashes by flushing Redo Logs before returning success to the client."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Durability Tuning: innodb_flush_log_at_trx_commit",
        "overview": "Second major theoretical principle of this module.",
        "content": "The parameter `innodb_flush_log_at_trx_commit` controls how aggressively the Redo Log Buffer is flushed to physical disk:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                 innodb_flush_log_at_trx_commit COMPARISON                     |\n+-------------------------------------------------------------------------------+\n  Setting = 1 (Full ACID): Flush and fsync() to disk on EVERY commit.\n    Safety: 100% crash proof. Throughput: ~2,000 TPS on standard disks.\n    \n  Setting = 2 (OS Buffer): Flush to OS buffer cache on commit; fsync() once per second.\n    Safety: Survives MySQL crash, but 1s data loss on OS crash. Throughput: ~25,000 TPS!\n    \n  Setting = 0 (Memory): Flush and fsync() once per second via background thread.\n    Safety: 1s data loss on MySQL crash. Highest throughput: ~50,000+ TPS!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Financial, banking, and ledger databases must ALWAYS use `innodb_flush_log_at_trx_commit = 1` and `sync_binlog = 1`.",
          "For high-volume non-critical analytics or ingest workers, setting to 2 provides a 10x throughput boost while surviving MySQL server restarts."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Strict ACID Double-Entry Financial Transfer",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nExecutes two updates and an audit insert inside an atomic transaction. The `current_balance >= 250.00` check prevents negative balances at the engine level.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Strict ACID Double-Entry Financial Transfer\n-- Guarantees atomic debit and credit with balance validation\nSTART TRANSACTION;\n\n-- 1. Debit Source Account\nUPDATE accounts \nSET current_balance = current_balance - 250.00\nWHERE account_id = 10 AND current_balance >= 250.00;\n\n-- 2. Credit Destination Account\nUPDATE accounts \nSET current_balance = current_balance + 250.00\nWHERE account_id = 50;\n\n-- 3. Record Audited Ledger Entry\nINSERT INTO blockchain_transactions \n    (tx_hash, from_address, to_address, amount_satoshis, fee_satoshis)\nVALUES \n    ('e4f5a6b7c8d9e0f1', 'acct_10', 'acct_50', 25000000, 1000);\n\n-- Commit transaction atomically\nCOMMIT;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running with `autocommit = 1` in application code without explicit `START TRANSACTION` wraps every single SQL statement in its own commit and fsync disk write, causing a 50x slowdown.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Strict ACID Double-Entry Financial Transfer\n-- Guarantees atomic debit and credit with balance validation\nSTART TRANSACTION;\n\n-- 1. Debit Source Account\nUPDATE accounts \nSET current_balance = current_balance - 250.00\nWHERE account_id = 10 AND current_balance >= 250.00;\n\n-- 2. Credit Destination Account\nUPDATE accounts \nSET current_balance = current_balance + 250.00\nWHERE account_id = 50;\n\n-- 3. Record Audited Ledger Entry\nINSERT INTO blockchain_transactions \n    (tx_hash, from_address, to_address, amount_satoshis, fee_satoshis)\nVALUES \n    ('e4f5a6b7c8d9e0f1', 'acct_10', 'acct_50', 25000000, 1000);\n\n-- Commit transaction atomically\nCOMMIT;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 9:\\n\\n**Question**: What setting of innodb_flush_log_at_trx_commit guarantees 100% ACID compliance with zero data loss during power failure?\\n\\n**Explanation**: Setting = 1 forces a synchronous flush and disk fsync of the Redo Log on every single transaction commit, guaranteeing durability across hardware power loss.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What setting of innodb_flush_log_at_trx_commit guarantees 100% ACID compliance with zero data loss during power failure?",
        "solution": "-- Correct Answer: Option 2 (Setting = 1)"
      }
    ]
  },
  "10": {
    "month": 3,
    "week": 10,
    "title": "Week 10: Isolation Levels & MVCC Snapshot Mechanics",
    "cloudDataset": "Google Cloud Bitcoin & Ethereum Public Blockchain",
    "time": "40 min read",
    "overview": "Deep dive into Multi-Version Concurrency Control (MVCC) in InnoDB. Learn the physical structure of hidden row columns (DB_TRX_ID and DB_ROLL_PTR), how Undo Logs form a reverse version chain, how Read Views are constructed, and why non-blocking consistent reads prevent readers from blocking writers.",
    "sections": [
      {
        "heading": "1. The Two Hidden Columns: DB_TRX_ID & DB_ROLL_PTR",
        "content": "Every clustered index record in InnoDB contains two mandatory hidden system columns that enable MVCC without locking tables:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PHYSICAL INNODB ROW MVCC HEADERS                        |\n+-------------------------------------------------------------------------------+\n  [User Columns: account_id, balance]\n  [DB_TRX_ID]   (6 bytes: Transaction ID of the last transaction that modified row)\n  [DB_ROLL_PTR] (7 bytes: Rollback pointer referencing the previous version in Undo Log)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "DB_TRX_ID tracks which transaction committed or modified the row.",
          "DB_ROLL_PTR points backward to the Undo Log segment containing the row's pre-update values."
        ]
      },
      {
        "heading": "2. The Undo Log Row Version Chain",
        "content": "When a row is updated repeatedly, InnoDB does not overwrite historical values in place; it chains historical versions in the Undo Log via DB_ROLL_PTR. Readers traverse this chain backwards in memory to view data as it existed when their transaction began:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         UNDO LOG ROW VERSION CHAIN                            |\n+-------------------------------------------------------------------------------+\n  [Current Row in Clustered Index]: Balance: $500  (DB_TRX_ID: 105, DB_ROLL_PTR)\n                                                            |\n                                                            v\n  [Undo Log Entry 1]:               Balance: $400  (DB_TRX_ID: 102, DB_ROLL_PTR)\n                                                            |\n                                                            v\n  [Undo Log Entry 2]:               Balance: $200  (DB_TRX_ID: 98,  DB_ROLL_PTR = NULL)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SELECT queries do NOT acquire locks! They perform consistent snapshot reads by traversing the Undo chain.",
          "Writers do not block readers, and readers do not block writers."
        ]
      },
      {
        "heading": "3. Read View Lifecycle: Read Committed vs Repeatable Read",
        "content": "A Read View is an in-memory snapshot array recording active transactions at the instant a read occurs. The isolation level dictates when the Read View is created and refreshed:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                 READ COMMITTED vs REPEATABLE READ READ VIEWS                  |\n+-------------------------------------------------------------------------------+\n  READ COMMITTED:   Creates a NEW Read View before EVERY SELECT statement.\n                    (Sees changes committed by other transactions mid-session!)\n                    \n  REPEATABLE READ:  Creates a SINGLE Read View at the FIRST SELECT statement.\n                    (Re-uses the same snapshot throughout the entire transaction!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Repeatable Read is the default isolation level in MySQL, eliminating non-repeatable reads.",
          "Long-running transactions prevent InnoDB Purge Threads from purging old Undo Logs, causing undo tablespace bloat and disk full crashes."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Concurrent Blockchain Balance Auditing",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.crypto_bitcoin)",
      "table": "blockchain_transactions & accounts",
      "description": "Executing non-blocking multi-million dollar balance reconciliation audits in REPEATABLE READ isolation while concurrent transactions process 50,000 payments per minute."
    },
    "codeTitle": "Inspecting Transaction Status & Active Undo History",
    "code": "-- Inspecting Active Transactions & Undo History Length\nSELECT \n    trx_id,\n    trx_state,\n    trx_started,\n    trx_isolation_level,\n    trx_rows_locked,\n    trx_rows_modified\nFROM information_schema.innodb_trx\nORDER BY trx_started ASC;\n\n-- Check History List Length (Unpurged Undo Logs)\nSELECT variable_value AS undo_history_list_length\nFROM performance_schema.global_status\nWHERE variable_name = 'Innodb_history_list_length';",
    "codeExplanation": "Queries `information_schema.innodb_trx` to monitor running transactions and `Innodb_history_list_length` to detect unpurged undo records.",
    "pitfalls": "Senior DBA Gotcha: Leaving an uncommitted `START TRANSACTION` idle in a web app connection pool holds open the Read View, preventing InnoDB from purging Undo logs. The history list explodes, bloating disk and degrading all reads across the entire cluster.",
    "quiz": {
      "question": "In REPEATABLE READ isolation, when is the MVCC Read View created?",
      "options": [
        "When the MySQL server boots",
        "At the first SELECT query executed within the transaction",
        "At every individual query",
        "Only when an UPDATE occurs"
      ],
      "answer": 1,
      "explanation": "In REPEATABLE READ, the Read View is established upon the first consistent read (SELECT) and remains unchanged until the transaction commits or rolls back."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 10: Isolation Levels & MVCC Snapshot Mechanics",
        "overview": "Deep dive into Multi-Version Concurrency Control (MVCC) in InnoDB. Learn the physical structure of hidden row columns (DB_TRX_ID and DB_ROLL_PTR), how Undo Logs form a reverse version chain, how Read Views are constructed, and why non-blocking consistent reads prevent readers from blocking writers.",
        "content": "Welcome to Week 10. In this chapter, we bridge fundamental SQL with Week 10: Isolation Levels & MVCC Snapshot Mechanics. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud Bitcoin & Ethereum Public Blockchain and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud Bitcoin & Ethereum Public Blockchain. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud Bitcoin & Ethereum Public Blockchain"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The Two Hidden Columns: DB_TRX_ID & DB_ROLL_PTR",
        "overview": "First major theoretical principle of this module.",
        "content": "Every clustered index record in InnoDB contains two mandatory hidden system columns that enable MVCC without locking tables:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PHYSICAL INNODB ROW MVCC HEADERS                        |\n+-------------------------------------------------------------------------------+\n  [User Columns: account_id, balance]\n  [DB_TRX_ID]   (6 bytes: Transaction ID of the last transaction that modified row)\n  [DB_ROLL_PTR] (7 bytes: Rollback pointer referencing the previous version in Undo Log)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "DB_TRX_ID tracks which transaction committed or modified the row.",
          "DB_ROLL_PTR points backward to the Undo Log segment containing the row's pre-update values."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Undo Log Row Version Chain",
        "overview": "Second major theoretical principle of this module.",
        "content": "When a row is updated repeatedly, InnoDB does not overwrite historical values in place; it chains historical versions in the Undo Log via DB_ROLL_PTR. Readers traverse this chain backwards in memory to view data as it existed when their transaction began:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         UNDO LOG ROW VERSION CHAIN                            |\n+-------------------------------------------------------------------------------+\n  [Current Row in Clustered Index]: Balance: $500  (DB_TRX_ID: 105, DB_ROLL_PTR)\n                                                            |\n                                                            v\n  [Undo Log Entry 1]:               Balance: $400  (DB_TRX_ID: 102, DB_ROLL_PTR)\n                                                            |\n                                                            v\n  [Undo Log Entry 2]:               Balance: $200  (DB_TRX_ID: 98,  DB_ROLL_PTR = NULL)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SELECT queries do NOT acquire locks! They perform consistent snapshot reads by traversing the Undo chain.",
          "Writers do not block readers, and readers do not block writers."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Inspecting Transaction Status & Active Undo History",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nQueries `information_schema.innodb_trx` to monitor running transactions and `Innodb_history_list_length` to detect unpurged undo records.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Inspecting Active Transactions & Undo History Length\nSELECT \n    trx_id,\n    trx_state,\n    trx_started,\n    trx_isolation_level,\n    trx_rows_locked,\n    trx_rows_modified\nFROM information_schema.innodb_trx\nORDER BY trx_started ASC;\n\n-- Check History List Length (Unpurged Undo Logs)\nSELECT variable_value AS undo_history_list_length\nFROM performance_schema.global_status\nWHERE variable_name = 'Innodb_history_list_length';"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Leaving an uncommitted `START TRANSACTION` idle in a web app connection pool holds open the Read View, preventing InnoDB from purging Undo logs. The history list explodes, bloating disk and degrading all reads across the entire cluster.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Inspecting Active Transactions & Undo History Length\nSELECT \n    trx_id,\n    trx_state,\n    trx_started,\n    trx_isolation_level,\n    trx_rows_locked,\n    trx_rows_modified\nFROM information_schema.innodb_trx\nORDER BY trx_started ASC;\n\n-- Check History List Length (Unpurged Undo Logs)\nSELECT variable_value AS undo_history_list_length\nFROM performance_schema.global_status\nWHERE variable_name = 'Innodb_history_list_length';"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 10:\\n\\n**Question**: In REPEATABLE READ isolation, when is the MVCC Read View created?\\n\\n**Explanation**: In REPEATABLE READ, the Read View is established upon the first consistent read (SELECT) and remains unchanged until the transaction commits or rolls back.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "In REPEATABLE READ isolation, when is the MVCC Read View created?",
        "solution": "-- Correct Answer: Option 2 (At the first SELECT query executed within the transaction)"
      }
    ]
  },
  "11": {
    "month": 3,
    "week": 11,
    "title": "Week 11: Locking Internals & Canonical Deadlock Immunity",
    "cloudDataset": "Google Cloud Bitcoin & Ethereum Public Blockchain",
    "time": "40 min read",
    "overview": "Master row-level locking internals in InnoDB: Record Locks, Gap Locks, and Next-Key Locks. Understand the mathematical cause of Deadlocks (Error 1213) and implement Dijkstra's Resource Hierarchy (Canonical Lock Ordering) using LEAST() and GREATEST() for 100% deadlock immunity under massive concurrency.",
    "sections": [
      {
        "heading": "1. The Three Types of Row Locks",
        "content": "InnoDB implements sophisticated fine-grained locking to enforce serializability while maximizing concurrency:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       THE THREE INNODB ROW LOCK TYPES                         |\n+-------------------------------------------------------------------------------+\n  1. Record Lock:   Locks the physical index record itself.\n                    (Prevents concurrent UPDATE or DELETE of that exact key)\n                    \n  2. Gap Lock:      Locks the empty space (gap) between two index records.\n                    (Prevents concurrent INSERT into that gap, preventing Phantoms!)\n                    \n  3. Next-Key Lock: Combination of a Record Lock on the index row + Gap Lock on\n                    the gap immediately preceding it. (Default in Repeatable Read!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Gap locks exist purely to prevent concurrent transactions from inserting new rows (Phantom Reads).",
          "Switching transaction isolation from REPEATABLE READ to READ COMMITTED disables Gap Locks (except for foreign keys), dramatically reducing deadlocks."
        ]
      },
      {
        "heading": "2. The Mathematical Anatomy of a Deadlock (Error 1213)",
        "content": "A deadlock occurs when two or more transactions hold locks that the other needs, creating a circular wait graph:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CIRCULAR DEADLOCK GRAPH                             |\n+-------------------------------------------------------------------------------+\n  Transaction 1: Locks Account A -> Requests lock on Account B (Blocked!)\n       ^                                                |\n       |                                                v\n  Transaction 2: Locks Account B -> Requests lock on Account A (Blocked!)\n  \n  [Engine Action]: MySQL Deadlock Detector identifies cycle -> Arbitrarily kills\n                   the transaction with the fewest modified rows (Rollback Error 1213).\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Deadlocks are NOT application bugs; they are a normal consequence of concurrent locking in relational engines.",
          "Applications must be built to catch Error 1213 and automatically retry with exponential backoff."
        ]
      },
      {
        "heading": "3. Canonical Lock Ordering: Mathematical Deadlock Immunity",
        "content": "You can eliminate deadlocks entirely by enforcing Dijkstra's Resource Hierarchy: transactions must always acquire locks in the exact same global order. In transfers between two accounts (A and B), always lock `LEAST(A, B)` first, then `GREATEST(A, B)`. Cycles become mathematically impossible!",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CANONICAL LOCK ORDERING                               |\n+-------------------------------------------------------------------------------+\n  Transfer 1 (From Acct 10 to 50): Lock 10 first -> Lock 50 second.\n  Transfer 2 (From Acct 50 to 10): Lock 10 first -> Lock 50 second.\n  \n  Both transactions acquire locks in ascending order (10 -> 50).\n  A circular wait condition cannot form! Deadlocks = 0!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use `WHERE id IN (LEAST(a, b), GREATEST(a, b)) ORDER BY id ASC FOR UPDATE`.",
          "Enforcing global lock ordering guarantees 100% immunity from deadlocks across any number of concurrent threads."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "50-Thread High Concurrency Blockchain Transfers",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.crypto_bitcoin)",
      "table": "blockchain_transactions & accounts",
      "description": "Simulating 50 concurrent payment settlement workers transferring funds between arbitrary accounts, achieving 0 deadlocks across 100,000 transactions via canonical lock ordering."
    },
    "codeTitle": "Canonical Deadlock-Immune Multi-Row Lock Query",
    "code": "-- Canonical Deadlock-Immune Lock Ordering\n-- Always acquires locks in identical numerical order regardless of transfer direction\nSTART TRANSACTION;\n\n-- Transfer from Account 50 to Account 10:\n-- Lock Account 10 FIRST (LEAST), then Account 50 (GREATEST)\nSELECT account_id, current_balance \nFROM accounts \nWHERE account_id IN (LEAST(50, 10), GREATEST(50, 10))\nORDER BY account_id ASC\nFOR UPDATE;\n\n-- Execute Balance Updates Safely:\nUPDATE accounts SET current_balance = current_balance - 100 WHERE account_id = 50;\nUPDATE accounts SET current_balance = current_balance + 100 WHERE account_id = 10;\n\nCOMMIT;",
    "codeExplanation": "Because `LEAST(50, 10)` returns 10 and `GREATEST(50, 10)` returns 50, and `ORDER BY account_id ASC` enforces ascending order, locks are always requested in direction 10 -> 50.",
    "pitfalls": "Senior DBA Gotcha: Foreign keys create hidden shared locks (S-locks) on the referenced parent row during INSERTs on child tables. Concurrent inserts referencing the same parent can deadlock unexpectedly on Gap Locks.",
    "quiz": {
      "question": "How does Canonical Lock Ordering eliminate database deadlocks?",
      "options": [
        "It converts all locks to read locks",
        "It forces all transactions to lock resources in the same global sequence, making circular waits impossible",
        "It turns off row-level locking",
        "It restarts the MySQL daemon"
      ],
      "answer": 1,
      "explanation": "A deadlock requires a circular dependency cycle. By locking resources in a strict deterministic order (e.g. Lowest ID to Highest ID), cycles can never form."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 11: Locking Internals & Canonical Deadlock Immunity",
        "overview": "Master row-level locking internals in InnoDB: Record Locks, Gap Locks, and Next-Key Locks. Understand the mathematical cause of Deadlocks (Error 1213) and implement Dijkstra's Resource Hierarchy (Canonical Lock Ordering) using LEAST() and GREATEST() for 100% deadlock immunity under massive concurrency.",
        "content": "Welcome to Week 11. In this chapter, we bridge fundamental SQL with Week 11: Locking Internals & Canonical Deadlock Immunity. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud Bitcoin & Ethereum Public Blockchain and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud Bitcoin & Ethereum Public Blockchain. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud Bitcoin & Ethereum Public Blockchain"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The Three Types of Row Locks",
        "overview": "First major theoretical principle of this module.",
        "content": "InnoDB implements sophisticated fine-grained locking to enforce serializability while maximizing concurrency:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       THE THREE INNODB ROW LOCK TYPES                         |\n+-------------------------------------------------------------------------------+\n  1. Record Lock:   Locks the physical index record itself.\n                    (Prevents concurrent UPDATE or DELETE of that exact key)\n                    \n  2. Gap Lock:      Locks the empty space (gap) between two index records.\n                    (Prevents concurrent INSERT into that gap, preventing Phantoms!)\n                    \n  3. Next-Key Lock: Combination of a Record Lock on the index row + Gap Lock on\n                    the gap immediately preceding it. (Default in Repeatable Read!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Gap locks exist purely to prevent concurrent transactions from inserting new rows (Phantom Reads).",
          "Switching transaction isolation from REPEATABLE READ to READ COMMITTED disables Gap Locks (except for foreign keys), dramatically reducing deadlocks."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Mathematical Anatomy of a Deadlock (Error 1213)",
        "overview": "Second major theoretical principle of this module.",
        "content": "A deadlock occurs when two or more transactions hold locks that the other needs, creating a circular wait graph:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CIRCULAR DEADLOCK GRAPH                             |\n+-------------------------------------------------------------------------------+\n  Transaction 1: Locks Account A -> Requests lock on Account B (Blocked!)\n       ^                                                |\n       |                                                v\n  Transaction 2: Locks Account B -> Requests lock on Account A (Blocked!)\n  \n  [Engine Action]: MySQL Deadlock Detector identifies cycle -> Arbitrarily kills\n                   the transaction with the fewest modified rows (Rollback Error 1213).\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Deadlocks are NOT application bugs; they are a normal consequence of concurrent locking in relational engines.",
          "Applications must be built to catch Error 1213 and automatically retry with exponential backoff."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Canonical Deadlock-Immune Multi-Row Lock Query",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nBecause `LEAST(50, 10)` returns 10 and `GREATEST(50, 10)` returns 50, and `ORDER BY account_id ASC` enforces ascending order, locks are always requested in direction 10 -> 50.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Canonical Deadlock-Immune Lock Ordering\n-- Always acquires locks in identical numerical order regardless of transfer direction\nSTART TRANSACTION;\n\n-- Transfer from Account 50 to Account 10:\n-- Lock Account 10 FIRST (LEAST), then Account 50 (GREATEST)\nSELECT account_id, current_balance \nFROM accounts \nWHERE account_id IN (LEAST(50, 10), GREATEST(50, 10))\nORDER BY account_id ASC\nFOR UPDATE;\n\n-- Execute Balance Updates Safely:\nUPDATE accounts SET current_balance = current_balance - 100 WHERE account_id = 50;\nUPDATE accounts SET current_balance = current_balance + 100 WHERE account_id = 10;\n\nCOMMIT;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Foreign keys create hidden shared locks (S-locks) on the referenced parent row during INSERTs on child tables. Concurrent inserts referencing the same parent can deadlock unexpectedly on Gap Locks.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Canonical Deadlock-Immune Lock Ordering\n-- Always acquires locks in identical numerical order regardless of transfer direction\nSTART TRANSACTION;\n\n-- Transfer from Account 50 to Account 10:\n-- Lock Account 10 FIRST (LEAST), then Account 50 (GREATEST)\nSELECT account_id, current_balance \nFROM accounts \nWHERE account_id IN (LEAST(50, 10), GREATEST(50, 10))\nORDER BY account_id ASC\nFOR UPDATE;\n\n-- Execute Balance Updates Safely:\nUPDATE accounts SET current_balance = current_balance - 100 WHERE account_id = 50;\nUPDATE accounts SET current_balance = current_balance + 100 WHERE account_id = 10;\n\nCOMMIT;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 11:\\n\\n**Question**: How does Canonical Lock Ordering eliminate database deadlocks?\\n\\n**Explanation**: A deadlock requires a circular dependency cycle. By locking resources in a strict deterministic order (e.g. Lowest ID to Highest ID), cycles can never form.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "How does Canonical Lock Ordering eliminate database deadlocks?",
        "solution": "-- Correct Answer: Option 2 (It forces all transactions to lock resources in the same global sequence, making circular waits impossible)"
      }
    ]
  },
  "12": {
    "month": 3,
    "week": 12,
    "title": "Week 12: Production Server Tuning & Slow Query Profiling",
    "cloudDataset": "AWS Open Data & Google Cloud Big Data Production Telemetry",
    "time": "40 min read",
    "overview": "Learn how Senior DBAs configure MySQL 8 for maximum throughput and stability. Master memory sizing guidelines for my.cnf, analyze production slow query logs with pt-query-digest, and profile lock contention using the Performance Schema.",
    "sections": [
      {
        "heading": "1. Production my.cnf Memory Sizing Rules",
        "content": "Out of the box, MySQL defaults are configured for small 1GB development machines. On dedicated production database servers (e.g. 64GB RAM), proper parameter sizing is mandatory:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      PRODUCTION 64GB RAM SERVER ALLOCATION                    |\n+-------------------------------------------------------------------------------+\n  [innodb_buffer_pool_size]:   48GB  (70-75% of total server RAM)\n  [innodb_buffer_pool_instances]: 8  (6GB per instance, eliminates mutex bottleneck)\n  [innodb_log_file_size]:       4GB  (Total 8GB across 2 files; 1hr write capacity)\n  [OS & Connection Memory]:     12GB (Reserved for sort/join buffers & Linux kernel)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Never exceed 80% RAM for `innodb_buffer_pool_size` or Linux OOM killer will kill the MySQL process.",
          "Ensure `innodb_log_file_size` is sized to absorb 1 to 2 hours of peak writes without checkpoint stalls."
        ]
      },
      {
        "heading": "2. Slow Query Log Profiling with pt-query-digest",
        "content": "Enabling the Slow Query Log with sub-second precision (`long_query_time = 0.05` for 50ms) allows capturing latency outliers. Using Percona Toolkit's `pt-query-digest` aggregates millions of queries into ranked fingerprint reports based on total execution time and row lock latency.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        pt-query-digest RANKING METRICS                        |\n+-------------------------------------------------------------------------------+\n  Rank  Query Fingerprint               Total Time  Calls   Avg Time  p95 Time\n  #1    SELECT * FROM orders WHERE ...   4200.5s    150k    0.028s    0.142s (Focus here!)\n  #2    UPDATE accounts SET balance...    840.2s     1.2M   0.0007s   0.002s\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always optimize queries by Rank #1 (Total Cumulative Time) rather than worst single execution time, because cumulative time represents the true server CPU load.",
          "Set `log_queries_not_using_indexes = 1` during development staging to catch missing indexes before production launch."
        ]
      },
      {
        "heading": "3. Diagnosing Mutex Contention via Performance Schema",
        "content": "Under massive multi-threaded concurrency (1,000+ client connections), MySQL can stall on internal mutexes (locks protecting memory data structures). Querying `performance_schema.events_waits_summary_global_by_event_name` pinpoints which mutex is causing thread sleep.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        PERFORMANCE SCHEMA WAIT ANALYSIS                       |\n+-------------------------------------------------------------------------------+\n  Wait Event: wait/synch/mutex/innodb/buf_pool_mutex  -> Split buffer pool instances!\n  Wait Event: wait/io/file/innodb/innodb_data_file    -> Disk IOPS bottleneck!\n  Wait Event: wait/synch/sxlock/innodb/btr_search_latch -> Disable AHI!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "If `btr_search_latch` contention is high, disable the Adaptive Hash Index (`innodb_adaptive_hash_index = 0`).",
          "Ensure `max_connections` is capped reasonably (e.g. 500-1000) and pair with connection poolers like ProxySQL."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Tuning Buffer Pool for 5.6M Rows",
      "source": "MySQL Pro Learning Kit Synthetic & Cloud Datasets",
      "table": "5.6 Million Row Combined Production Database (1.05 GB)",
      "description": "Applying production my.cnf parameters to accelerate bulk loading from 12 minutes to 54 seconds, maintaining 99.8% buffer pool hit ratio."
    },
    "codeTitle": "Top 5 Most Expensive Wait Events via Performance Schema",
    "code": "-- Top 5 Most Expensive Wait Events via Performance Schema\nSELECT \n    event_name,\n    count_star AS total_waits,\n    ROUND(sum_timer_wait / 1000000000000, 3) AS total_wait_seconds,\n    ROUND(avg_timer_wait / 1000000000, 3) AS avg_wait_milliseconds\nFROM performance_schema.events_waits_summary_global_by_event_name\nWHERE sum_timer_wait > 0\n  AND event_name NOT LIKE 'idle%'\nORDER BY sum_timer_wait DESC\nLIMIT 5;",
    "codeExplanation": "Identifies the highest cumulative wait bottlenecks on the server, distinguishing between disk I/O waits, row lock waits, and internal engine mutex contention.",
    "pitfalls": "Senior DBA Gotcha: Setting per-connection buffers (`sort_buffer_size`, `join_buffer_size`) too high (e.g. 256MB each). Because each client connection allocates these buffers independently, 500 concurrent connections can instantly trigger multi-gigabyte memory spikes and crash the OS.",
    "quiz": {
      "question": "What percentage of total server RAM should typically be allocated to innodb_buffer_pool_size on a dedicated database server?",
      "options": [
        "25-30%",
        "50%",
        "70-75%",
        "95%"
      ],
      "answer": 2,
      "explanation": "70-75% is standard practice on dedicated database servers. The remaining 25% is critical for the Linux OS kernel, page cache, socket connections, and per-thread memory buffers."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 12: Production Server Tuning & Slow Query Profiling",
        "overview": "Learn how Senior DBAs configure MySQL 8 for maximum throughput and stability. Master memory sizing guidelines for my.cnf, analyze production slow query logs with pt-query-digest, and profile lock contention using the Performance Schema.",
        "content": "Welcome to Week 12. In this chapter, we bridge fundamental SQL with Week 12: Production Server Tuning & Slow Query Profiling. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data & Google Cloud Big Data Production Telemetry and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data & Google Cloud Big Data Production Telemetry. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data & Google Cloud Big Data Production Telemetry"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Production my.cnf Memory Sizing Rules",
        "overview": "First major theoretical principle of this module.",
        "content": "Out of the box, MySQL defaults are configured for small 1GB development machines. On dedicated production database servers (e.g. 64GB RAM), proper parameter sizing is mandatory:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      PRODUCTION 64GB RAM SERVER ALLOCATION                    |\n+-------------------------------------------------------------------------------+\n  [innodb_buffer_pool_size]:   48GB  (70-75% of total server RAM)\n  [innodb_buffer_pool_instances]: 8  (6GB per instance, eliminates mutex bottleneck)\n  [innodb_log_file_size]:       4GB  (Total 8GB across 2 files; 1hr write capacity)\n  [OS & Connection Memory]:     12GB (Reserved for sort/join buffers & Linux kernel)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Never exceed 80% RAM for `innodb_buffer_pool_size` or Linux OOM killer will kill the MySQL process.",
          "Ensure `innodb_log_file_size` is sized to absorb 1 to 2 hours of peak writes without checkpoint stalls."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Slow Query Log Profiling with pt-query-digest",
        "overview": "Second major theoretical principle of this module.",
        "content": "Enabling the Slow Query Log with sub-second precision (`long_query_time = 0.05` for 50ms) allows capturing latency outliers. Using Percona Toolkit's `pt-query-digest` aggregates millions of queries into ranked fingerprint reports based on total execution time and row lock latency.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        pt-query-digest RANKING METRICS                        |\n+-------------------------------------------------------------------------------+\n  Rank  Query Fingerprint               Total Time  Calls   Avg Time  p95 Time\n  #1    SELECT * FROM orders WHERE ...   4200.5s    150k    0.028s    0.142s (Focus here!)\n  #2    UPDATE accounts SET balance...    840.2s     1.2M   0.0007s   0.002s\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always optimize queries by Rank #1 (Total Cumulative Time) rather than worst single execution time, because cumulative time represents the true server CPU load.",
          "Set `log_queries_not_using_indexes = 1` during development staging to catch missing indexes before production launch."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Top 5 Most Expensive Wait Events via Performance Schema",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nIdentifies the highest cumulative wait bottlenecks on the server, distinguishing between disk I/O waits, row lock waits, and internal engine mutex contention.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Top 5 Most Expensive Wait Events via Performance Schema\nSELECT \n    event_name,\n    count_star AS total_waits,\n    ROUND(sum_timer_wait / 1000000000000, 3) AS total_wait_seconds,\n    ROUND(avg_timer_wait / 1000000000, 3) AS avg_wait_milliseconds\nFROM performance_schema.events_waits_summary_global_by_event_name\nWHERE sum_timer_wait > 0\n  AND event_name NOT LIKE 'idle%'\nORDER BY sum_timer_wait DESC\nLIMIT 5;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Setting per-connection buffers (`sort_buffer_size`, `join_buffer_size`) too high (e.g. 256MB each). Because each client connection allocates these buffers independently, 500 concurrent connections can instantly trigger multi-gigabyte memory spikes and crash the OS.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Top 5 Most Expensive Wait Events via Performance Schema\nSELECT \n    event_name,\n    count_star AS total_waits,\n    ROUND(sum_timer_wait / 1000000000000, 3) AS total_wait_seconds,\n    ROUND(avg_timer_wait / 1000000000, 3) AS avg_wait_milliseconds\nFROM performance_schema.events_waits_summary_global_by_event_name\nWHERE sum_timer_wait > 0\n  AND event_name NOT LIKE 'idle%'\nORDER BY sum_timer_wait DESC\nLIMIT 5;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 12:\\n\\n**Question**: What percentage of total server RAM should typically be allocated to innodb_buffer_pool_size on a dedicated database server?\\n\\n**Explanation**: 70-75% is standard practice on dedicated database servers. The remaining 25% is critical for the Linux OS kernel, page cache, socket connections, and per-thread memory buffers.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What percentage of total server RAM should typically be allocated to innodb_buffer_pool_size on a dedicated database server?",
        "solution": "-- Correct Answer: Option 3 (70-75%)"
      }
    ]
  },
  "13": {
    "month": 4,
    "week": 13,
    "title": "Week 13: High-Speed Bulk Data Ingestion & Cloud Streaming",
    "cloudDataset": "AWS Open Data NYC Taxi & Common Crawl WARC Index",
    "time": "35 min read",
    "overview": "Learn how to ingest millions of records from cloud buckets into MySQL at 50,000+ rows/sec. Master session-level optimization switches (foreign_key_checks, unique_checks, autocommit), LOAD DATA LOCAL INFILE performance tuning, and parallel chunk streaming.",
    "sections": [
      {
        "heading": "1. The 4 Session Switches for 20x Ingestion Speedup",
        "content": "By default, every inserted row triggers foreign key validation, secondary index uniqueness checks, and binary log serialization. Disabling these checks during bulk ingestion unlocks near wire-speed disk writing:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       HIGH-SPEED BULK SESSION SWITCHES                        |\n+-------------------------------------------------------------------------------+\n  SET foreign_key_checks = 0;   -- Skips parent table validation lookups\n  SET unique_checks = 0;        -- Defers secondary index uniqueness verification\n  SET sql_log_bin = 0;          -- Disables binary logging (Bypasses replication I/O)\n  SET autocommit = 0;           -- Replaces per-row commits with large transaction batches\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Disabling unique_checks allows InnoDB to buffer secondary index inserts in the Change Buffer rather than performing random disk seeks.",
          "Always re-enable checks (`SET foreign_key_checks = 1; SET unique_checks = 1;`) after ingestion completes!"
        ]
      },
      {
        "heading": "2. LOAD DATA LOCAL INFILE vs INSERT Multi-Row",
        "content": "Standard multi-row `INSERT INTO ... VALUES (...), (...)` requires the query parser to parse SQL syntax for every value. `LOAD DATA LOCAL INFILE` bypasses the SQL parser, streaming raw byte streams directly into the storage engine's row serializer:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      INGESTION METHOD THROUGHPUT COMPARISON                   |\n+-------------------------------------------------------------------------------+\n  Single-Row INSERTs:           ~1,500 rows/sec   (Parser overhead + per-row fsync)\n  Multi-Row INSERTs (1,000 batch): ~18,000 rows/sec (Reduced round-trips)\n  LOAD DATA LOCAL INFILE:        ~85,000 rows/sec (Bypasses parser, direct raw stream!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "LOAD DATA LOCAL INFILE is the fastest standard ingestion mechanism in MySQL.",
          "Requires `local_infile = 1` on both server and client configurations for security validation."
        ]
      },
      {
        "heading": "3. Streaming Direct from Cloud S3 to MySQL",
        "content": "Modern cloud architectures stream parquet files from public S3 buckets directly through memory pipes (using DuckDB or PyArrow) without saving intermediate gigabyte files to local disk, converting columnar formats into tab-separated streams piped straight into MySQL.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         DIRECT CLOUD S3 STREAMING PIPE                        |\n+-------------------------------------------------------------------------------+\n  [AWS Open Data S3] ---> [In-Memory DuckDB Stream] ---> [MySQL LOAD DATA INFILE]\n  (Zero disk buffering; streams 100M rows across cloud networks in real time!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use chunked batching (100,000 to 500,000 rows per transaction) to keep Undo Log size bounded.",
          "Avoid single transactions exceeding 5 million rows to prevent buffer pool memory exhaustion."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Ingesting 1.5 Million NYC Taxi Cloud Trips",
      "source": "AWS Open Data Registry (s3://nyc-tlc/trip data/)",
      "table": "nyc_yellow_taxi_trips (500 GB)",
      "description": "Streaming a 50MB parquet chunk (1.5M trips) from AWS CloudFront directly into partitioned MySQL in under 45 seconds using high-speed session parameters."
    },
    "codeTitle": "Optimized Production Bulk Loading Session",
    "code": "-- High-Throughput Bulk Ingestion Session Template\n-- 1. Disable safety constraints for ingestion duration\nSET foreign_key_checks = 0;\nSET unique_checks = 0;\nSET sql_log_bin = 0;\nSET autocommit = 0;\n\n-- 2. Execute Bulk Load (Bypasses SQL query parser)\n-- LOAD DATA LOCAL INFILE '/tmp/nyc_taxi_sample.csv'\n-- INTO TABLE nyc_yellow_taxi_trips\n-- FIELDS TERMINATED BY ',' ENCLOSED BY '\"'\n-- LINES TERMINATED BY '\\n'\n-- IGNORE 1 ROWS;\n\n-- 3. Commit the batch\nCOMMIT;\n\n-- 4. Re-enable all production safety constraints\nSET foreign_key_checks = 1;\nSET unique_checks = 1;\nSET sql_log_bin = 1;\nSET autocommit = 1;",
    "codeExplanation": "Demonstrates the canonical 4-step sequence for multi-million row ingestion: disable constraints, execute bulk stream, commit batch, and re-enable constraints.",
    "pitfalls": "Senior DBA Gotcha: Ingesting millions of rows without `autocommit = 0` creates an individual transaction and redo log flush for every row, taking hours instead of seconds. Ingesting everything in one massive transaction without intermediate commits can exhaust Undo space.",
    "quiz": {
      "question": "Why does setting unique_checks = 0 dramatically accelerate bulk insertion into InnoDB?",
      "options": [
        "It turns off the CPU cache",
        "It allows InnoDB to use the Change Buffer to defer secondary index I/O instead of reading leaf pages from disk immediately",
        "It converts the table to MyISAM",
        "It deletes duplicate rows automatically"
      ],
      "answer": 1,
      "explanation": "When unique_checks is disabled, InnoDB does not need to synchronously load secondary index pages from disk to verify uniqueness; it buffers insertions in the Change Buffer, writing them asynchronously."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 13: High-Speed Bulk Data Ingestion & Cloud Streaming",
        "overview": "Learn how to ingest millions of records from cloud buckets into MySQL at 50,000+ rows/sec. Master session-level optimization switches (foreign_key_checks, unique_checks, autocommit), LOAD DATA LOCAL INFILE performance tuning, and parallel chunk streaming.",
        "content": "Welcome to Week 13. In this chapter, we bridge fundamental SQL with Week 13: High-Speed Bulk Data Ingestion & Cloud Streaming. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC Taxi & Common Crawl WARC Index and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC Taxi & Common Crawl WARC Index. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC Taxi & Common Crawl WARC Index"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The 4 Session Switches for 20x Ingestion Speedup",
        "overview": "First major theoretical principle of this module.",
        "content": "By default, every inserted row triggers foreign key validation, secondary index uniqueness checks, and binary log serialization. Disabling these checks during bulk ingestion unlocks near wire-speed disk writing:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       HIGH-SPEED BULK SESSION SWITCHES                        |\n+-------------------------------------------------------------------------------+\n  SET foreign_key_checks = 0;   -- Skips parent table validation lookups\n  SET unique_checks = 0;        -- Defers secondary index uniqueness verification\n  SET sql_log_bin = 0;          -- Disables binary logging (Bypasses replication I/O)\n  SET autocommit = 0;           -- Replaces per-row commits with large transaction batches\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Disabling unique_checks allows InnoDB to buffer secondary index inserts in the Change Buffer rather than performing random disk seeks.",
          "Always re-enable checks (`SET foreign_key_checks = 1; SET unique_checks = 1;`) after ingestion completes!"
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. LOAD DATA LOCAL INFILE vs INSERT Multi-Row",
        "overview": "Second major theoretical principle of this module.",
        "content": "Standard multi-row `INSERT INTO ... VALUES (...), (...)` requires the query parser to parse SQL syntax for every value. `LOAD DATA LOCAL INFILE` bypasses the SQL parser, streaming raw byte streams directly into the storage engine's row serializer:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      INGESTION METHOD THROUGHPUT COMPARISON                   |\n+-------------------------------------------------------------------------------+\n  Single-Row INSERTs:           ~1,500 rows/sec   (Parser overhead + per-row fsync)\n  Multi-Row INSERTs (1,000 batch): ~18,000 rows/sec (Reduced round-trips)\n  LOAD DATA LOCAL INFILE:        ~85,000 rows/sec (Bypasses parser, direct raw stream!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "LOAD DATA LOCAL INFILE is the fastest standard ingestion mechanism in MySQL.",
          "Requires `local_infile = 1` on both server and client configurations for security validation."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Optimized Production Bulk Loading Session",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nDemonstrates the canonical 4-step sequence for multi-million row ingestion: disable constraints, execute bulk stream, commit batch, and re-enable constraints.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- High-Throughput Bulk Ingestion Session Template\n-- 1. Disable safety constraints for ingestion duration\nSET foreign_key_checks = 0;\nSET unique_checks = 0;\nSET sql_log_bin = 0;\nSET autocommit = 0;\n\n-- 2. Execute Bulk Load (Bypasses SQL query parser)\n-- LOAD DATA LOCAL INFILE '/tmp/nyc_taxi_sample.csv'\n-- INTO TABLE nyc_yellow_taxi_trips\n-- FIELDS TERMINATED BY ',' ENCLOSED BY '\"'\n-- LINES TERMINATED BY '\\n'\n-- IGNORE 1 ROWS;\n\n-- 3. Commit the batch\nCOMMIT;\n\n-- 4. Re-enable all production safety constraints\nSET foreign_key_checks = 1;\nSET unique_checks = 1;\nSET sql_log_bin = 1;\nSET autocommit = 1;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Ingesting millions of rows without `autocommit = 0` creates an individual transaction and redo log flush for every row, taking hours instead of seconds. Ingesting everything in one massive transaction without intermediate commits can exhaust Undo space.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- High-Throughput Bulk Ingestion Session Template\n-- 1. Disable safety constraints for ingestion duration\nSET foreign_key_checks = 0;\nSET unique_checks = 0;\nSET sql_log_bin = 0;\nSET autocommit = 0;\n\n-- 2. Execute Bulk Load (Bypasses SQL query parser)\n-- LOAD DATA LOCAL INFILE '/tmp/nyc_taxi_sample.csv'\n-- INTO TABLE nyc_yellow_taxi_trips\n-- FIELDS TERMINATED BY ',' ENCLOSED BY '\"'\n-- LINES TERMINATED BY '\\n'\n-- IGNORE 1 ROWS;\n\n-- 3. Commit the batch\nCOMMIT;\n\n-- 4. Re-enable all production safety constraints\nSET foreign_key_checks = 1;\nSET unique_checks = 1;\nSET sql_log_bin = 1;\nSET autocommit = 1;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 13:\\n\\n**Question**: Why does setting unique_checks = 0 dramatically accelerate bulk insertion into InnoDB?\\n\\n**Explanation**: When unique_checks is disabled, InnoDB does not need to synchronously load secondary index pages from disk to verify uniqueness; it buffers insertions in the Change Buffer, writing them asynchronously.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Why does setting unique_checks = 0 dramatically accelerate bulk insertion into InnoDB?",
        "solution": "-- Correct Answer: Option 2 (It allows InnoDB to use the Change Buffer to defer secondary index I/O instead of reading leaf pages from disk immediately)"
      }
    ]
  },
  "14": {
    "month": 4,
    "week": 14,
    "title": "Week 14: Spatial GIS Analytics on Urban Transit & Networks",
    "cloudDataset": "AWS Open Data NYC TLC Taxi & Global Airports Spatial Datasets",
    "time": "35 min read",
    "overview": "Master MySQL 8 Spatial GIS capabilities. Learn OpenGIS spatial geometries (Point, LineString, Polygon), spatial reference systems (SRID 4326 WGS 84), R-Tree spatial indexing, and high-performance distance queries using ST_Distance_Sphere.",
    "sections": [
      {
        "heading": "1. OpenGIS Spatial Geometries & SRID 4326",
        "content": "MySQL 8 provides native data types for geographical and geometric data based on OpenGIS standards. For geographic coordinates (latitude and longitude on Earth), always specify SRID 4326 (WGS 84 coordinate reference system):",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           OPENGIS GEOMETRY TYPES                              |\n+-------------------------------------------------------------------------------+\n  POINT(lon, lat)             -> Exact location coordinate (e.g. Taxi Pickup)\n  LINESTRING(pt1, pt2, ...)   -> Path / Route / Transit trajectory\n  POLYGON((pt1, pt2, ...))    -> Enclosed boundary (e.g. Borough / Delivery Zone)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always declare spatial columns with explicit SRID: `pickup_point POINT NOT NULL SRID 4326`.",
          "In MySQL 8, geographic coordinates for SRID 4326 are ordered `POINT(latitude, longitude)` or `POINT(longitude, latitude)` depending on the axis order; consistency is vital."
        ]
      },
      {
        "heading": "2. R-Tree Spatial Indexing Architecture",
        "content": "Standard B+ Trees only sort 1-dimensional values (e.g. numbers, dates, strings). They cannot index 2-dimensional spatial coordinates. MySQL implements R-Trees (Rectangle Trees), which group spatial objects into hierarchically nested Minimum Bounding Boxes (MBR):",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            R-TREE SPATIAL INDEX                               |\n+-------------------------------------------------------------------------------+\n  [Root MBR: Whole City]\n    \u251c\u2500\u2500 [Child MBR 1: Manhattan] ---> Points: Times Square, Central Park\n    \u2514\u2500\u2500 [Child MBR 2: Brooklyn]  ---> Points: DUMBO, Williamsburg\n  (Search for points within 1 mile eliminates 95% of city geometry instantly!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SPATIAL indexes can only be created on `NOT NULL` columns with an explicit SRID.",
          "R-Trees accelerate bounding-box operations like `ST_Contains()` and `MBRIntersects()`."
        ]
      },
      {
        "heading": "3. High-Speed Geographic Distance: ST_Distance_Sphere",
        "content": "Calculating distances across the curved surface of the Earth using the Haversine formula in pure SQL is slow and CPU-heavy. MySQL 8 provides `ST_Distance_Sphere()`, which computes great-circle distance in meters using an idealized spherical Earth with extreme speed:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        ST_Distance_Sphere GEOMETRY                            |\n+-------------------------------------------------------------------------------+\n  Point A: JFK Airport  POINT(-73.7781, 40.6413)\n  Point B: Times Square POINT(-73.9851, 40.7589)\n  \n  SELECT ST_Distance_Sphere(Point_A, Point_B);\n  Result: 21,340 meters (21.34 km) calculated in 0.001ms!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use `ST_Distance_Sphere(pt1, pt2)` for fast meter calculations.",
          "Combine with bounding box filters (`MBRContains`) to prune candidates before running spherical trigonometry."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "NYC Taxi Urban Transit Geofencing",
      "source": "AWS Open Data NYC TLC Records & Borough GIS Boundaries",
      "table": "nyc_yellow_taxi_trips (1.5B+ rows)",
      "description": "Geofencing airport pickups at JFK and LaGuardia using polygon containment queries and calculating passenger trip travel distance accuracy."
    },
    "codeTitle": "Spatial Distance Calculation with ST_Distance_Sphere",
    "code": "-- Calculating Great-Circle Distance on Urban Transit Coordinates\n-- Uses ST_Distance_Sphere to compute distance in kilometers\nSELECT \n    'JFK to Times Square' AS transit_route,\n    -- Point 1: JFK Airport, Point 2: Times Square\n    ROUND(\n        ST_Distance_Sphere(\n            ST_PointFromText('POINT(-73.7781 40.6413)'),\n            ST_PointFromText('POINT(-73.9851 40.7589)')\n        ) / 1000.0, \n        2\n    ) AS distance_kilometers;",
    "codeExplanation": "Constructs two spatial points using `ST_PointFromText` and calculates the spherical great-circle distance in meters, dividing by 1,000 for kilometers.",
    "pitfalls": "Senior DBA Gotcha: Creating a SPATIAL index on a geometry column that allows NULLs causes `ERROR 1252: All parts of a SPATIAL index must be NOT NULL`. Always specify `NOT NULL SRID 4326` on creation.",
    "quiz": {
      "question": "What type of index does MySQL use to optimize two-dimensional geographic spatial queries?",
      "options": [
        "B+ Tree",
        "Hash Index",
        "R-Tree (Rectangle Tree)",
        "Inverted Full-Text Index"
      ],
      "answer": 2,
      "explanation": "MySQL uses R-Trees (Minimum Bounding Box hierarchy) to index multi-dimensional geometric coordinates."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 14: Spatial GIS Analytics on Urban Transit & Networks",
        "overview": "Master MySQL 8 Spatial GIS capabilities. Learn OpenGIS spatial geometries (Point, LineString, Polygon), spatial reference systems (SRID 4326 WGS 84), R-Tree spatial indexing, and high-performance distance queries using ST_Distance_Sphere.",
        "content": "Welcome to Week 14. In this chapter, we bridge fundamental SQL with Week 14: Spatial GIS Analytics on Urban Transit & Networks. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC TLC Taxi & Global Airports Spatial Datasets and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC TLC Taxi & Global Airports Spatial Datasets. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC TLC Taxi & Global Airports Spatial Datasets"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. OpenGIS Spatial Geometries & SRID 4326",
        "overview": "First major theoretical principle of this module.",
        "content": "MySQL 8 provides native data types for geographical and geometric data based on OpenGIS standards. For geographic coordinates (latitude and longitude on Earth), always specify SRID 4326 (WGS 84 coordinate reference system):",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           OPENGIS GEOMETRY TYPES                              |\n+-------------------------------------------------------------------------------+\n  POINT(lon, lat)             -> Exact location coordinate (e.g. Taxi Pickup)\n  LINESTRING(pt1, pt2, ...)   -> Path / Route / Transit trajectory\n  POLYGON((pt1, pt2, ...))    -> Enclosed boundary (e.g. Borough / Delivery Zone)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always declare spatial columns with explicit SRID: `pickup_point POINT NOT NULL SRID 4326`.",
          "In MySQL 8, geographic coordinates for SRID 4326 are ordered `POINT(latitude, longitude)` or `POINT(longitude, latitude)` depending on the axis order; consistency is vital."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. R-Tree Spatial Indexing Architecture",
        "overview": "Second major theoretical principle of this module.",
        "content": "Standard B+ Trees only sort 1-dimensional values (e.g. numbers, dates, strings). They cannot index 2-dimensional spatial coordinates. MySQL implements R-Trees (Rectangle Trees), which group spatial objects into hierarchically nested Minimum Bounding Boxes (MBR):",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            R-TREE SPATIAL INDEX                               |\n+-------------------------------------------------------------------------------+\n  [Root MBR: Whole City]\n    \u251c\u2500\u2500 [Child MBR 1: Manhattan] ---> Points: Times Square, Central Park\n    \u2514\u2500\u2500 [Child MBR 2: Brooklyn]  ---> Points: DUMBO, Williamsburg\n  (Search for points within 1 mile eliminates 95% of city geometry instantly!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "SPATIAL indexes can only be created on `NOT NULL` columns with an explicit SRID.",
          "R-Trees accelerate bounding-box operations like `ST_Contains()` and `MBRIntersects()`."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Spatial Distance Calculation with ST_Distance_Sphere",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nConstructs two spatial points using `ST_PointFromText` and calculates the spherical great-circle distance in meters, dividing by 1,000 for kilometers.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Calculating Great-Circle Distance on Urban Transit Coordinates\n-- Uses ST_Distance_Sphere to compute distance in kilometers\nSELECT \n    'JFK to Times Square' AS transit_route,\n    -- Point 1: JFK Airport, Point 2: Times Square\n    ROUND(\n        ST_Distance_Sphere(\n            ST_PointFromText('POINT(-73.7781 40.6413)'),\n            ST_PointFromText('POINT(-73.9851 40.7589)')\n        ) / 1000.0, \n        2\n    ) AS distance_kilometers;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Creating a SPATIAL index on a geometry column that allows NULLs causes `ERROR 1252: All parts of a SPATIAL index must be NOT NULL`. Always specify `NOT NULL SRID 4326` on creation.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Calculating Great-Circle Distance on Urban Transit Coordinates\n-- Uses ST_Distance_Sphere to compute distance in kilometers\nSELECT \n    'JFK to Times Square' AS transit_route,\n    -- Point 1: JFK Airport, Point 2: Times Square\n    ROUND(\n        ST_Distance_Sphere(\n            ST_PointFromText('POINT(-73.7781 40.6413)'),\n            ST_PointFromText('POINT(-73.9851 40.7589)')\n        ) / 1000.0, \n        2\n    ) AS distance_kilometers;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 14:\\n\\n**Question**: What type of index does MySQL use to optimize two-dimensional geographic spatial queries?\\n\\n**Explanation**: MySQL uses R-Trees (Minimum Bounding Box hierarchy) to index multi-dimensional geometric coordinates.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What type of index does MySQL use to optimize two-dimensional geographic spatial queries?",
        "solution": "-- Correct Answer: Option 3 (R-Tree (Rectangle Tree))"
      }
    ]
  },
  "15": {
    "month": 4,
    "week": 15,
    "title": "Week 15: Table Partitioning Architecture on Billions of NYC Taxi Trips",
    "cloudDataset": "AWS Open Data NYC TLC Yellow Taxi Records (s3://nyc-tlc/)",
    "time": "40 min read",
    "overview": "Master enterprise table partitioning in MySQL 8. Learn how to partition tables with billions of rows using PARTITION BY RANGE (TO_DAYS()), understand the strict engine requirement that partition keys must exist in all unique/primary keys, and inspect physical .ibd storage files.",
    "sections": [
      {
        "heading": "1. Why Partition? The Multi-Million Row Boundary",
        "content": "When a table exceeds 50 million to 100 million rows, standard B+ Trees grow to 4-5 levels deep. Random insertions cause severe buffer pool churn because leaf pages cannot fit into memory. Table partitioning physically divides one logical table into multiple independent tablespaces (`.ibd` files) on disk:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    PHYSICAL TABLE PARTITIONING ARCHITECTURE                   |\n+-------------------------------------------------------------------------------+\n  Logical Table: `nyc_yellow_taxi_trips` (1.5 Billion Rows)\n    \u251c\u2500\u2500 Partition p2023_q1: [/var/lib/mysql/nyc_trips#p#p2023_q1.ibd] (Jan - Mar)\n    \u251c\u2500\u2500 Partition p2023_q2: [/var/lib/mysql/nyc_trips#p#p2023_q2.ibd] (Apr - Jun)\n    \u251c\u2500\u2500 Partition p2023_q3: [/var/lib/mysql/nyc_trips#p#p2023_q3.ibd] (Jul - Sep)\n    \u2514\u2500\u2500 Partition p_future: [/var/lib/mysql/nyc_trips#p#p_future.ibd] (MAXVALUE)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Each partition maintains its own independent B+ Tree clustered index and secondary indexes.",
          "Partitioning is for multi-million row tables; partitioning a 50,000-row table adds routing overhead with zero performance benefits."
        ]
      },
      {
        "heading": "2. The Strict Primary Key Rule (Engine Law)",
        "content": "MySQL enforces a non-negotiable architectural invariant: Every unique key on the table (including the PRIMARY KEY) MUST contain every column in the partitioning expression. If you partition by `pickup_datetime`, `pickup_datetime` MUST be part of the Primary Key!",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        THE PARTITION KEY PRIMARY KEY RULE                     |\n+-------------------------------------------------------------------------------+\n  INVALID (Throws Error 1503):\n    PRIMARY KEY (trip_id)\n    PARTITION BY RANGE (TO_DAYS(pickup_datetime));\n    \n  VALID (Correct Composite Primary Key):\n    PRIMARY KEY (trip_id, pickup_datetime)\n    PARTITION BY RANGE (TO_DAYS(pickup_datetime));\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Why this rule exists: When checking uniqueness on an INSERT, MySQL only checks the local partition. If the partition key wasn't in the PK, MySQL would have to scan all partitions across disk, destroying write performance.",
          "Always construct a composite primary key: `PRIMARY KEY (id, partition_date)`."
        ]
      },
      {
        "heading": "3. RANGE Partitioning Mechanics: TO_DAYS vs YEAR",
        "content": "For temporal time-series datasets (taxi rides, financial ledgers, telemetry logs), `PARTITION BY RANGE (TO_DAYS(date_col))` provides daily, monthly, or quarterly granularity:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       RANGE (TO_DAYS) PARTITION BOUNDARIES                    |\n+-------------------------------------------------------------------------------+\n  PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01'))\n  PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01'))\n  PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01'))\n  PARTITION p_max    VALUES LESS THAN (MAXVALUE)  -- Catches future inserts!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always define a `VALUES LESS THAN (MAXVALUE)` partition to prevent INSERT statements from failing when time crosses the last boundary.",
          "Use `REORGANIZE PARTITION` to split the MAXVALUE partition into new quarterly partitions in production."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Quarterly Partitioning on 1.5 Billion Taxi Trips",
      "source": "AWS Open Data Registry (s3://nyc-tlc/trip data/)",
      "table": "nyc_yellow_taxi_trips (500 GB)",
      "description": "Partitioning 1.5 billion taxi trips into quarterly ranges, reducing index depth and enabling instantaneous data lifecycle drops."
    },
    "codeTitle": "DDL Definition for Partitioned Big Data Table",
    "code": "-- Production DDL: Quarterly RANGE Partitioned Table\nCREATE TABLE IF NOT EXISTS nyc_yellow_taxi_trips_partitioned (\n    trip_id BIGINT NOT NULL AUTO_INCREMENT,\n    vendor_id INT,\n    pickup_datetime DATETIME NOT NULL,\n    dropoff_datetime DATETIME,\n    passenger_count INT,\n    trip_distance DECIMAL(8,2),\n    pickup_location_id INT,\n    dropoff_location_id INT,\n    fare_amount DECIMAL(10,2),\n    total_amount DECIMAL(10,2),\n    -- Rule: Partition key MUST be part of composite Primary Key!\n    PRIMARY KEY (trip_id, pickup_datetime),\n    KEY idx_pickup_loc (pickup_location_id, pickup_datetime)\n) ENGINE=InnoDB\nPARTITION BY RANGE (TO_DAYS(pickup_datetime)) (\n    PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),\n    PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),\n    PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),\n    PARTITION p2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),\n    PARTITION p_future VALUES LESS THAN MAXVALUE\n);",
    "codeExplanation": "Defines composite `PRIMARY KEY (trip_id, pickup_datetime)` to satisfy engine rules and partitions the table into quarterly ranges based on `TO_DAYS(pickup_datetime)`.",
    "pitfalls": "Senior DBA Gotcha: Attempting to partition a table where an existing UNIQUE index (e.g., `email VARCHAR(255) UNIQUE`) does NOT contain the partition key results in fatal error ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF. All unique constraints must include the partition column.",
    "quiz": {
      "question": "What happens if you attempt to partition a table by RANGE(order_date) when the PRIMARY KEY is simply (order_id)?",
      "options": [
        "MySQL automatically adds order_date to the primary key",
        "MySQL fails with Error 1503: A PRIMARY KEY must include all columns in the table's partitioning function",
        "The table is created with warning code 1200",
        "It converts the primary key to a secondary index"
      ],
      "answer": 1,
      "explanation": "MySQL strictly enforces Error 1503: every unique key and the primary key must contain every column used in the partitioning expression."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 15: Table Partitioning Architecture on Billions of NYC Taxi Trips",
        "overview": "Master enterprise table partitioning in MySQL 8. Learn how to partition tables with billions of rows using PARTITION BY RANGE (TO_DAYS()), understand the strict engine requirement that partition keys must exist in all unique/primary keys, and inspect physical .ibd storage files.",
        "content": "Welcome to Week 15. In this chapter, we bridge fundamental SQL with Week 15: Table Partitioning Architecture on Billions of NYC Taxi Trips. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC TLC Yellow Taxi Records (s3://nyc-tlc/) and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC TLC Yellow Taxi Records (s3://nyc-tlc/). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC TLC Yellow Taxi Records (s3://nyc-tlc/)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Why Partition? The Multi-Million Row Boundary",
        "overview": "First major theoretical principle of this module.",
        "content": "When a table exceeds 50 million to 100 million rows, standard B+ Trees grow to 4-5 levels deep. Random insertions cause severe buffer pool churn because leaf pages cannot fit into memory. Table partitioning physically divides one logical table into multiple independent tablespaces (`.ibd` files) on disk:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                    PHYSICAL TABLE PARTITIONING ARCHITECTURE                   |\n+-------------------------------------------------------------------------------+\n  Logical Table: `nyc_yellow_taxi_trips` (1.5 Billion Rows)\n    \u251c\u2500\u2500 Partition p2023_q1: [/var/lib/mysql/nyc_trips#p#p2023_q1.ibd] (Jan - Mar)\n    \u251c\u2500\u2500 Partition p2023_q2: [/var/lib/mysql/nyc_trips#p#p2023_q2.ibd] (Apr - Jun)\n    \u251c\u2500\u2500 Partition p2023_q3: [/var/lib/mysql/nyc_trips#p#p2023_q3.ibd] (Jul - Sep)\n    \u2514\u2500\u2500 Partition p_future: [/var/lib/mysql/nyc_trips#p#p_future.ibd] (MAXVALUE)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Each partition maintains its own independent B+ Tree clustered index and secondary indexes.",
          "Partitioning is for multi-million row tables; partitioning a 50,000-row table adds routing overhead with zero performance benefits."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Strict Primary Key Rule (Engine Law)",
        "overview": "Second major theoretical principle of this module.",
        "content": "MySQL enforces a non-negotiable architectural invariant: Every unique key on the table (including the PRIMARY KEY) MUST contain every column in the partitioning expression. If you partition by `pickup_datetime`, `pickup_datetime` MUST be part of the Primary Key!",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        THE PARTITION KEY PRIMARY KEY RULE                     |\n+-------------------------------------------------------------------------------+\n  INVALID (Throws Error 1503):\n    PRIMARY KEY (trip_id)\n    PARTITION BY RANGE (TO_DAYS(pickup_datetime));\n    \n  VALID (Correct Composite Primary Key):\n    PRIMARY KEY (trip_id, pickup_datetime)\n    PARTITION BY RANGE (TO_DAYS(pickup_datetime));\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Why this rule exists: When checking uniqueness on an INSERT, MySQL only checks the local partition. If the partition key wasn't in the PK, MySQL would have to scan all partitions across disk, destroying write performance.",
          "Always construct a composite primary key: `PRIMARY KEY (id, partition_date)`."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - DDL Definition for Partitioned Big Data Table",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nDefines composite `PRIMARY KEY (trip_id, pickup_datetime)` to satisfy engine rules and partitions the table into quarterly ranges based on `TO_DAYS(pickup_datetime)`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Production DDL: Quarterly RANGE Partitioned Table\nCREATE TABLE IF NOT EXISTS nyc_yellow_taxi_trips_partitioned (\n    trip_id BIGINT NOT NULL AUTO_INCREMENT,\n    vendor_id INT,\n    pickup_datetime DATETIME NOT NULL,\n    dropoff_datetime DATETIME,\n    passenger_count INT,\n    trip_distance DECIMAL(8,2),\n    pickup_location_id INT,\n    dropoff_location_id INT,\n    fare_amount DECIMAL(10,2),\n    total_amount DECIMAL(10,2),\n    -- Rule: Partition key MUST be part of composite Primary Key!\n    PRIMARY KEY (trip_id, pickup_datetime),\n    KEY idx_pickup_loc (pickup_location_id, pickup_datetime)\n) ENGINE=InnoDB\nPARTITION BY RANGE (TO_DAYS(pickup_datetime)) (\n    PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),\n    PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),\n    PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),\n    PARTITION p2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),\n    PARTITION p_future VALUES LESS THAN MAXVALUE\n);"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Attempting to partition a table where an existing UNIQUE index (e.g., `email VARCHAR(255) UNIQUE`) does NOT contain the partition key results in fatal error ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF. All unique constraints must include the partition column.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Production DDL: Quarterly RANGE Partitioned Table\nCREATE TABLE IF NOT EXISTS nyc_yellow_taxi_trips_partitioned (\n    trip_id BIGINT NOT NULL AUTO_INCREMENT,\n    vendor_id INT,\n    pickup_datetime DATETIME NOT NULL,\n    dropoff_datetime DATETIME,\n    passenger_count INT,\n    trip_distance DECIMAL(8,2),\n    pickup_location_id INT,\n    dropoff_location_id INT,\n    fare_amount DECIMAL(10,2),\n    total_amount DECIMAL(10,2),\n    -- Rule: Partition key MUST be part of composite Primary Key!\n    PRIMARY KEY (trip_id, pickup_datetime),\n    KEY idx_pickup_loc (pickup_location_id, pickup_datetime)\n) ENGINE=InnoDB\nPARTITION BY RANGE (TO_DAYS(pickup_datetime)) (\n    PARTITION p2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),\n    PARTITION p2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),\n    PARTITION p2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),\n    PARTITION p2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),\n    PARTITION p_future VALUES LESS THAN MAXVALUE\n);"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 15:\\n\\n**Question**: What happens if you attempt to partition a table by RANGE(order_date) when the PRIMARY KEY is simply (order_id)?\\n\\n**Explanation**: MySQL strictly enforces Error 1503: every unique key and the primary key must contain every column used in the partitioning expression.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What happens if you attempt to partition a table by RANGE(order_date) when the PRIMARY KEY is simply (order_id)?",
        "solution": "-- Correct Answer: Option 2 (MySQL fails with Error 1503: A PRIMARY KEY must include all columns in the table's partitioning function)"
      }
    ]
  },
  "16": {
    "month": 4,
    "week": 16,
    "title": "Week 16: Partition Pruning & Zero-Downtime Data Aging",
    "cloudDataset": "AWS Open Data NYC TLC Taxi & Financial Ledgers",
    "time": "35 min read",
    "overview": "Learn how the query optimizer achieves 10x-50x speedups via Partition Pruning, and how to execute sub-10ms data purging across millions of historical rows using ALTER TABLE DROP PARTITION instead of destructive DELETE statements.",
    "sections": [
      {
        "heading": "1. Partition Pruning: Eliminating Physical Tablespaces",
        "content": "Partition Pruning is an optimization where the query engine analyzes WHERE predicates and only opens and scans physical `.ibd` partition files that can mathematically contain matching data, completely skipping all other partitions:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PARTITION PRUNING IN ACTION                             |\n+-------------------------------------------------------------------------------+\n  Query: SELECT * FROM nyc_trips WHERE pickup_datetime BETWEEN '2023-04-10' AND '2023-04-15'\n  \n  Evaluated Partitions:\n    [p2023_q1] (Jan - Mar):   SKIPPED (Pruned!) -> Zero disk I/O!\n    [p2023_q2] (Apr - Jun):   SCANNED (Target partition containing April)\n    [p2023_q3] (Jul - Sep):   SKIPPED (Pruned!) -> Zero disk I/O!\n    [p2023_q4] (Oct - Dec):   SKIPPED (Pruned!) -> Zero disk I/O!\n  (Execution time drops from 45 seconds to 0.08 seconds!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Verify pruning in EXPLAIN: Check the `partitions` column to confirm only the relevant partition name appears.",
          "Do NOT wrap the partition column in non-deterministic functions in WHERE clauses (e.g. `WHERE DATE_FORMAT(pickup, '%Y') = '2023'`), as this disables pruning!"
        ]
      },
      {
        "heading": "2. The Danger of DELETE vs Instant DROP PARTITION",
        "content": "In multi-million row databases, executing `DELETE FROM table WHERE pickup < '2022-01-01'` is an operational disaster: it writes millions of rows to Undo and Redo logs, triggers severe lock contention, fragments tablespaces, and takes hours. In contrast, `DROP PARTITION` takes less than 10ms:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      DELETE vs ALTER TABLE DROP PARTITION                     |\n+-------------------------------------------------------------------------------+\n  DELETE FROM table WHERE date < '2022-01-01':\n    - Scans 50,000,000 rows row-by-row\n    - Generates 50M Undo Log records + Redo Log explosion\n    - Locks table pages for hours -> High production latency\n    - Does NOT free disk space back to the OS! (Leaves sparse fragmented pages)\n    \n  ALTER TABLE table DROP PARTITION p2021_q4:\n    - Unlinks the physical .ibd file at the filesystem kernel level!\n    - Takes < 10ms (instantaneous!)\n    - Generates ZERO Undo or Redo bloat\n    - Instantly releases 100% of physical disk storage back to the OS!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use `ALTER TABLE DROP PARTITION` for data aging, compliance retention policies (e.g. 7-year audit retention), and rolling windows.",
          "Zero-downtime historical data archiving: Use `ALTER TABLE EXCHANGE PARTITION` to swap a partition with an external standalone table instantly without copying data."
        ]
      },
      {
        "heading": "3. Verifying Pruning with EXPLAIN PARTITIONS",
        "content": "To confirm that the query optimizer is successfully pruning partitions, execute `EXPLAIN` on your query. Modern MySQL displays the target partitions directly:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       EXPLAIN PARTITIONS VERIFICATION                         |\n+-------------------------------------------------------------------------------+\n  id | select_type | table     | partitions | type  | possible_keys | key\n  1  | SIMPLE      | nyc_trips | p2023_q2   | range | idx_pickup    | idx_pickup\n  \n  (Notice 'partitions: p2023_q2' -> Pruning is 100% effective!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "If `partitions` displays `p2023_q1,p2023_q2,p2023_q3,p2023_q4,p_future`, the optimizer was forced to scan ALL partitions. Check your WHERE clause predicates!"
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Sub-10ms Purging on 50M Transit Records",
      "source": "AWS Open Data NYC TLC Records",
      "table": "nyc_yellow_taxi_trips_partitioned",
      "description": "Purging 3 months of expired transit trips (50M records) in 6 milliseconds via ALTER TABLE DROP PARTITION, freeing 18 GB of disk space with zero buffer pool churn."
    },
    "codeTitle": "Verifying Partition Pruning & Executing Instant DROP",
    "code": "-- 1. Verify Partition Pruning in EXPLAIN\n-- Checks that the query optimizer only opens p2023_q1\nEXPLAIN \nSELECT \n    pickup_location_id,\n    COUNT(*) AS total_trips,\n    ROUND(SUM(total_amount), 2) AS total_revenue\nFROM nyc_yellow_taxi_trips_partitioned\nWHERE pickup_datetime >= '2023-01-01' \n  AND pickup_datetime < '2023-04-01'\nGROUP BY pickup_location_id;\n\n-- 2. Instantaneous Sub-10ms Historical Data Aging (Zero Undo Bloat)\n-- ALTER TABLE nyc_yellow_taxi_trips_partitioned DROP PARTITION p2023_q1;",
    "codeExplanation": "Demonstrates EXPLAIN verifying that only `p2023_q1` is accessed, followed by the instant `ALTER TABLE ... DROP PARTITION` syntax that drops the physical file.",
    "pitfalls": "Senior DBA Gotcha: Using expressions like `WHERE YEAR(pickup_datetime) = 2023` prevents the optimizer from calculating partition bounds at compile time, forcing a scan across all partitions. Always use direct range comparisons: `WHERE pickup_datetime >= '2023-01-01' AND pickup_datetime < '2024-01-01'`.",
    "quiz": {
      "question": "Why is ALTER TABLE ... DROP PARTITION dramatically faster than DELETE FROM WHERE date < '2022-01-01'?",
      "options": [
        "It runs inside memory only",
        "It unlinks the physical tablespace file directly without generating row-by-row undo/redo logs",
        "It turns off MySQL binary logs",
        "It automatically compresses the data into a zip file"
      ],
      "answer": 1,
      "explanation": "DROP PARTITION unlinks the physical .ibd file at the filesystem level in under 10ms with zero row-by-row logging, whereas DELETE logs every row individually."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 16: Partition Pruning & Zero-Downtime Data Aging",
        "overview": "Learn how the query optimizer achieves 10x-50x speedups via Partition Pruning, and how to execute sub-10ms data purging across millions of historical rows using ALTER TABLE DROP PARTITION instead of destructive DELETE statements.",
        "content": "Welcome to Week 16. In this chapter, we bridge fundamental SQL with Week 16: Partition Pruning & Zero-Downtime Data Aging. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Open Data NYC TLC Taxi & Financial Ledgers and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Open Data NYC TLC Taxi & Financial Ledgers. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Open Data NYC TLC Taxi & Financial Ledgers"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Partition Pruning: Eliminating Physical Tablespaces",
        "overview": "First major theoretical principle of this module.",
        "content": "Partition Pruning is an optimization where the query engine analyzes WHERE predicates and only opens and scans physical `.ibd` partition files that can mathematically contain matching data, completely skipping all other partitions:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PARTITION PRUNING IN ACTION                             |\n+-------------------------------------------------------------------------------+\n  Query: SELECT * FROM nyc_trips WHERE pickup_datetime BETWEEN '2023-04-10' AND '2023-04-15'\n  \n  Evaluated Partitions:\n    [p2023_q1] (Jan - Mar):   SKIPPED (Pruned!) -> Zero disk I/O!\n    [p2023_q2] (Apr - Jun):   SCANNED (Target partition containing April)\n    [p2023_q3] (Jul - Sep):   SKIPPED (Pruned!) -> Zero disk I/O!\n    [p2023_q4] (Oct - Dec):   SKIPPED (Pruned!) -> Zero disk I/O!\n  (Execution time drops from 45 seconds to 0.08 seconds!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Verify pruning in EXPLAIN: Check the `partitions` column to confirm only the relevant partition name appears.",
          "Do NOT wrap the partition column in non-deterministic functions in WHERE clauses (e.g. `WHERE DATE_FORMAT(pickup, '%Y') = '2023'`), as this disables pruning!"
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Danger of DELETE vs Instant DROP PARTITION",
        "overview": "Second major theoretical principle of this module.",
        "content": "In multi-million row databases, executing `DELETE FROM table WHERE pickup < '2022-01-01'` is an operational disaster: it writes millions of rows to Undo and Redo logs, triggers severe lock contention, fragments tablespaces, and takes hours. In contrast, `DROP PARTITION` takes less than 10ms:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      DELETE vs ALTER TABLE DROP PARTITION                     |\n+-------------------------------------------------------------------------------+\n  DELETE FROM table WHERE date < '2022-01-01':\n    - Scans 50,000,000 rows row-by-row\n    - Generates 50M Undo Log records + Redo Log explosion\n    - Locks table pages for hours -> High production latency\n    - Does NOT free disk space back to the OS! (Leaves sparse fragmented pages)\n    \n  ALTER TABLE table DROP PARTITION p2021_q4:\n    - Unlinks the physical .ibd file at the filesystem kernel level!\n    - Takes < 10ms (instantaneous!)\n    - Generates ZERO Undo or Redo bloat\n    - Instantly releases 100% of physical disk storage back to the OS!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always use `ALTER TABLE DROP PARTITION` for data aging, compliance retention policies (e.g. 7-year audit retention), and rolling windows.",
          "Zero-downtime historical data archiving: Use `ALTER TABLE EXCHANGE PARTITION` to swap a partition with an external standalone table instantly without copying data."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Verifying Partition Pruning & Executing Instant DROP",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nDemonstrates EXPLAIN verifying that only `p2023_q1` is accessed, followed by the instant `ALTER TABLE ... DROP PARTITION` syntax that drops the physical file.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- 1. Verify Partition Pruning in EXPLAIN\n-- Checks that the query optimizer only opens p2023_q1\nEXPLAIN \nSELECT \n    pickup_location_id,\n    COUNT(*) AS total_trips,\n    ROUND(SUM(total_amount), 2) AS total_revenue\nFROM nyc_yellow_taxi_trips_partitioned\nWHERE pickup_datetime >= '2023-01-01' \n  AND pickup_datetime < '2023-04-01'\nGROUP BY pickup_location_id;\n\n-- 2. Instantaneous Sub-10ms Historical Data Aging (Zero Undo Bloat)\n-- ALTER TABLE nyc_yellow_taxi_trips_partitioned DROP PARTITION p2023_q1;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Using expressions like `WHERE YEAR(pickup_datetime) = 2023` prevents the optimizer from calculating partition bounds at compile time, forcing a scan across all partitions. Always use direct range comparisons: `WHERE pickup_datetime >= '2023-01-01' AND pickup_datetime < '2024-01-01'`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- 1. Verify Partition Pruning in EXPLAIN\n-- Checks that the query optimizer only opens p2023_q1\nEXPLAIN \nSELECT \n    pickup_location_id,\n    COUNT(*) AS total_trips,\n    ROUND(SUM(total_amount), 2) AS total_revenue\nFROM nyc_yellow_taxi_trips_partitioned\nWHERE pickup_datetime >= '2023-01-01' \n  AND pickup_datetime < '2023-04-01'\nGROUP BY pickup_location_id;\n\n-- 2. Instantaneous Sub-10ms Historical Data Aging (Zero Undo Bloat)\n-- ALTER TABLE nyc_yellow_taxi_trips_partitioned DROP PARTITION p2023_q1;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 16:\\n\\n**Question**: Why is ALTER TABLE ... DROP PARTITION dramatically faster than DELETE FROM WHERE date < '2022-01-01'?\\n\\n**Explanation**: DROP PARTITION unlinks the physical .ibd file at the filesystem level in under 10ms with zero row-by-row logging, whereas DELETE logs every row individually.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Why is ALTER TABLE ... DROP PARTITION dramatically faster than DELETE FROM WHERE date < '2022-01-01'?",
        "solution": "-- Correct Answer: Option 2 (It unlinks the physical tablespace file directly without generating row-by-row undo/redo logs)"
      }
    ]
  },
  "17": {
    "month": 5,
    "week": 17,
    "title": "Week 17: GTID-Based Replication & Semi-Sync Failover",
    "cloudDataset": "AWS Multi-Region Aurora / MySQL 8 High Availability",
    "time": "40 min read",
    "overview": "Master enterprise MySQL replication architectures. Understand Global Transaction Identifiers (GTID: source_uuid:transaction_id), the classic three-thread replication pipeline (Binlog Dump, IO Thread, SQL Applier Thread), semi-synchronous replication guarantees, and multi-region failovers.",
    "sections": [
      {
        "heading": "1. GTID vs Classic Binlog File Coordinates",
        "content": "In legacy MySQL replication, replicas tracked replication positions via binary log filenames and byte offsets (e.g., `mysql-bin.000042:15482`). If the master crashed and a replica was promoted, repointing other replicas required complex coordinate math. GTID (Global Transaction Identifier) assigns every transaction a globally unique identity across the entire cluster:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       GLOBAL TRANSACTION IDENTIFIER (GTID)                    |\n+-------------------------------------------------------------------------------+\n  Format:  3E11FA47-71CA-11E1-9E33-C80AA9429562:1-4289\n           |<------- Server Source UUID ------->|:|<-- Transaction Sequence -->|\n           \n  When repointing a replica to a new master:\n  CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;\n  (The replica automatically queries the master for missing transaction IDs!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "GTID eliminates tracking binlog file coordinates during failovers.",
          "Enforce in my.cnf: `gtid_mode = ON` and `enforce_gtid_consistency = ON`."
        ]
      },
      {
        "heading": "2. The Three-Thread Replication Pipeline",
        "content": "Replication in MySQL is driven by three asynchronous threads:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       THREE-THREAD REPLICATION PIPELINE                       |\n+-------------------------------------------------------------------------------+\n  [Primary Master]\n    \u2514\u2500\u2500 Binlog Dump Thread: Reads Binary Log events & sends over network TCP\n                                       |\n                                       v\n  [Secondary Replica]\n    \u251c\u2500\u2500 IO Thread:          Receives network events & writes to local Relay Log\n    \u2514\u2500\u2500 SQL Applier Thread: Reads Relay Log & applies transactions to storage engine\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Replication lag occurs when the SQL Applier thread cannot write changes as fast as the primary master. Use Multi-Threaded Slaves (`replica_parallel_workers = 8`) to eliminate lag.",
          "Check `Seconds_Behind_Source` in `SHOW REPLICA STATUS`."
        ]
      },
      {
        "heading": "3. Semi-Synchronous Replication (Zero Data Loss)",
        "content": "Standard asynchronous replication commits on the master before the replica receives the event; if the master crashes before network transmission, data is lost. Semi-synchronous replication blocks the committing thread on the master until at least one replica acknowledges writing the event to its Relay Log:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        SEMI-SYNCHRONOUS REPLICATION ACK                       |\n+-------------------------------------------------------------------------------+\n  Master: Transaction Written -> Sent to Replica -> [WAITS FOR ACK]\n                                                          |\n  Replica: Receives event -> Writes to Relay Log -> Sends ACK back to Master\n                                                          |\n  Master: Receives ACK -> Commits & returns success to client! (Zero Data Loss!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Guarantees that no committed transaction is lost if the primary fails.",
          "Configure `rpl_semi_sync_master_timeout` to prevent master freeze if all replicas disconnect."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Cross-Region Semi-Sync Failover",
      "source": "AWS Multi-AZ Aurora & MySQL Replication Cluster",
      "table": "Global E-Commerce Transactions",
      "description": "Configuring GTID auto-positioning and semi-sync replication to guarantee zero data loss and automated failover between AWS us-east-1 and us-west-2."
    },
    "codeTitle": "Inspecting GTID Status & Replication Lag",
    "code": "-- Inspecting Master & Replica GTID Coordinates\nSELECT @@global.gtid_executed AS master_gtid_executed_set;\n\n-- Inspect Replication Health (Run on Replica):\n-- SHOW REPLICA STATUS\\G\n-- Key metrics to inspect:\n-- Replica_IO_Running: Yes\n-- Replica_SQL_Running: Yes\n-- Seconds_Behind_Source: 0 (No replication lag)\n-- Retrieved_Gtid_Set: Identical to Executed_Gtid_Set",
    "codeExplanation": "Queries `@@global.gtid_executed` to check transaction sets and documents the essential metrics in `SHOW REPLICA STATUS`.",
    "pitfalls": "Senior DBA Gotcha: Running non-deterministic statements (like `INSERT INTO log VALUES (NOW(), RAND())`) with statement-based replication (`binlog_format = STATEMENT`) produces different values on replicas, leading to silent data corruption. Always enforce `binlog_format = ROW`.",
    "quiz": {
      "question": "What is the primary advantage of GTID replication over classic binary log coordinates?",
      "options": [
        "It compresses tables automatically",
        "It allows automatic failover and replica repointing without manually tracking binlog filenames and byte offsets",
        "It removes the need for primary keys",
        "It speeds up network cards"
      ],
      "answer": 1,
      "explanation": "GTID assigns every transaction a globally unique ID, allowing replicas to automatically negotiate missing transaction sets during master failovers via SOURCE_AUTO_POSITION = 1."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 17: GTID-Based Replication & Semi-Sync Failover",
        "overview": "Master enterprise MySQL replication architectures. Understand Global Transaction Identifiers (GTID: source_uuid:transaction_id), the classic three-thread replication pipeline (Binlog Dump, IO Thread, SQL Applier Thread), semi-synchronous replication guarantees, and multi-region failovers.",
        "content": "Welcome to Week 17. In this chapter, we bridge fundamental SQL with Week 17: GTID-Based Replication & Semi-Sync Failover. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Multi-Region Aurora / MySQL 8 High Availability and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Multi-Region Aurora / MySQL 8 High Availability. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Multi-Region Aurora / MySQL 8 High Availability"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. GTID vs Classic Binlog File Coordinates",
        "overview": "First major theoretical principle of this module.",
        "content": "In legacy MySQL replication, replicas tracked replication positions via binary log filenames and byte offsets (e.g., `mysql-bin.000042:15482`). If the master crashed and a replica was promoted, repointing other replicas required complex coordinate math. GTID (Global Transaction Identifier) assigns every transaction a globally unique identity across the entire cluster:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       GLOBAL TRANSACTION IDENTIFIER (GTID)                    |\n+-------------------------------------------------------------------------------+\n  Format:  3E11FA47-71CA-11E1-9E33-C80AA9429562:1-4289\n           |<------- Server Source UUID ------->|:|<-- Transaction Sequence -->|\n           \n  When repointing a replica to a new master:\n  CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;\n  (The replica automatically queries the master for missing transaction IDs!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "GTID eliminates tracking binlog file coordinates during failovers.",
          "Enforce in my.cnf: `gtid_mode = ON` and `enforce_gtid_consistency = ON`."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Three-Thread Replication Pipeline",
        "overview": "Second major theoretical principle of this module.",
        "content": "Replication in MySQL is driven by three asynchronous threads:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       THREE-THREAD REPLICATION PIPELINE                       |\n+-------------------------------------------------------------------------------+\n  [Primary Master]\n    \u2514\u2500\u2500 Binlog Dump Thread: Reads Binary Log events & sends over network TCP\n                                       |\n                                       v\n  [Secondary Replica]\n    \u251c\u2500\u2500 IO Thread:          Receives network events & writes to local Relay Log\n    \u2514\u2500\u2500 SQL Applier Thread: Reads Relay Log & applies transactions to storage engine\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Replication lag occurs when the SQL Applier thread cannot write changes as fast as the primary master. Use Multi-Threaded Slaves (`replica_parallel_workers = 8`) to eliminate lag.",
          "Check `Seconds_Behind_Source` in `SHOW REPLICA STATUS`."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Inspecting GTID Status & Replication Lag",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nQueries `@@global.gtid_executed` to check transaction sets and documents the essential metrics in `SHOW REPLICA STATUS`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Inspecting Master & Replica GTID Coordinates\nSELECT @@global.gtid_executed AS master_gtid_executed_set;\n\n-- Inspect Replication Health (Run on Replica):\n-- SHOW REPLICA STATUS\\G\n-- Key metrics to inspect:\n-- Replica_IO_Running: Yes\n-- Replica_SQL_Running: Yes\n-- Seconds_Behind_Source: 0 (No replication lag)\n-- Retrieved_Gtid_Set: Identical to Executed_Gtid_Set"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running non-deterministic statements (like `INSERT INTO log VALUES (NOW(), RAND())`) with statement-based replication (`binlog_format = STATEMENT`) produces different values on replicas, leading to silent data corruption. Always enforce `binlog_format = ROW`.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Inspecting Master & Replica GTID Coordinates\nSELECT @@global.gtid_executed AS master_gtid_executed_set;\n\n-- Inspect Replication Health (Run on Replica):\n-- SHOW REPLICA STATUS\\G\n-- Key metrics to inspect:\n-- Replica_IO_Running: Yes\n-- Replica_SQL_Running: Yes\n-- Seconds_Behind_Source: 0 (No replication lag)\n-- Retrieved_Gtid_Set: Identical to Executed_Gtid_Set"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 17:\\n\\n**Question**: What is the primary advantage of GTID replication over classic binary log coordinates?\\n\\n**Explanation**: GTID assigns every transaction a globally unique ID, allowing replicas to automatically negotiate missing transaction sets during master failovers via SOURCE_AUTO_POSITION = 1.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What is the primary advantage of GTID replication over classic binary log coordinates?",
        "solution": "-- Correct Answer: Option 2 (It allows automatic failover and replica repointing without manually tracking binlog filenames and byte offsets)"
      }
    ]
  },
  "18": {
    "month": 5,
    "week": 18,
    "title": "Week 18: ProxySQL & Automated Read/Write Splitting",
    "cloudDataset": "AWS RDS Multi-AZ & Aurora Read Replicas",
    "time": "40 min read",
    "overview": "Learn how enterprise database architectures decouple applications from physical databases using ProxySQL. Master connection multiplexing, hostgroup clustering (Master vs Replicas), query regex routing rules, and shunning lagging replicas.",
    "sections": [
      {
        "heading": "1. Why ProxySQL? The Connection Multiplexing Layer",
        "content": "Modern microservices easily spawn 5,000+ application connections. Having 5,000 direct connections to MySQL causes severe context-switching overhead and memory exhaustion. ProxySQL sits between apps and MySQL, serving 5,000 client connections with just 50 persistent multiplexed backend connections:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PROXYSQL CONNECTION MULTIPLEXING                        |\n+-------------------------------------------------------------------------------+\n  [5,000 App Microservice Connections]\n                 |\n                 v\n  [ProxySQL Layer: Port 3306]  (Lightweight in-memory C++ proxy, query cache)\n                 |\n                 +---> 25 Backend Connections to Primary Master (Writes)\n                 +---> 25 Backend Connections to Read Replica Cluster (Reads)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Connection multiplexing slashes MySQL memory usage and stabilizes latency during connection spikes.",
          "Applications connect to ProxySQL as if it were a normal MySQL database."
        ]
      },
      {
        "heading": "2. Hostgroup Architecture & Read/Write Routing Rules",
        "content": "ProxySQL organizes databases into Hostgroups (e.g. Hostgroup 10 for Writable Master, Hostgroup 20 for Read Replicas). It inspects SQL statements and routes traffic using regular expression rules:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PROXYSQL QUERY ROUTING RULES                            |\n+-------------------------------------------------------------------------------+\n  Rule 1: match_pattern = \"^SELECT.*FOR UPDATE\" -> destination_hostgroup = 10 (Master)\n  Rule 2: match_pattern = \"^SELECT\"             -> destination_hostgroup = 20 (Replicas)\n  Rule 3: match_pattern = \".*\" (INSERT/UPDATE)  -> destination_hostgroup = 10 (Master)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always route `SELECT ... FOR UPDATE` to the Master (Hostgroup 10); read replicas cannot grant exclusive row locks.",
          "Read rules in Hostgroup 20 distribute load across replicas using round-robin or least-connections."
        ]
      },
      {
        "heading": "3. Automated Health Checks & Replica Shunning",
        "content": "ProxySQL continuously monitors backend nodes. If a read replica develops replication lag exceeding `max_replication_lag` (e.g. 5 seconds), ProxySQL automatically shuns the node (drops it from Hostgroup 20) until it catches up, preventing users from reading stale data.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         AUTOMATED REPLICA SHUNNING                            |\n+-------------------------------------------------------------------------------+\n  Replica 1 (Lag: 0.1s) -> ONLINE (Serving reads)\n  Replica 2 (Lag: 8.4s) -> SHUNNED! (ProxySQL temporarily routes reads away!)\n  (Once Replica 2 catches up to < 5s lag, it is automatically restored to pool)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Protects applications from reading dirty or stale historical data during large replication spikes."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Scaling Read Replicas for 50,000 QPS",
      "source": "AWS Aurora Cluster & ProxySQL Gateway",
      "table": "E-Commerce Catalog & Orders",
      "description": "Configuring ProxySQL to offload 92% of read traffic to 3 read replicas while transparently directing 100% of write transactions and locked reads to the primary master."
    },
    "codeTitle": "Configuring ProxySQL Query Routing Rules",
    "code": "-- ProxySQL Admin Interface Configuration (Port 6032)\n-- 1. Route SELECT FOR UPDATE queries to Master Hostgroup (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (1, 1, '^SELECT.*FOR UPDATE', 10, 1);\n\n-- 2. Route standard SELECT queries to Read Replica Hostgroup (20)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (2, 1, '^SELECT', 20, 1);\n\n-- 3. Default fallback for all Writes (INSERT, UPDATE, DELETE) to Master (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (3, 1, '.*', 10, 1);\n\n-- Load rules to runtime and persist to disk\nLOAD MYSQL QUERY RULES TO RUNTIME;\nSAVE MYSQL QUERY RULES TO DISK;",
    "codeExplanation": "Inserts three regex rules into ProxySQL's admin table: locked reads route to master (10), general reads route to replicas (20), and writes route to master (10).",
    "pitfalls": "Senior DBA Gotcha: If an application uses temporary tables (CREATE TEMPORARY TABLE), connection multiplexing must be disabled for that session (`multiplex = 0`), otherwise subsequent queries may be routed over a different connection where the temporary table does not exist.",
    "quiz": {
      "question": "Why must SELECT ... FOR UPDATE statements be routed to the Master hostgroup instead of Read Replicas?",
      "options": [
        "Replicas do not have hard drives",
        "Exclusive write and update locks can only be acquired on the writable primary master node",
        "ProxySQL cannot parse the FOR keyword",
        "It reduces network bandwidth"
      ],
      "answer": 1,
      "explanation": "Exclusive row locks (X-locks) required by FOR UPDATE must be registered on the master where transactions are committed; read replicas are read-only and cannot lock rows for writes."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 18: ProxySQL & Automated Read/Write Splitting",
        "overview": "Learn how enterprise database architectures decouple applications from physical databases using ProxySQL. Master connection multiplexing, hostgroup clustering (Master vs Replicas), query regex routing rules, and shunning lagging replicas.",
        "content": "Welcome to Week 18. In this chapter, we bridge fundamental SQL with Week 18: ProxySQL & Automated Read/Write Splitting. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS RDS Multi-AZ & Aurora Read Replicas and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS RDS Multi-AZ & Aurora Read Replicas. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS RDS Multi-AZ & Aurora Read Replicas"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Why ProxySQL? The Connection Multiplexing Layer",
        "overview": "First major theoretical principle of this module.",
        "content": "Modern microservices easily spawn 5,000+ application connections. Having 5,000 direct connections to MySQL causes severe context-switching overhead and memory exhaustion. ProxySQL sits between apps and MySQL, serving 5,000 client connections with just 50 persistent multiplexed backend connections:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PROXYSQL CONNECTION MULTIPLEXING                        |\n+-------------------------------------------------------------------------------+\n  [5,000 App Microservice Connections]\n                 |\n                 v\n  [ProxySQL Layer: Port 3306]  (Lightweight in-memory C++ proxy, query cache)\n                 |\n                 +---> 25 Backend Connections to Primary Master (Writes)\n                 +---> 25 Backend Connections to Read Replica Cluster (Reads)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Connection multiplexing slashes MySQL memory usage and stabilizes latency during connection spikes.",
          "Applications connect to ProxySQL as if it were a normal MySQL database."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Hostgroup Architecture & Read/Write Routing Rules",
        "overview": "Second major theoretical principle of this module.",
        "content": "ProxySQL organizes databases into Hostgroups (e.g. Hostgroup 10 for Writable Master, Hostgroup 20 for Read Replicas). It inspects SQL statements and routes traffic using regular expression rules:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PROXYSQL QUERY ROUTING RULES                            |\n+-------------------------------------------------------------------------------+\n  Rule 1: match_pattern = \"^SELECT.*FOR UPDATE\" -> destination_hostgroup = 10 (Master)\n  Rule 2: match_pattern = \"^SELECT\"             -> destination_hostgroup = 20 (Replicas)\n  Rule 3: match_pattern = \".*\" (INSERT/UPDATE)  -> destination_hostgroup = 10 (Master)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always route `SELECT ... FOR UPDATE` to the Master (Hostgroup 10); read replicas cannot grant exclusive row locks.",
          "Read rules in Hostgroup 20 distribute load across replicas using round-robin or least-connections."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Configuring ProxySQL Query Routing Rules",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nInserts three regex rules into ProxySQL's admin table: locked reads route to master (10), general reads route to replicas (20), and writes route to master (10).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- ProxySQL Admin Interface Configuration (Port 6032)\n-- 1. Route SELECT FOR UPDATE queries to Master Hostgroup (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (1, 1, '^SELECT.*FOR UPDATE', 10, 1);\n\n-- 2. Route standard SELECT queries to Read Replica Hostgroup (20)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (2, 1, '^SELECT', 20, 1);\n\n-- 3. Default fallback for all Writes (INSERT, UPDATE, DELETE) to Master (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (3, 1, '.*', 10, 1);\n\n-- Load rules to runtime and persist to disk\nLOAD MYSQL QUERY RULES TO RUNTIME;\nSAVE MYSQL QUERY RULES TO DISK;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: If an application uses temporary tables (CREATE TEMPORARY TABLE), connection multiplexing must be disabled for that session (`multiplex = 0`), otherwise subsequent queries may be routed over a different connection where the temporary table does not exist.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- ProxySQL Admin Interface Configuration (Port 6032)\n-- 1. Route SELECT FOR UPDATE queries to Master Hostgroup (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (1, 1, '^SELECT.*FOR UPDATE', 10, 1);\n\n-- 2. Route standard SELECT queries to Read Replica Hostgroup (20)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (2, 1, '^SELECT', 20, 1);\n\n-- 3. Default fallback for all Writes (INSERT, UPDATE, DELETE) to Master (10)\nINSERT INTO mysql_query_rules (rule_id, active, match_pattern, destination_hostgroup, apply)\nVALUES (3, 1, '.*', 10, 1);\n\n-- Load rules to runtime and persist to disk\nLOAD MYSQL QUERY RULES TO RUNTIME;\nSAVE MYSQL QUERY RULES TO DISK;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 18:\\n\\n**Question**: Why must SELECT ... FOR UPDATE statements be routed to the Master hostgroup instead of Read Replicas?\\n\\n**Explanation**: Exclusive row locks (X-locks) required by FOR UPDATE must be registered on the master where transactions are committed; read replicas are read-only and cannot lock rows for writes.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Why must SELECT ... FOR UPDATE statements be routed to the Master hostgroup instead of Read Replicas?",
        "solution": "-- Correct Answer: Option 2 (Exclusive write and update locks can only be acquired on the writable primary master node)"
      }
    ]
  },
  "19": {
    "month": 5,
    "week": 19,
    "title": "Week 19: Enterprise Backups & Point-in-Time Recovery (PITR)",
    "cloudDataset": "AWS RDS Automated Snapshots & Enterprise Disaster Recovery",
    "time": "40 min read",
    "overview": "Master enterprise backup and recovery strategies. Learn non-blocking consistent logical snapshots using mysqldump --single-transaction, physical backups with Percona XtraBackup, binary log coordinate extraction, and Point-in-Time Recovery (PITR) to the second.",
    "sections": [
      {
        "heading": "1. Non-Blocking Consistent Snapshots: mysqldump --single-transaction",
        "content": "Taking a backup of an enterprise database while users are placing orders cannot lock tables (which causes a production outage). The flag `--single-transaction` starts an MVCC REPEATABLE READ transaction, allowing mysqldump to stream a consistent point-in-time snapshot of InnoDB tables without taking a single table lock:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       NON-BLOCKING CONSISTENT BACKUP                          |\n+-------------------------------------------------------------------------------+\n  mysqldump --single-transaction --master-data=2 --quick ...\n  \n  Step 1: Executes START TRANSACTION WITH CONSISTENT SNAPSHOT (MVCC Read View established)\n  Step 2: Records current Binary Log coordinates (e.g., binlog.000124:458291)\n  Step 3: Streams table data sequentially (Online application writes continue 100% unimpeded!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "`--single-transaction` only works for InnoDB; MyISAM tables will still be locked.",
          "Always include `--master-data=2` to embed the exact binary log coordinates as a comment in the dump file."
        ]
      },
      {
        "heading": "2. The Disaster Recovery Workflow: Point-in-Time Recovery (PITR)",
        "content": "Imagine an engineer accidentally runs `DROP TABLE orders;` at 14:15:22. Restoring yesterday midnight's backup loses 14 hours of orders. Point-in-Time Recovery (PITR) allows restoring the snapshot and replaying binary logs up to the exact second before the drop:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      POINT-IN-TIME RECOVERY (PITR) WORKFLOW                   |\n+-------------------------------------------------------------------------------+\n  [Yesterday 00:00]      [Today 14:15:21]     [Today 14:15:22 - ACCIDENTAL DROP!]\n         |                      |                               |\n         v                      v                               v\n  [1. Restore Backup] -> [2. Replay Binlogs] -----------------> [STOP EXECUTION!]\n  (Database is restored to 14:15:21 with ZERO data loss and the dropped table intact!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Step 1: Restore the full backup from `--single-transaction`.",
          "Step 2: Use `mysqlbinlog --start-position --stop-datetime` to replay transactions up to 1 second before the disaster."
        ]
      },
      {
        "heading": "3. Replaying Binary Logs with mysqlbinlog",
        "content": "The `mysqlbinlog` utility reads raw binary log files and converts them into executable SQL statements:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         REPLAYING BINLOGS UP TO DISASTER                      |\n+-------------------------------------------------------------------------------+\n  mysqlbinlog \\\n    --start-position=458291 \\\n    --stop-datetime=\"2023-10-26 14:15:21\" \\\n    mysql-bin.000124 mysql-bin.000125 | mysql -u root -p\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always verify coordinates before replaying to ensure the destructive DROP statement is excluded from the replay stream."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Disaster Recovery Playbook for Production Financial DB",
      "source": "AWS S3 Backup Archive & Production MySQL Binlogs",
      "table": "financial_transactions & orders",
      "description": "Simulating accidental table deletion, executing full restore from S3 snapshot, and replaying 8 hours of binlogs to achieve zero data loss."
    },
    "codeTitle": "Executing Point-in-Time Disaster Recovery Script",
    "code": "# 1. Take Non-Blocking Snapshot with Binlog Coordinates\nmysqldump -u root -p \\\n  --single-transaction \\\n  --master-data=2 \\\n  --flush-logs \\\n  --routines --triggers \\\n  cloud_big_data_db > /backups/db_snapshot_midnight.sql\n\n# 2. Extract starting coordinates from dump header\n# Head output shows: -- CHANGE MASTER TO MASTER_LOG_FILE='binlog.000042', MASTER_LOG_POS=154;\n\n# 3. Replay Binlogs up to the exact second before disaster\nmysqlbinlog \\\n  --start-position=154 \\\n  --stop-datetime=\"2023-10-26 14:15:21\" \\\n  /var/lib/mysql/binlog.000042 | mysql -u root -p cloud_big_data_db",
    "codeExplanation": "Demonstrates the complete bash workflow: taking a non-blocking snapshot with embedded binlog coordinates, and using mysqlbinlog to replay transactions up to the target timestamp.",
    "pitfalls": "Senior DBA Gotcha: Running `mysqldump` without `--single-transaction` executes `FLUSH TABLES WITH READ LOCK`, locking the entire database in read-only mode and bringing down the production application.",
    "quiz": {
      "question": "What mysqldump flag enables non-blocking backups on InnoDB without taking table locks?",
      "options": [
        "--lock-all-tables",
        "--single-transaction",
        "--force",
        "--quick"
      ],
      "answer": 1,
      "explanation": "--single-transaction starts an MVCC REPEATABLE READ snapshot, streaming consistent data without locking tables."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 19: Enterprise Backups & Point-in-Time Recovery (PITR)",
        "overview": "Master enterprise backup and recovery strategies. Learn non-blocking consistent logical snapshots using mysqldump --single-transaction, physical backups with Percona XtraBackup, binary log coordinate extraction, and Point-in-Time Recovery (PITR) to the second.",
        "content": "Welcome to Week 19. In this chapter, we bridge fundamental SQL with Week 19: Enterprise Backups & Point-in-Time Recovery (PITR). We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS RDS Automated Snapshots & Enterprise Disaster Recovery and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS RDS Automated Snapshots & Enterprise Disaster Recovery. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS RDS Automated Snapshots & Enterprise Disaster Recovery"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Non-Blocking Consistent Snapshots: mysqldump --single-transaction",
        "overview": "First major theoretical principle of this module.",
        "content": "Taking a backup of an enterprise database while users are placing orders cannot lock tables (which causes a production outage). The flag `--single-transaction` starts an MVCC REPEATABLE READ transaction, allowing mysqldump to stream a consistent point-in-time snapshot of InnoDB tables without taking a single table lock:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       NON-BLOCKING CONSISTENT BACKUP                          |\n+-------------------------------------------------------------------------------+\n  mysqldump --single-transaction --master-data=2 --quick ...\n  \n  Step 1: Executes START TRANSACTION WITH CONSISTENT SNAPSHOT (MVCC Read View established)\n  Step 2: Records current Binary Log coordinates (e.g., binlog.000124:458291)\n  Step 3: Streams table data sequentially (Online application writes continue 100% unimpeded!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "`--single-transaction` only works for InnoDB; MyISAM tables will still be locked.",
          "Always include `--master-data=2` to embed the exact binary log coordinates as a comment in the dump file."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. The Disaster Recovery Workflow: Point-in-Time Recovery (PITR)",
        "overview": "Second major theoretical principle of this module.",
        "content": "Imagine an engineer accidentally runs `DROP TABLE orders;` at 14:15:22. Restoring yesterday midnight's backup loses 14 hours of orders. Point-in-Time Recovery (PITR) allows restoring the snapshot and replaying binary logs up to the exact second before the drop:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                      POINT-IN-TIME RECOVERY (PITR) WORKFLOW                   |\n+-------------------------------------------------------------------------------+\n  [Yesterday 00:00]      [Today 14:15:21]     [Today 14:15:22 - ACCIDENTAL DROP!]\n         |                      |                               |\n         v                      v                               v\n  [1. Restore Backup] -> [2. Replay Binlogs] -----------------> [STOP EXECUTION!]\n  (Database is restored to 14:15:21 with ZERO data loss and the dropped table intact!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Step 1: Restore the full backup from `--single-transaction`.",
          "Step 2: Use `mysqlbinlog --start-position --stop-datetime` to replay transactions up to 1 second before the disaster."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Executing Point-in-Time Disaster Recovery Script",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nDemonstrates the complete bash workflow: taking a non-blocking snapshot with embedded binlog coordinates, and using mysqlbinlog to replay transactions up to the target timestamp.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "# 1. Take Non-Blocking Snapshot with Binlog Coordinates\nmysqldump -u root -p \\\n  --single-transaction \\\n  --master-data=2 \\\n  --flush-logs \\\n  --routines --triggers \\\n  cloud_big_data_db > /backups/db_snapshot_midnight.sql\n\n# 2. Extract starting coordinates from dump header\n# Head output shows: -- CHANGE MASTER TO MASTER_LOG_FILE='binlog.000042', MASTER_LOG_POS=154;\n\n# 3. Replay Binlogs up to the exact second before disaster\nmysqlbinlog \\\n  --start-position=154 \\\n  --stop-datetime=\"2023-10-26 14:15:21\" \\\n  /var/lib/mysql/binlog.000042 | mysql -u root -p cloud_big_data_db"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running `mysqldump` without `--single-transaction` executes `FLUSH TABLES WITH READ LOCK`, locking the entire database in read-only mode and bringing down the production application.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "# 1. Take Non-Blocking Snapshot with Binlog Coordinates\nmysqldump -u root -p \\\n  --single-transaction \\\n  --master-data=2 \\\n  --flush-logs \\\n  --routines --triggers \\\n  cloud_big_data_db > /backups/db_snapshot_midnight.sql\n\n# 2. Extract starting coordinates from dump header\n# Head output shows: -- CHANGE MASTER TO MASTER_LOG_FILE='binlog.000042', MASTER_LOG_POS=154;\n\n# 3. Replay Binlogs up to the exact second before disaster\nmysqlbinlog \\\n  --start-position=154 \\\n  --stop-datetime=\"2023-10-26 14:15:21\" \\\n  /var/lib/mysql/binlog.000042 | mysql -u root -p cloud_big_data_db"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 19:\\n\\n**Question**: What mysqldump flag enables non-blocking backups on InnoDB without taking table locks?\\n\\n**Explanation**: --single-transaction starts an MVCC REPEATABLE READ snapshot, streaming consistent data without locking tables.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What mysqldump flag enables non-blocking backups on InnoDB without taking table locks?",
        "solution": "-- Correct Answer: Option 2 (--single-transaction)"
      }
    ]
  },
  "20": {
    "month": 5,
    "week": 20,
    "title": "Week 20: Native Cloud S3 Ingestion & FineWeb 15T Token Pretraining Staging",
    "cloudDataset": "Hugging Face Hub FineWeb (15 Trillion Tokens) & AWS S3 Native",
    "time": "40 min read",
    "overview": "Learn how AI and Large Language Model (LLM) data engineering teams use MySQL 8 as a high-performance metadata staging store. Master native S3 ingestion in cloud Aurora/RDS, token vocabulary frequency indexing, and SQL-driven quality filtering before feeding tokenizer pipelines.",
    "sections": [
      {
        "heading": "1. The AI Pretraining Data Engineering Architecture",
        "content": "Training models like Llama or Mistral requires pretraining datasets like Hugging Face FineWeb (15+ Trillion Tokens, 44+ Terabytes). Raw web scrapes contain spam, duplicate boilerplate, and toxic text. Staging pretraining document metadata in MySQL allows filtering low-quality documents using SQL before tokenization:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       LLM PRETRAINING DATA PIPELINE                           |\n+-------------------------------------------------------------------------------+\n  [44 TB Raw Web Scrapes: FineWeb]\n                 |\n                 v\n  [MySQL Metadata Staging Store: `fineweb_pretrain_docs`]\n    - Columns: doc_id, domain, token_count, educational_score, toxicity_score\n                 |\n                 v\n  [SQL Quality Filter]: WHERE educational_score >= 0.85 AND toxicity_score < 0.02\n                 |\n                 v\n  [High-Quality Tokenizer & GPU Model Training Cluster]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Relational metadata indexing in MySQL allows AI teams to perform fast exploratory slice-and-dice queries on multi-terabyte AI corpora.",
          "Partitioning metadata tables by crawl year and educational tier accelerates training data extraction."
        ]
      },
      {
        "heading": "2. Native AWS S3 Ingestion in Aurora/RDS",
        "content": "While standard MySQL uses `LOAD DATA LOCAL INFILE`, AWS Aurora and RDS provide native integration with Amazon S3. The database engine connects directly to the S3 bucket using IAM roles, pulling data over high-bandwidth internal AWS network backbones:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        NATIVE AURORA S3 INGESTION                             |\n+-------------------------------------------------------------------------------+\n  LOAD DATA FROM S3 's3://my-bucket/fineweb_chunks/chunk_*.csv'\n  INTO TABLE fineweb_pretrain_docs\n  FIELDS TERMINATED BY ',' (doc_id, url, token_count, educational_score);\n  (Ingests at > 250 MB/sec over AWS internal backplane!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Native S3 loading eliminates the need for an intermediate client machine, reading directly from bucket to database.",
          "Supports automatic decompression of `.gz` and `.gzip` files on the fly."
        ]
      },
      {
        "heading": "3. Building In-Database Vocabulary & Token Frequency Tables",
        "content": "Token frequency analysis is crucial for training BPE (Byte Pair Encoding) tokenizers. Using MySQL 8 Full-Text auxiliary tables or group aggregation, you can analyze token frequencies across millions of documents directly in the database.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        VOCABULARY FREQUENCY ANALYSIS                          |\n+-------------------------------------------------------------------------------+\n  Token         Document Frequency      Corpus Distribution %\n  'function'    14,289,102              4.82%\n  'database'     9,412,019              3.18%\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Allows identifying domain vocabulary skew before initiating expensive GPU cluster training runs."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Staging 100,000 FineWeb Documents for LLM Pretraining",
      "source": "Hugging Face Hub (HuggingFaceFW/fineweb)",
      "table": "fineweb_pretrain_docs (15 Trillion Token Corpus)",
      "description": "Filtering web scrape metadata by educational quality score (>= 0.80) and token length (> 250 tokens), exporting sanitized document IDs for distributed GPU pretraining."
    },
    "codeTitle": "Filtering LLM Pretraining Corpora via SQL Quality Rules",
    "code": "-- Filtering LLM Pretraining Corpora Metadata\n-- Identifies top educational training documents while excluding low-quality web scrapes\nSELECT \n    domain,\n    COUNT(*) AS total_training_docs,\n    ROUND(AVG(token_count), 0) AS avg_doc_tokens,\n    ROUND(AVG(educational_score), 3) AS avg_educational_quality,\n    SUM(token_count) AS total_usable_tokens\nFROM fineweb_pretrain_docs\nWHERE educational_score >= 0.80           -- High-quality educational filter\n  AND token_count BETWEEN 250 AND 16000   -- Exclude stubs and runaway scraper loops\nGROUP BY domain\nHAVING total_usable_tokens > 500000\nORDER BY total_usable_tokens DESC\nLIMIT 10;",
    "codeExplanation": "Aggregates training documents by domain, filtering for high educational quality and reasonable token boundaries, computing the volume of clean tokens available for training.",
    "pitfalls": "Senior DBA Gotcha: Storing raw multi-megabyte uncompressed document text directly in `TEXT` or `LONGTEXT` columns inside InnoDB causes severe off-page overflow storage (768-byte prefix stored in page, rest in separate overflow pages). Store raw text in object storage (S3), storing only metadata and document hash references in MySQL.",
    "quiz": {
      "question": "Why is it best practice to store large raw document text (e.g. 5MB articles) in S3 rather than directly in InnoDB LONGTEXT columns?",
      "options": [
        "MySQL does not support the English alphabet",
        "Large text columns cause off-page overflow storage, fragmenting the Buffer Pool and causing massive random I/O",
        "InnoDB can only store 255 characters",
        "S3 requires all text to be encrypted"
      ],
      "answer": 1,
      "explanation": "Storing massive text blobs in InnoDB forces rows onto overflow pages, severely degrading buffer pool caching and query scan performance. Best practice is storing text in S3 and metadata in MySQL."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 20: Native Cloud S3 Ingestion & FineWeb 15T Token Pretraining Staging",
        "overview": "Learn how AI and Large Language Model (LLM) data engineering teams use MySQL 8 as a high-performance metadata staging store. Master native S3 ingestion in cloud Aurora/RDS, token vocabulary frequency indexing, and SQL-driven quality filtering before feeding tokenizer pipelines.",
        "content": "Welcome to Week 20. In this chapter, we bridge fundamental SQL with Week 20: Native Cloud S3 Ingestion & FineWeb 15T Token Pretraining Staging. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Hugging Face Hub FineWeb (15 Trillion Tokens) & AWS S3 Native and how it is structured.",
        "content": "This module anchors on real cloud big data from: Hugging Face Hub FineWeb (15 Trillion Tokens) & AWS S3 Native. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Hugging Face Hub FineWeb (15 Trillion Tokens) & AWS S3 Native"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The AI Pretraining Data Engineering Architecture",
        "overview": "First major theoretical principle of this module.",
        "content": "Training models like Llama or Mistral requires pretraining datasets like Hugging Face FineWeb (15+ Trillion Tokens, 44+ Terabytes). Raw web scrapes contain spam, duplicate boilerplate, and toxic text. Staging pretraining document metadata in MySQL allows filtering low-quality documents using SQL before tokenization:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       LLM PRETRAINING DATA PIPELINE                           |\n+-------------------------------------------------------------------------------+\n  [44 TB Raw Web Scrapes: FineWeb]\n                 |\n                 v\n  [MySQL Metadata Staging Store: `fineweb_pretrain_docs`]\n    - Columns: doc_id, domain, token_count, educational_score, toxicity_score\n                 |\n                 v\n  [SQL Quality Filter]: WHERE educational_score >= 0.85 AND toxicity_score < 0.02\n                 |\n                 v\n  [High-Quality Tokenizer & GPU Model Training Cluster]\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Relational metadata indexing in MySQL allows AI teams to perform fast exploratory slice-and-dice queries on multi-terabyte AI corpora.",
          "Partitioning metadata tables by crawl year and educational tier accelerates training data extraction."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Native AWS S3 Ingestion in Aurora/RDS",
        "overview": "Second major theoretical principle of this module.",
        "content": "While standard MySQL uses `LOAD DATA LOCAL INFILE`, AWS Aurora and RDS provide native integration with Amazon S3. The database engine connects directly to the S3 bucket using IAM roles, pulling data over high-bandwidth internal AWS network backbones:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                        NATIVE AURORA S3 INGESTION                             |\n+-------------------------------------------------------------------------------+\n  LOAD DATA FROM S3 's3://my-bucket/fineweb_chunks/chunk_*.csv'\n  INTO TABLE fineweb_pretrain_docs\n  FIELDS TERMINATED BY ',' (doc_id, url, token_count, educational_score);\n  (Ingests at > 250 MB/sec over AWS internal backplane!)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Native S3 loading eliminates the need for an intermediate client machine, reading directly from bucket to database.",
          "Supports automatic decompression of `.gz` and `.gzip` files on the fly."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Filtering LLM Pretraining Corpora via SQL Quality Rules",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nAggregates training documents by domain, filtering for high educational quality and reasonable token boundaries, computing the volume of clean tokens available for training.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Filtering LLM Pretraining Corpora Metadata\n-- Identifies top educational training documents while excluding low-quality web scrapes\nSELECT \n    domain,\n    COUNT(*) AS total_training_docs,\n    ROUND(AVG(token_count), 0) AS avg_doc_tokens,\n    ROUND(AVG(educational_score), 3) AS avg_educational_quality,\n    SUM(token_count) AS total_usable_tokens\nFROM fineweb_pretrain_docs\nWHERE educational_score >= 0.80           -- High-quality educational filter\n  AND token_count BETWEEN 250 AND 16000   -- Exclude stubs and runaway scraper loops\nGROUP BY domain\nHAVING total_usable_tokens > 500000\nORDER BY total_usable_tokens DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Storing raw multi-megabyte uncompressed document text directly in `TEXT` or `LONGTEXT` columns inside InnoDB causes severe off-page overflow storage (768-byte prefix stored in page, rest in separate overflow pages). Store raw text in object storage (S3), storing only metadata and document hash references in MySQL.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Filtering LLM Pretraining Corpora Metadata\n-- Identifies top educational training documents while excluding low-quality web scrapes\nSELECT \n    domain,\n    COUNT(*) AS total_training_docs,\n    ROUND(AVG(token_count), 0) AS avg_doc_tokens,\n    ROUND(AVG(educational_score), 3) AS avg_educational_quality,\n    SUM(token_count) AS total_usable_tokens\nFROM fineweb_pretrain_docs\nWHERE educational_score >= 0.80           -- High-quality educational filter\n  AND token_count BETWEEN 250 AND 16000   -- Exclude stubs and runaway scraper loops\nGROUP BY domain\nHAVING total_usable_tokens > 500000\nORDER BY total_usable_tokens DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 20:\\n\\n**Question**: Why is it best practice to store large raw document text (e.g. 5MB articles) in S3 rather than directly in InnoDB LONGTEXT columns?\\n\\n**Explanation**: Storing massive text blobs in InnoDB forces rows onto overflow pages, severely degrading buffer pool caching and query scan performance. Best practice is storing text in S3 and metadata in MySQL.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Why is it best practice to store large raw document text (e.g. 5MB articles) in S3 rather than directly in InnoDB LONGTEXT columns?",
        "solution": "-- Correct Answer: Option 2 (Large text columns cause off-page overflow storage, fragmenting the Buffer Pool and causing massive random I/O)"
      }
    ]
  },
  "21": {
    "month": 6,
    "week": 21,
    "title": "Week 21: Capstone Project 1 - Developer Ecosystem Analytics Engine",
    "cloudDataset": "Google Cloud GitHub Public Archive & Stack Overflow",
    "time": "45 min read",
    "overview": "Architect and benchmark Capstone Project 1: An enterprise-grade developer ecosystem intelligence engine combining terabytes of Google Cloud GitHub commits and Stack Overflow technical discussions. Implement covering indexes for 100x speedup and traverse Git DAGs recursively.",
    "sections": [
      {
        "heading": "1. Capstone 1 System Architecture",
        "content": "Capstone 1 integrates two premier Google Cloud Public Datasets into a unified analytical warehouse:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                     DEVELOPER ECOSYSTEM ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+\n  [Google Cloud BigQuery]\n    \u251c\u2500\u2500 github_repos.commits (TBs of commits, parent hashes, author metadata)\n    \u2514\u2500\u2500 stackoverflow.posts_questions (50M+ developer technical discussions)\n                 |\n                 v\n  [MySQL 8 Enterprise Warehouse]\n    \u251c\u2500\u2500 Recursive Git DAG Traversal Engine (Multi-Hop Commit Lineage)\n    \u251c\u2500\u2500 Covering Composite Index Layer (Slashing p99 latency from 1.4s to 12ms)\n    \u2514\u2500\u2500 Tag Co-Occurrence Correlation Matrix (Linear Hash Joins)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Demonstrates multi-cloud big data modeling in MySQL 8.",
          "Combines recursive graph traversal with high-speed analytical projections."
        ]
      },
      {
        "heading": "2. Production Performance Scorecard",
        "content": "Key architectural metrics achieved in Capstone Project 1:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       CAPSTONE 1 PERFORMANCE SCORECARD                        |\n+-------------------------------------------------------------------------------+\n  Metric                    Baseline Query          Optimized Query     Speedup\n  Git Commit Lookup         1,420 ms (Bookmark Seek) 12 ms (Covering)    118x Faster!\n  Tag Affinity Self-Join    42.8 s (BNL Join)       1.2 s (Hash Join)    35x Faster!\n  Commit DAG Recursion      Timeout (> 60s)         0.18 s (Depth Guard) Stable!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Quantifiable performance metrics following the Google XYZ formula for resume presentation."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Global Developer Contribution Graphs",
      "source": "Google Cloud GitHub Archive & Stack Overflow",
      "table": "github_commits & so_posts (Combined 60M+ Rows)",
      "description": "Cross-referencing GitHub commit release cadences against Stack Overflow question spikes to correlate developer framework adoption."
    },
    "codeTitle": "Developer Technology Adoption Correlation Query",
    "code": "-- Capstone 1: Cross-Dataset Technology Adoption Correlation\n-- Analyzes question activity and developer commit velocity\nSELECT \n    so.tags AS framework_tag,\n    COUNT(DISTINCT so.post_id) AS total_questions_asked,\n    ROUND(AVG(so.score), 2) AS avg_community_score,\n    COUNT(DISTINCT gh.commit_sha) AS open_source_commit_volume\nFROM so_posts so\nLEFT JOIN github_commits gh \n    ON gh.message LIKE CONCAT('%', so.tags, '%')\nWHERE so.post_type_id = 1\n  AND so.score >= 5\nGROUP BY so.tags\nHAVING total_questions_asked >= 10\nORDER BY total_questions_asked DESC\nLIMIT 10;",
    "codeExplanation": "Joins developer question volume against open-source commit mentions, illustrating cross-dataset analytical correlation.",
    "pitfalls": "Senior DBA Gotcha: Running unindexed LIKE '%string%' across millions of rows causes a full table scan. In production, use InnoDB Full-Text Search or extract normalized technology IDs into a secondary relational mapping table.",
    "quiz": {
      "question": "What is the primary mechanism that achieved the 118x speedup in Capstone 1?",
      "options": [
        "Rebooting the server",
        "Replacing a non-covering clustered bookmark lookup with a composite covering index",
        "Converting all tables to CSV",
        "Disabling foreign keys"
      ],
      "answer": 1,
      "explanation": "Eliminating clustered index bookmark lookups by satisfying the entire projection and sort from secondary index leaf pages achieved the 118x latency reduction."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 21: Capstone Project 1 - Developer Ecosystem Analytics Engine",
        "overview": "Architect and benchmark Capstone Project 1: An enterprise-grade developer ecosystem intelligence engine combining terabytes of Google Cloud GitHub commits and Stack Overflow technical discussions. Implement covering indexes for 100x speedup and traverse Git DAGs recursively.",
        "content": "Welcome to Week 21. In this chapter, we bridge fundamental SQL with Week 21: Capstone Project 1 - Developer Ecosystem Analytics Engine. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud GitHub Public Archive & Stack Overflow and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud GitHub Public Archive & Stack Overflow. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud GitHub Public Archive & Stack Overflow"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Capstone 1 System Architecture",
        "overview": "First major theoretical principle of this module.",
        "content": "Capstone 1 integrates two premier Google Cloud Public Datasets into a unified analytical warehouse:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                     DEVELOPER ECOSYSTEM ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+\n  [Google Cloud BigQuery]\n    \u251c\u2500\u2500 github_repos.commits (TBs of commits, parent hashes, author metadata)\n    \u2514\u2500\u2500 stackoverflow.posts_questions (50M+ developer technical discussions)\n                 |\n                 v\n  [MySQL 8 Enterprise Warehouse]\n    \u251c\u2500\u2500 Recursive Git DAG Traversal Engine (Multi-Hop Commit Lineage)\n    \u251c\u2500\u2500 Covering Composite Index Layer (Slashing p99 latency from 1.4s to 12ms)\n    \u2514\u2500\u2500 Tag Co-Occurrence Correlation Matrix (Linear Hash Joins)\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Demonstrates multi-cloud big data modeling in MySQL 8.",
          "Combines recursive graph traversal with high-speed analytical projections."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Production Performance Scorecard",
        "overview": "Second major theoretical principle of this module.",
        "content": "Key architectural metrics achieved in Capstone Project 1:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       CAPSTONE 1 PERFORMANCE SCORECARD                        |\n+-------------------------------------------------------------------------------+\n  Metric                    Baseline Query          Optimized Query     Speedup\n  Git Commit Lookup         1,420 ms (Bookmark Seek) 12 ms (Covering)    118x Faster!\n  Tag Affinity Self-Join    42.8 s (BNL Join)       1.2 s (Hash Join)    35x Faster!\n  Commit DAG Recursion      Timeout (> 60s)         0.18 s (Depth Guard) Stable!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Quantifiable performance metrics following the Google XYZ formula for resume presentation."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Developer Technology Adoption Correlation Query",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nJoins developer question volume against open-source commit mentions, illustrating cross-dataset analytical correlation.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Capstone 1: Cross-Dataset Technology Adoption Correlation\n-- Analyzes question activity and developer commit velocity\nSELECT \n    so.tags AS framework_tag,\n    COUNT(DISTINCT so.post_id) AS total_questions_asked,\n    ROUND(AVG(so.score), 2) AS avg_community_score,\n    COUNT(DISTINCT gh.commit_sha) AS open_source_commit_volume\nFROM so_posts so\nLEFT JOIN github_commits gh \n    ON gh.message LIKE CONCAT('%', so.tags, '%')\nWHERE so.post_type_id = 1\n  AND so.score >= 5\nGROUP BY so.tags\nHAVING total_questions_asked >= 10\nORDER BY total_questions_asked DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running unindexed LIKE '%string%' across millions of rows causes a full table scan. In production, use InnoDB Full-Text Search or extract normalized technology IDs into a secondary relational mapping table.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Capstone 1: Cross-Dataset Technology Adoption Correlation\n-- Analyzes question activity and developer commit velocity\nSELECT \n    so.tags AS framework_tag,\n    COUNT(DISTINCT so.post_id) AS total_questions_asked,\n    ROUND(AVG(so.score), 2) AS avg_community_score,\n    COUNT(DISTINCT gh.commit_sha) AS open_source_commit_volume\nFROM so_posts so\nLEFT JOIN github_commits gh \n    ON gh.message LIKE CONCAT('%', so.tags, '%')\nWHERE so.post_type_id = 1\n  AND so.score >= 5\nGROUP BY so.tags\nHAVING total_questions_asked >= 10\nORDER BY total_questions_asked DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 21:\\n\\n**Question**: What is the primary mechanism that achieved the 118x speedup in Capstone 1?\\n\\n**Explanation**: Eliminating clustered index bookmark lookups by satisfying the entire projection and sort from secondary index leaf pages achieved the 118x latency reduction.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What is the primary mechanism that achieved the 118x speedup in Capstone 1?",
        "solution": "-- Correct Answer: Option 2 (Replacing a non-covering clustered bookmark lookup with a composite covering index)"
      }
    ]
  },
  "22": {
    "month": 6,
    "week": 22,
    "title": "Week 22: Capstone Project 2 - Institutional Blockchain Ledger & ACID Settlement",
    "cloudDataset": "Google Cloud Bitcoin & Ethereum Public Blockchain",
    "time": "45 min read",
    "overview": "Architect and benchmark Capstone Project 2: An institutional-grade double-entry cryptocurrency settlement ledger built on Google Cloud Bitcoin & Ethereum data. Implement 100% deadlock immunity under 50-thread concurrent stress testing and real-time Anti-Money Laundering (AML) fraud detection.",
    "sections": [
      {
        "heading": "1. The UTXO & Double-Entry Ledger Schema",
        "content": "Capstone 2 implements the Unspent Transaction Output (UTXO) accounting model used by Bitcoin. Money cannot be created or destroyed: every transaction consists of Inputs (debits) and Outputs (credits) that must balance precisely:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       UTXO DOUBLE-ENTRY LEDGER MODEL                          |\n+-------------------------------------------------------------------------------+\n  Transaction 7c8d9...\n    Input 1:  [Address Alpha: -50 BTC]  --\\\n    Input 2:  [Address Beta:  -30 BTC]  ---> Total In: 80 BTC\n                                                    |\n    Output 1: [Address Gamma: +79 BTC]  <-----------+ Total Out: 80 BTC (Balance = 0!)\n    Output 2: [Miner Fee:     +1 BTC ]  <-----------+\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Enforce balance integrity at the database layer using CHECK constraints and atomic transaction blocks.",
          "Store cryptographic hashes as BINARY(32) to prevent page split fragmentation."
        ]
      },
      {
        "heading": "2. Concurrency Stress Test: 50 Worker Threads, 0 Deadlocks",
        "content": "Using Python's concurrent thread pool, 50 worker threads simulate 10,000 rapid payment settlements between arbitrary account pairs. By enforcing Dijkstra's canonical ordering (`LEAST(from, to) -> GREATEST(from, to)`), the system achieves 100% deadlock immunity.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       50-THREAD CONCURRENCY BENCHMARK                         |\n+-------------------------------------------------------------------------------+\n  Unordered Locking:  412 Deadlocks (Error 1213), 8.2% transaction failure rate.\n  Canonical Ordering:   0 Deadlocks (100% Success!), 24,500 TPS sustained!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Proves mathematical deadlock elimination under intense multi-threaded write contention."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Institutional Crypto Ledger Audit",
      "source": "Google Cloud BigQuery Public Dataset (bigquery-public-data.crypto_bitcoin)",
      "table": "blockchain_transactions & accounts (1.5 TB+)",
      "description": "Simulating high-frequency settlement between 100,000 institutional accounts, auditing ledger balance invariants, and detecting rapid circular fund routing."
    },
    "codeTitle": "Sliding-Window Anti-Money Laundering (AML) Fraud Detection",
    "code": "-- Anti-Money Laundering (AML) Rapid Structuring Detection\n-- Detects accounts executing >= 3 transfers within a rolling 1-hour window\nSELECT \n    from_address,\n    tx_hash,\n    amount_satoshis,\n    fee_satoshis,\n    -- Count transactions in a rolling 1-hour window\n    COUNT(*) OVER (\n        PARTITION BY from_address \n        ORDER BY tx_id \n        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ) AS rolling_3_tx_count\nFROM blockchain_transactions\nWHERE amount_satoshis > 10000000\nORDER BY amount_satoshis DESC\nLIMIT 10;",
    "codeExplanation": "Uses window functions to monitor transaction velocity per account, flagging high-frequency structuring patterns indicative of financial fraud.",
    "pitfalls": "Senior DBA Gotcha: In double-entry ledgers, never update balances using non-atomic reads (`balance = balance - X` without locking). Under concurrent load, race conditions cause phantom money creation. Always lock rows with `FOR UPDATE` in canonical order.",
    "quiz": {
      "question": "What is the mathematical condition guaranteed by Dijkstra's Resource Hierarchy in Capstone 2?",
      "options": [
        "Network latency drops to 0",
        "No cycle can form in the resource allocation wait graph, making deadlocks mathematically impossible",
        "Disk space consumption is cut in half",
        "Transactions execute without redo logs"
      ],
      "answer": 1,
      "explanation": "Deadlocks require a circular wait graph (A waits for B, B waits for A). By ordering resource acquisition globally, cycles can never form."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 22: Capstone Project 2 - Institutional Blockchain Ledger & ACID Settlement",
        "overview": "Architect and benchmark Capstone Project 2: An institutional-grade double-entry cryptocurrency settlement ledger built on Google Cloud Bitcoin & Ethereum data. Implement 100% deadlock immunity under 50-thread concurrent stress testing and real-time Anti-Money Laundering (AML) fraud detection.",
        "content": "Welcome to Week 22. In this chapter, we bridge fundamental SQL with Week 22: Capstone Project 2 - Institutional Blockchain Ledger & ACID Settlement. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Google Cloud Bitcoin & Ethereum Public Blockchain and how it is structured.",
        "content": "This module anchors on real cloud big data from: Google Cloud Bitcoin & Ethereum Public Blockchain. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Google Cloud Bitcoin & Ethereum Public Blockchain"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The UTXO & Double-Entry Ledger Schema",
        "overview": "First major theoretical principle of this module.",
        "content": "Capstone 2 implements the Unspent Transaction Output (UTXO) accounting model used by Bitcoin. Money cannot be created or destroyed: every transaction consists of Inputs (debits) and Outputs (credits) that must balance precisely:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       UTXO DOUBLE-ENTRY LEDGER MODEL                          |\n+-------------------------------------------------------------------------------+\n  Transaction 7c8d9...\n    Input 1:  [Address Alpha: -50 BTC]  --\\\n    Input 2:  [Address Beta:  -30 BTC]  ---> Total In: 80 BTC\n                                                    |\n    Output 1: [Address Gamma: +79 BTC]  <-----------+ Total Out: 80 BTC (Balance = 0!)\n    Output 2: [Miner Fee:     +1 BTC ]  <-----------+\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Enforce balance integrity at the database layer using CHECK constraints and atomic transaction blocks.",
          "Store cryptographic hashes as BINARY(32) to prevent page split fragmentation."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Concurrency Stress Test: 50 Worker Threads, 0 Deadlocks",
        "overview": "Second major theoretical principle of this module.",
        "content": "Using Python's concurrent thread pool, 50 worker threads simulate 10,000 rapid payment settlements between arbitrary account pairs. By enforcing Dijkstra's canonical ordering (`LEAST(from, to) -> GREATEST(from, to)`), the system achieves 100% deadlock immunity.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       50-THREAD CONCURRENCY BENCHMARK                         |\n+-------------------------------------------------------------------------------+\n  Unordered Locking:  412 Deadlocks (Error 1213), 8.2% transaction failure rate.\n  Canonical Ordering:   0 Deadlocks (100% Success!), 24,500 TPS sustained!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Proves mathematical deadlock elimination under intense multi-threaded write contention."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Sliding-Window Anti-Money Laundering (AML) Fraud Detection",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nUses window functions to monitor transaction velocity per account, flagging high-frequency structuring patterns indicative of financial fraud.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Anti-Money Laundering (AML) Rapid Structuring Detection\n-- Detects accounts executing >= 3 transfers within a rolling 1-hour window\nSELECT \n    from_address,\n    tx_hash,\n    amount_satoshis,\n    fee_satoshis,\n    -- Count transactions in a rolling 1-hour window\n    COUNT(*) OVER (\n        PARTITION BY from_address \n        ORDER BY tx_id \n        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ) AS rolling_3_tx_count\nFROM blockchain_transactions\nWHERE amount_satoshis > 10000000\nORDER BY amount_satoshis DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: In double-entry ledgers, never update balances using non-atomic reads (`balance = balance - X` without locking). Under concurrent load, race conditions cause phantom money creation. Always lock rows with `FOR UPDATE` in canonical order.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Anti-Money Laundering (AML) Rapid Structuring Detection\n-- Detects accounts executing >= 3 transfers within a rolling 1-hour window\nSELECT \n    from_address,\n    tx_hash,\n    amount_satoshis,\n    fee_satoshis,\n    -- Count transactions in a rolling 1-hour window\n    COUNT(*) OVER (\n        PARTITION BY from_address \n        ORDER BY tx_id \n        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ) AS rolling_3_tx_count\nFROM blockchain_transactions\nWHERE amount_satoshis > 10000000\nORDER BY amount_satoshis DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 22:\\n\\n**Question**: What is the mathematical condition guaranteed by Dijkstra's Resource Hierarchy in Capstone 2?\\n\\n**Explanation**: Deadlocks require a circular wait graph (A waits for B, B waits for A). By ordering resource acquisition globally, cycles can never form.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "What is the mathematical condition guaranteed by Dijkstra's Resource Hierarchy in Capstone 2?",
        "solution": "-- Correct Answer: Option 2 (No cycle can form in the resource allocation wait graph, making deadlocks mathematically impossible)"
      }
    ]
  },
  "23": {
    "month": 6,
    "week": 23,
    "title": "Week 23: Capstone Project 3 - Petabyte Web & LLM Pretraining Data Pipeline",
    "cloudDataset": "AWS Common Crawl WARC Index & Hugging Face FineWeb (15T Tokens)",
    "time": "45 min read",
    "overview": "Architect and benchmark Capstone Project 3: A petabyte-scale web crawl and LLM pretraining data pipeline integrating AWS Common Crawl WARC index records and Hugging Face FineWeb metadata. Deploy ProxySQL read/write splitting, RANGE table partitioning, and high-speed cloud ingestion.",
    "sections": [
      {
        "heading": "1. Petabyte Web Index & AI Pipeline Architecture",
        "content": "Capstone 3 processes petabytes of raw internet HTML and LLM training tokens by orchestrating a tiered data architecture:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PETABYTE AI DATA PIPELINE ARCHITECTURE                  |\n+-------------------------------------------------------------------------------+\n  [AWS Common Crawl (Petabytes)]  &  [Hugging Face FineWeb (44 TB / 15T Tokens)]\n                 |\n                 v\n  [High-Speed Ingestion Stream: 85,000 rows/sec via LOAD DATA LOCAL INFILE]\n                 |\n                 v\n  [ProxySQL Gateway: Port 3306]  (Connection Multiplexing & Read/Write Routing)\n         \u251c\u2500\u2500 Master Node (Hostgroup 10): Writable Ingestion & Partitioning\n         \u2514\u2500\u2500 Replicas (Hostgroup 20): GPU Training Cluster Exploratory Reads\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Combines table partitioning, ProxySQL clustering, and cloud big data ingestion into a production-grade system."
        ]
      },
      {
        "heading": "2. Zero-Downtime Data Lifecycle Aging",
        "content": "The web crawl index is partitioned quarterly. When crawl data ages beyond 12 months, `ALTER TABLE DROP PARTITION` unlinks multi-gigabyte tablespace partitions in < 10ms with zero production locking, releasing storage back to the OS.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       ZERO-DOWNTIME DATA LIFECYCLE AGING                      |\n+-------------------------------------------------------------------------------+\n  Partition p2022_q3 (Expired 12 months ago) -> ALTER TABLE DROP PARTITION p2022_q3\n  Execution Time: 7.2 milliseconds! Disk space reclaimed: 48 GB!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Maintains stable database size indefinitely across continuous petabyte ingestion streams."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Common Crawl Domain Distribution Analysis",
      "source": "AWS Open Data Registry (s3://commoncrawl/) & Hugging Face Hub",
      "table": "common_crawl_warc_index (Petabytes)",
      "description": "Analyzing TLD distributions, HTTP response code anomalies, and language classification scores across billions of web pages."
    },
    "codeTitle": "Top Web Crawl TLD Distribution & Health Metrics",
    "code": "-- Web Crawl TLD Distribution & HTTP Status Code Health\nSELECT \n    tld,\n    COUNT(*) AS total_crawled_urls,\n    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM common_crawl_warc_index), 2) AS pct_of_web_crawl,\n    SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) AS successful_200_count,\n    ROUND(AVG(content_length_bytes) / 1024.0, 2) AS avg_page_size_kb\nFROM common_crawl_warc_index\nGROUP BY tld\nHAVING total_crawled_urls > 100\nORDER BY total_crawled_urls DESC\nLIMIT 10;",
    "codeExplanation": "Rolls up billions of web crawl records by top-level domain (TLD), computing HTTP 200 success ratios and average HTML payload sizes.",
    "pitfalls": "Senior DBA Gotcha: Running analytical queries on the master node during petabyte bulk ingestion stalls write transactions. Always route analytical queries to read replicas via ProxySQL Hostgroup 20.",
    "quiz": {
      "question": "In Capstone 3, how does ProxySQL prevent analytical queries from impacting bulk ingestion write throughput?",
      "options": [
        "It deletes slow queries",
        "It uses query routing regex rules to send SELECT reads to Replica Hostgroup 20 while routing bulk writes to Master Hostgroup 10",
        "It turns off MySQL authentication",
        "It converts all tables to SQLite"
      ],
      "answer": 1,
      "explanation": "ProxySQL inspects SQL statements, routing read queries to the read replica pool (Hostgroup 20) and write traffic to the primary master (Hostgroup 10), ensuring zero write contention."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 23: Capstone Project 3 - Petabyte Web & LLM Pretraining Data Pipeline",
        "overview": "Architect and benchmark Capstone Project 3: A petabyte-scale web crawl and LLM pretraining data pipeline integrating AWS Common Crawl WARC index records and Hugging Face FineWeb metadata. Deploy ProxySQL read/write splitting, RANGE table partitioning, and high-speed cloud ingestion.",
        "content": "Welcome to Week 23. In this chapter, we bridge fundamental SQL with Week 23: Capstone Project 3 - Petabyte Web & LLM Pretraining Data Pipeline. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring AWS Common Crawl WARC Index & Hugging Face FineWeb (15T Tokens) and how it is structured.",
        "content": "This module anchors on real cloud big data from: AWS Common Crawl WARC Index & Hugging Face FineWeb (15T Tokens). In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: AWS Common Crawl WARC Index & Hugging Face FineWeb (15T Tokens)"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. Petabyte Web Index & AI Pipeline Architecture",
        "overview": "First major theoretical principle of this module.",
        "content": "Capstone 3 processes petabytes of raw internet HTML and LLM training tokens by orchestrating a tiered data architecture:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       PETABYTE AI DATA PIPELINE ARCHITECTURE                  |\n+-------------------------------------------------------------------------------+\n  [AWS Common Crawl (Petabytes)]  &  [Hugging Face FineWeb (44 TB / 15T Tokens)]\n                 |\n                 v\n  [High-Speed Ingestion Stream: 85,000 rows/sec via LOAD DATA LOCAL INFILE]\n                 |\n                 v\n  [ProxySQL Gateway: Port 3306]  (Connection Multiplexing & Read/Write Routing)\n         \u251c\u2500\u2500 Master Node (Hostgroup 10): Writable Ingestion & Partitioning\n         \u2514\u2500\u2500 Replicas (Hostgroup 20): GPU Training Cluster Exploratory Reads\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Combines table partitioning, ProxySQL clustering, and cloud big data ingestion into a production-grade system."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. Zero-Downtime Data Lifecycle Aging",
        "overview": "Second major theoretical principle of this module.",
        "content": "The web crawl index is partitioned quarterly. When crawl data ages beyond 12 months, `ALTER TABLE DROP PARTITION` unlinks multi-gigabyte tablespace partitions in < 10ms with zero production locking, releasing storage back to the OS.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       ZERO-DOWNTIME DATA LIFECYCLE AGING                      |\n+-------------------------------------------------------------------------------+\n  Partition p2022_q3 (Expired 12 months ago) -> ALTER TABLE DROP PARTITION p2022_q3\n  Execution Time: 7.2 milliseconds! Disk space reclaimed: 48 GB!\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Maintains stable database size indefinitely across continuous petabyte ingestion streams."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Top Web Crawl TLD Distribution & Health Metrics",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nRolls up billions of web crawl records by top-level domain (TLD), computing HTTP 200 success ratios and average HTML payload sizes.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Web Crawl TLD Distribution & HTTP Status Code Health\nSELECT \n    tld,\n    COUNT(*) AS total_crawled_urls,\n    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM common_crawl_warc_index), 2) AS pct_of_web_crawl,\n    SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) AS successful_200_count,\n    ROUND(AVG(content_length_bytes) / 1024.0, 2) AS avg_page_size_kb\nFROM common_crawl_warc_index\nGROUP BY tld\nHAVING total_crawled_urls > 100\nORDER BY total_crawled_urls DESC\nLIMIT 10;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Running analytical queries on the master node during petabyte bulk ingestion stalls write transactions. Always route analytical queries to read replicas via ProxySQL Hostgroup 20.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Web Crawl TLD Distribution & HTTP Status Code Health\nSELECT \n    tld,\n    COUNT(*) AS total_crawled_urls,\n    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM common_crawl_warc_index), 2) AS pct_of_web_crawl,\n    SUM(CASE WHEN http_status = 200 THEN 1 ELSE 0 END) AS successful_200_count,\n    ROUND(AVG(content_length_bytes) / 1024.0, 2) AS avg_page_size_kb\nFROM common_crawl_warc_index\nGROUP BY tld\nHAVING total_crawled_urls > 100\nORDER BY total_crawled_urls DESC\nLIMIT 10;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 23:\\n\\n**Question**: In Capstone 3, how does ProxySQL prevent analytical queries from impacting bulk ingestion write throughput?\\n\\n**Explanation**: ProxySQL inspects SQL statements, routing read queries to the read replica pool (Hostgroup 20) and write traffic to the primary master (Hostgroup 10), ensuring zero write contention.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "In Capstone 3, how does ProxySQL prevent analytical queries from impacting bulk ingestion write throughput?",
        "solution": "-- Correct Answer: Option 2 (It uses query routing regex rules to send SELECT reads to Replica Hostgroup 20 while routing bulk writes to Master Hostgroup 10)"
      }
    ]
  },
  "24": {
    "month": 6,
    "week": 24,
    "title": "Week 24: Staff DBA Career Portfolio, Google XYZ Resumes & 50 Interview Q&As",
    "cloudDataset": "Full MySQL Pro Learning Suite & Technical Interview Drills",
    "time": "50 min read",
    "overview": "Finalize your journey from Intermediate Developer to Senior / Staff Database Architect. Package your GitHub capstone repositories, format high-impact quantifiable resume bullet points using the Google XYZ Formula, and drill all 50 deep technical interview questions.",
    "sections": [
      {
        "heading": "1. The Google XYZ Resume Formula for Database Architects",
        "content": "Hiring managers and Staff DBA interviewers discard vague bullet points like 'Responsible for maintaining MySQL databases'. To pass senior technical screens, every bullet point must follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       GOOGLE XYZ RESUME BULLET FORMULA                        |\n+-------------------------------------------------------------------------------+\n  Bad (Vague):\n    \"Helped optimize database queries for the web application.\"\n    \n  Good (Google XYZ Formula):\n    \"Engineered covering composite indexes across 5.6M+ records in MySQL 8.0,\n     slashing p99 query latency by 118x (from 1,420ms to 12ms) and eliminating\n     clustered bookmark lookups during peak traffic.\"\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Quantify scale (5.6M+ rows, 500GB tablespace, 24,500 TPS).",
          "Quantify impact (118x speedup, 0 deadlocks, sub-10ms drop times).",
          "Specify technical mechanism (Covering indexes, MVCC, ProxySQL, Canonical locking)."
        ]
      },
      {
        "heading": "2. High-Impact Technical Interview Drill Framework",
        "content": "Staff-level technical interviews evaluate depth across four core pillars: Storage Engine Internals (Buffer Pool, WAL, B+ Trees), Indexing & Cost Model (Covering, EXPLAIN, FileSort), Concurrency & ACID (MVCC, Next-Key Locks, Deadlocks), and High Availability (GTID, Semi-Sync, ProxySQL).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       STAFF DBA INTERVIEW MATRIX                              |\n+-------------------------------------------------------------------------------+\n  Pillar 1: Storage Internals  -> Explain 16KB Page splits, Doublewrite buffer & WAL\n  Pillar 2: Indexing & Cost    -> Explain Bookmark lookups, Skip Scans & Hash Joins\n  Pillar 3: ACID & Concurrency -> Explain Read Views, Gap Locks & Dijkstra Canonical Locks\n  Pillar 4: Scaling & HA       -> Explain GTID 3-thread replication & ProxySQL routing\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always explain *why* an engine mechanism behaves the way it does, not just *what* the syntax is.",
          "Reference production incident experience: buffer pool thrashing, replication lag, and deadlocks."
        ]
      }
    ],
    "cloudCaseStudy": {
      "title": "Staff Database Architect Portfolio Showcase",
      "source": "GitHub Codespaces & Live Web Platform",
      "table": "All 3 Capstone Projects (Developer Analytics, Crypto Ledger, AI Pipeline)",
      "description": "Packaging complete reproducible GitHub repositories, automated benchmark scripts, and architecture diagrams into a hiring portfolio."
    },
    "codeTitle": "Master Database Architecture Health Verification Query",
    "code": "-- Master Health & Performance Diagnostic Verification Query\nSELECT \n    'Database Engine' AS component, \n    VERSION() AS metric_value\nUNION ALL\nSELECT \n    'Buffer Pool Size', \n    CONCAT(ROUND(@@innodb_buffer_pool_size / (1024*1024*1024), 2), ' GB')\nUNION ALL\nSELECT \n    'GTID Mode', \n    @@gtid_mode\nUNION ALL\nSELECT \n    'Binary Log Format', \n    @@binlog_format\nUNION ALL\nSELECT \n    'Transaction Isolation Level', \n    @@transaction_isolation;",
    "codeExplanation": "Gathers the core server configuration flags (Engine version, Buffer Pool RAM allocation, GTID mode, binlog format, and isolation level) into a single audit report.",
    "pitfalls": "Senior DBA Gotcha: Failing to rehearse explaining technical tradeoffs out loud. Staff engineers are evaluated on how clearly they articulate *why* they chose one architecture over another (e.g. why REPEATABLE READ was chosen over READ COMMITTED, or why RANGE partitioning was chosen over HASH).",
    "quiz": {
      "question": "Which of these resume bullets demonstrates highest technical impact using Google's XYZ formula?",
      "options": [
        "Responsible for writing MySQL queries for the analytics team.",
        "Engineered covering composite indexes across 5.6M+ records, slashing p99 latency by 118x (from 1,420ms to 12ms) and eliminating clustered bookmark lookups.",
        "Helped optimize database performance.",
        "Worked with MySQL 8.0 databases."
      ],
      "answer": 1,
      "explanation": "Option B follows the Google XYZ formula: it specifies the action, the metric (118x / 12ms), the scale (5.6M+), and the exact technical mechanism (covering indexes)."
    },
    "chapters": [
      {
        "chapter": 1,
        "badge": "Prerequisites & Overview",
        "title": "Chapter 1: Understanding Week 24: Staff DBA Career Portfolio, Google XYZ Resumes & 50 Interview Q&As",
        "overview": "Finalize your journey from Intermediate Developer to Senior / Staff Database Architect. Package your GitHub capstone repositories, format high-impact quantifiable resume bullet points using the Google XYZ Formula, and drill all 50 deep technical interview questions.",
        "content": "Welcome to Week 24. In this chapter, we bridge fundamental SQL with Week 24: Staff DBA Career Portfolio, Google XYZ Resumes & 50 Interview Q&As. We explore why standard naive approaches fail at enterprise scale and establish the engineering requirements.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                             ARCHITECTURAL OVERVIEW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review core prerequisites before writing advanced SQL.",
          "Understand the performance and business impact of this module."
        ],
        "exercise": "Review the core objectives of this module.",
        "solution": "-- Module objective verified."
      },
      {
        "chapter": 2,
        "badge": "Cloud Big Data Source",
        "title": "Chapter 2: The Cloud Big Data Container & Public Schema",
        "overview": "Exploring Full MySQL Pro Learning Suite & Technical Interview Drills and how it is structured.",
        "content": "This module anchors on real cloud big data from: Full MySQL Pro Learning Suite & Technical Interview Drills. In this chapter, we inspect the container layout, bucket URI, and target table schema.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         CLOUD CONTAINER SPECIFICATION                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Cloud datasets allow benchmarking realistic multi-million row queries.",
          "Public buckets allow unauthenticated reads with --no-sign-request."
        ],
        "exercise": "Identify the cloud provider and dataset used in this lesson.",
        "solution": "-- Cloud Source: Full MySQL Pro Learning Suite & Technical Interview Drills"
      },
      {
        "chapter": 3,
        "badge": "Fetching Cloud Data",
        "title": "Chapter 3: Connecting & Fetching the Cloud Dataset",
        "overview": "Commands to stream and fetch sample chunks from public buckets.",
        "content": "Learn how to fetch sample chunks anonymously using curl, the AWS CLI, or the python connector script.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           CLOUD INGESTION WORKFLOW                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Use python3 01-datasets/cloud_public_datasets_connector.py to fetch chunks.",
          "Bypass AWS authentication with --no-sign-request."
        ],
        "exercise": "Run the connector CLI to preview the dataset catalog.",
        "solution": "-- CLI Command: python3 01-datasets/cloud_public_datasets_connector.py --list"
      },
      {
        "chapter": 4,
        "badge": "Schema Blueprint",
        "title": "Chapter 4: Designing the Table Blueprint for this Module",
        "overview": "Data types, storage engine parameters, and primary key rules.",
        "content": "Designing table schemas tailored for this week's architectural focus, ensuring optimal data packing and low memory footprint.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            TABLE SCHEMA ARCHITECTURE                          |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Choose data types carefully to prevent wasted bytes per row.",
          "Primary keys dictate clustered index layout in InnoDB."
        ],
        "exercise": "Inspect table schema column data types.",
        "solution": "-- Verified table column definitions and indexes."
      },
      {
        "chapter": 5,
        "badge": "Core Theory Part 1",
        "title": "Chapter 5: 1. The Google XYZ Resume Formula for Database Architects",
        "overview": "First major theoretical principle of this module.",
        "content": "Hiring managers and Staff DBA interviewers discard vague bullet points like 'Responsible for maintaining MySQL databases'. To pass senior technical screens, every bullet point must follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]:",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       GOOGLE XYZ RESUME BULLET FORMULA                        |\n+-------------------------------------------------------------------------------+\n  Bad (Vague):\n    \"Helped optimize database queries for the web application.\"\n    \n  Good (Google XYZ Formula):\n    \"Engineered covering composite indexes across 5.6M+ records in MySQL 8.0,\n     slashing p99 query latency by 118x (from 1,420ms to 12ms) and eliminating\n     clustered bookmark lookups during peak traffic.\"\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Quantify scale (5.6M+ rows, 500GB tablespace, 24,500 TPS).",
          "Quantify impact (118x speedup, 0 deadlocks, sub-10ms drop times).",
          "Specify technical mechanism (Covering indexes, MVCC, ProxySQL, Canonical locking)."
        ],
        "exercise": "Analyze the diagram and identify key architectural bottlenecks.",
        "solution": "-- Architectural invariants identified."
      },
      {
        "chapter": 6,
        "badge": "Core Theory Part 2",
        "title": "Chapter 6: 2. High-Impact Technical Interview Drill Framework",
        "overview": "Second major theoretical principle of this module.",
        "content": "Staff-level technical interviews evaluate depth across four core pillars: Storage Engine Internals (Buffer Pool, WAL, B+ Trees), Indexing & Cost Model (Covering, EXPLAIN, FileSort), Concurrency & ACID (MVCC, Next-Key Locks, Deadlocks), and High Availability (GTID, Semi-Sync, ProxySQL).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                       STAFF DBA INTERVIEW MATRIX                              |\n+-------------------------------------------------------------------------------+\n  Pillar 1: Storage Internals  -> Explain 16KB Page splits, Doublewrite buffer & WAL\n  Pillar 2: Indexing & Cost    -> Explain Bookmark lookups, Skip Scans & Hash Joins\n  Pillar 3: ACID & Concurrency -> Explain Read Views, Gap Locks & Dijkstra Canonical Locks\n  Pillar 4: Scaling & HA       -> Explain GTID 3-thread replication & ProxySQL routing\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Always explain *why* an engine mechanism behaves the way it does, not just *what* the syntax is.",
          "Reference production incident experience: buffer pool thrashing, replication lag, and deadlocks."
        ],
        "exercise": "Compare performance tradeoffs between naive and optimized designs.",
        "solution": "-- Optimization tradeoffs verified."
      },
      {
        "chapter": 7,
        "badge": "SQL Code Walkthrough",
        "title": "Chapter 7: Executable SQL - Master Database Architecture Health Verification Query",
        "overview": "Line-by-line breakdown of the production SQL query.",
        "content": "In this chapter, we analyze the production query. \\n\\nExplanation:\\nGathers the core server configuration flags (Engine version, Buffer Pool RAM allocation, GTID mode, binlog format, and isolation level) into a single audit report.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                          QUERY EXECUTION TIMELINE                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review every SQL clause and its index interactions.",
          "Understand why each hint or condition is written."
        ],
        "exercise": "Run the SQL query in the playground and inspect output columns.",
        "solution": "-- Master Health & Performance Diagnostic Verification Query\nSELECT \n    'Database Engine' AS component, \n    VERSION() AS metric_value\nUNION ALL\nSELECT \n    'Buffer Pool Size', \n    CONCAT(ROUND(@@innodb_buffer_pool_size / (1024*1024*1024), 2), ' GB')\nUNION ALL\nSELECT \n    'GTID Mode', \n    @@gtid_mode\nUNION ALL\nSELECT \n    'Binary Log Format', \n    @@binlog_format\nUNION ALL\nSELECT \n    'Transaction Isolation Level', \n    @@transaction_isolation;"
      },
      {
        "chapter": 8,
        "badge": "Production War Stories",
        "title": "Chapter 8: Senior Staff DBA Pitfalls & Silent Failures",
        "overview": "Real-world incident breakdowns and production gotchas.",
        "content": "Senior DBA Gotcha: Failing to rehearse explaining technical tradeoffs out loud. Staff engineers are evaluated on how clearly they articulate *why* they chose one architecture over another (e.g. why REPEATABLE READ was chosen over READ COMMITTED, or why RANGE partitioning was chosen over HASH).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                         PRODUCTION INCIDENT AVOIDANCE                         |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Identify high-risk configuration anti-patterns.",
          "Implement preventative monitoring and alerts."
        ],
        "exercise": "Identify which configuration setting mitigates this pitfall.",
        "solution": "-- Production mitigation parameter configured."
      },
      {
        "chapter": 9,
        "badge": "Hands-On Practice",
        "title": "Chapter 9: Hands-On Lab Exercise & Performance Tuning",
        "overview": "Practical tuning exercise on real cloud data.",
        "content": "Apply the principles learned in this module to optimize a query or diagnose an engine bottleneck.",
        "diagram": "+-------------------------------------------------------------------------------+\n|                           LAB BENCHMARK SCORECARD                             |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Measure execution latency before and after optimization.",
          "Verify index usage in EXPLAIN."
        ],
        "exercise": "Execute the query in the SQL playground and measure execution metrics.",
        "solution": "-- Master Health & Performance Diagnostic Verification Query\nSELECT \n    'Database Engine' AS component, \n    VERSION() AS metric_value\nUNION ALL\nSELECT \n    'Buffer Pool Size', \n    CONCAT(ROUND(@@innodb_buffer_pool_size / (1024*1024*1024), 2), ' GB')\nUNION ALL\nSELECT \n    'GTID Mode', \n    @@gtid_mode\nUNION ALL\nSELECT \n    'Binary Log Format', \n    @@binlog_format\nUNION ALL\nSELECT \n    'Transaction Isolation Level', \n    @@transaction_isolation;"
      },
      {
        "chapter": 10,
        "badge": "Knowledge Check",
        "title": "Chapter 10: Module Mastery Quiz & Solution Review",
        "overview": "Validate your conceptual understanding with a technical check.",
        "content": "Test your understanding of Week 24:\\n\\n**Question**: Which of these resume bullets demonstrates highest technical impact using Google's XYZ formula?\\n\\n**Explanation**: Option B follows the Google XYZ formula: it specifies the action, the metric (118x / 12ms), the scale (5.6M+), and the exact technical mechanism (covering indexes).",
        "diagram": "+-------------------------------------------------------------------------------+\n|                            MODULE MASTERY VERIFIED                            |\n+-------------------------------------------------------------------------------+",
        "takeaways": [
          "Review quiz answers and explanations thoroughly.",
          "Mark week completed once all exercises pass."
        ],
        "exercise": "Which of these resume bullets demonstrates highest technical impact using Google's XYZ formula?",
        "solution": "-- Correct Answer: Option 2 (Engineered covering composite indexes across 5.6M+ records, slashing p99 latency by 118x (from 1,420ms to 12ms) and eliminating clustered bookmark lookups.)"
      }
    ]
  }
};

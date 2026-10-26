/**
 * MySQL Pro Learning Platform Application Logic
 * Powers in-browser SQL execution via SQL.js WASM, full course lesson viewer,
 * interactive lab query loading, curriculum progress tracking, and interview flashcards.
 */

let db = null;
let currentTab = 'curriculum';
let activeModalWeek = 1;

// ------------------------------------------------------------------------
// 1. Curriculum Structure (6 Months / 24 Weeks)
// ------------------------------------------------------------------------
const CURRICULUM = [
  {
    month: 1,
    title: "Month 1: Advanced Analytical SQL on Cloud Big Data",
    focus: "Bridging intermediate SQL to advanced analytics using Google Cloud Stack Overflow, GitHub DAGs, and AWS Amazon Reviews.",
    weeks: [
      { week: 1, title: "Execution Order & Self-Joins (Stack Overflow Tags)", desc: "Understanding the FROM -> WHERE -> GROUP BY -> SELECT order, Self Joins on tag co-occurrence matrix, and MySQL 8 Hash Joins." },
      { week: 2, title: "Window Functions & Analytical Velocity (NYC Taxi & SO)", desc: "ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, and sliding window frame specifications on developer reputation trajectories." },
      { week: 3, title: "Recursive CTEs & Git Commit Hierarchical DAGs", desc: "Recursive CTEs for traversing GitHub parent-child commit histories, multi-hop fork networks, and dynamic calendar series." },
      { week: 4, title: "MySQL 8 Native JSON & Full-Text Search (130M+ Amazon Reviews)", desc: "JSON extraction (->, ->>), JSON_TABLE relational projection, virtual column indexing, and Boolean Mode FTS on 130M+ Amazon Reviews." }
    ]
  },
  {
    month: 2,
    title: "Month 2: InnoDB Internals & Deep Indexing on GitHub Commits",
    focus: "Mastering storage engine memory/disk architecture, B+ Tree mechanics, and EXPLAIN ANALYZE on TBs of GitHub commits & NYC Taxi trips.",
    weeks: [
      { week: 5, title: "InnoDB Memory & Disk Structures Under Heavy Writes", desc: "Buffer Pool LRU lists, Redo Log Buffer, Change Buffer, 16KB Page anatomy, and Doublewrite Buffer during big data streaming." },
      { week: 6, title: "B+ Tree Anatomy & Leaf Page Splits on Git/Crypto Hashes", desc: "Clustered indexes vs secondary indexes, 50-50 leaf page splits from random SHA-1 / SHA-256 hashes, and binary storage packing." },
      { week: 7, title: "Covering Indexes & Leftmost Prefix Rule (100x Speedup)", desc: "Eliminating clustered index bookmark lookups on NYC Taxi queries, composite index ordering, and MySQL 8 Index Skip Scans." },
      { week: 8, title: "Query Execution Plan Mastery (EXPLAIN ANALYZE)", desc: "Analyzing actual time vs estimated cost, loops, access types (ref, range, eq_ref), and eliminating filesorts on 10M+ records." }
    ]
  },
  {
    month: 3,
    title: "Month 3: Concurrency, MVCC & ACID on Blockchain Ledgers",
    focus: "ACID isolation guarantees, row-level locking, deadlock prevention, and production tuning for high-throughput Bitcoin & Ethereum transactions.",
    weeks: [
      { week: 9, title: "ACID, WAL & Crash Recovery Tuning on Crypto Ledgers", desc: "Undo log rollbacks, redo log WAL, and tuning innodb_flush_log_at_trx_commit vs sync_binlog for 50,000+ TPS." },
      { week: 10, title: "Isolation Levels & MVCC Snapshot Mechanics", desc: "Read Committed vs Repeatable Read, DB_TRX_ID, DB_ROLL_PTR, and Read View lifecycle under concurrent block arrivals." },
      { week: 11, title: "Locking Internals & Canonical Deadlock Immunity", desc: "Record Locks, Gap Locks, Next-Key Locks, and mathematical deadlock immunity using LEAST(addr_a, addr_b) canonical ordering." },
      { week: 12, title: "Production Server Tuning & Slow Query Logs", desc: "Buffer Pool sizing (70-80% RAM), pt-query-digest, slow query threshold profiling (long_query_time = 0.05)." }
    ]
  },
  {
    month: 4,
    title: "Month 4: Big Data Scaling, Partitioning & Petabytes (NYC Taxi & Common Crawl)",
    focus: "Ingesting and managing hundreds of millions of records using partitioning on public S3 datasets (s3://nyc-tlc/ & s3://commoncrawl/).",
    weeks: [
      { week: 13, title: "High-Speed Bulk Ingestion & Cloud Streaming", desc: "Optimizing LOAD DATA LOCAL INFILE, bulk insert batching, and streaming directly from public S3 / BigQuery in seconds." },
      { week: 14, title: "Spatial GIS Analytics on Urban Transit & Global Networks", desc: "AWS Open Data NYC Taxi and aviation data; R-Tree spatial indexes and ST_Distance_Sphere." },
      { week: 15, title: "Table Partitioning Architecture on Billions of NYC Taxi Trips", desc: "RANGE, LIST, and HASH partitioning on NYC Taxi pickup dates; strict rules requiring partition keys in all unique/primary keys." },
      { week: 16, title: "Partition Pruning & Zero-Downtime Data Lifecycle Aging", desc: "Proving partition elimination in EXPLAIN; instant sub-10ms data drops via ALTER TABLE DROP PARTITION without redo bloat." }
    ]
  },
  {
    month: 5,
    title: "Month 5: Cloud HA, Replication & Hugging Face FineWeb Pipelines",
    focus: "Multi-node replication, ProxySQL query routing, point-in-time disaster recovery, and LLM pretraining data staging (FineWeb 15T tokens).",
    weeks: [
      { week: 17, title: "GTID-Based Replication & Semi-Sync Failover", desc: "Row-based binary logging, three-thread replication architecture, and automated GTID failover across regions." },
      { week: 18, title: "ProxySQL & Automated Read/Write Splitting", desc: "Connection multiplexing, routing SELECT ... FOR UPDATE to master, and shunning lagging replicas." },
      { week: 19, title: "Enterprise Backups & Zero-Data-Loss Point-in-Time Recovery", desc: "mysqldump --single-transaction, binlog coordinate extraction, and point-in-time recovery to the second." },
      { week: 20, title: "Native Cloud S3 Ingestion & FineWeb 15T Pretrain Staging", desc: "Native LOAD DATA FROM S3 in Aurora/RDS, token vocabulary frequency tables, and quality filtering before LLM tokenization." }
    ]
  },
  {
    month: 6,
    title: "Month 6: Capstone Portfolio Projects on Cloud Big Data",
    focus: "Benchmarking 3 production projects built on Google Cloud GitHub/Crypto, AWS Open Data, and Hugging Face FineWeb.",
    weeks: [
      { week: 21, title: "Project 1: Global Developer Ecosystem Analytics Engine", desc: "GitHub Public Archive + Stack Overflow 10M+ records, covering index 100x speedup, and Git DAG recursive traversal." },
      { week: 22, title: "Project 2: Institutional Blockchain Ledger & ACID Settlement", desc: "Bitcoin/Ethereum UTXO model, 50-thread stress testing, 100% deadlock immunity, and sliding-window AML fraud detection." },
      { week: 23, title: "Project 3: Petabyte Web & LLM Pretraining Data Pipeline", desc: "Common Crawl WARC metadata, Hugging Face FineWeb 15T tokens, ProxySQL clustering, and native Aurora S3 pipelines." },
      { week: 24, title: "Portfolio Launch, Resume Bullets & Technical Interview Mastery", desc: "Packaging GitHub repos, publishing LinkedIn technical breakdown, and drilling all 50 Pro interview Q&As." }
    ]
  }
];

// ------------------------------------------------------------------------
// 2. Comprehensive Course Lesson Content (Weeks 1 to 24)
// ------------------------------------------------------------------------
const LESSON_DETAILS = {
  1: {
    month: 1,
    title: "Week 1: SQL Execution Order, Advanced Joins & Hash Joins",
    time: "25 min read",
    overview: "Master the true internal 10-step query execution pipeline of SQL, understand why aliases fail in WHERE clauses, and implement high-performance self-joins and hash joins.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. The 10-Step Logical Execution Pipeline</h4>
      <p class="mb-3">While developers write SQL starting with <code>SELECT</code>, the MySQL engine evaluates clauses in this strict order:</p>
      <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 space-y-1 mb-4">
        <div>1. FROM &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Identify base tables</div>
        <div>2. ON &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Evaluate join conditions per pair</div>
        <div>3. JOIN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Generate combined virtual table</div>
        <div>4. WHERE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Filter individual rows before aggregation</div>
        <div>5. GROUP BY &nbsp;&nbsp;&nbsp;&nbsp;→ Bucket filtered rows into distinct groups</div>
        <div>6. HAVING &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Filter aggregated groups</div>
        <div>7. SELECT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Evaluate projection, window functions, and aliases</div>
        <div>8. DISTINCT &nbsp;&nbsp;&nbsp;&nbsp;→ Eliminate duplicate output rows</div>
        <div>9. ORDER BY &nbsp;&nbsp;&nbsp;&nbsp;→ Sort result set (can access SELECT aliases)</div>
        <div>10. LIMIT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Paginate and truncate result rows</div>
      </div>
      <h4 class="text-base font-bold text-white mb-2">2. Self-Joins & Market Basket Analysis</h4>
      <p class="mb-3">When finding pairs of items (e.g. Products bought in the same order), you must join the table to itself using a strict inequality constraint (<code>oi1.product_id < oi2.product_id</code>) to prevent duplicate reverse pairs and self-matches.</p>
      <h4 class="text-base font-bold text-white mb-2">3. Hash Joins in MySQL 8.0.18+</h4>
      <p class="mb-2">Legacy MySQL used Block Nested Loop (BNL) joins with quadratic complexity O(N × M). Modern MySQL 8 uses in-memory Hash Joins with linear O(N + M) complexity.</p>
    `,
    codeTitle: "Self-Join Market Basket Co-Occurrence Query",
    code: `SELECT 
    oi1.product_id AS product_a,
    oi2.product_id AS product_b,
    COUNT(DISTINCT oi1.order_id) AS shared_orders_count
FROM order_items oi1
JOIN order_items oi2 
    ON oi1.order_id = oi2.order_id 
   AND oi1.product_id < oi2.product_id
GROUP BY oi1.product_id, oi2.product_id
ORDER BY shared_orders_count DESC
LIMIT 10;`,
    pitfalls: "Never use <code>WHERE alias > 100</code> on a column calculated in <code>SELECT</code>. Because <code>WHERE</code> executes before <code>SELECT</code>, the engine throws an 'Unknown column' error. Either repeat the expression in <code>WHERE</code> or wrap it in a CTE.",
    quiz: {
      question: "Which SQL clause evaluates FIRST during database execution?",
      options: ["SELECT", "WHERE", "FROM", "GROUP BY"],
      answer: 2,
      explanation: "FROM is the very first clause evaluated because the engine must identify and load the source tables before filtering or projecting columns."
    }
  },
  2: {
    month: 1,
    title: "Week 2: Window Functions & Analytical Frameworks",
    time: "30 min read",
    overview: "Master non-collapsing analytical window functions: ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, and sliding window frames.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Window Functions vs GROUP BY</h4>
      <p class="mb-3">Unlike <code>GROUP BY</code>, which collapses multiple rows into a single summary row, Window Functions compute aggregate or ranking metrics across an <code>OVER(...)</code> partition while preserving every individual row's identity.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Ranking Functions Comparison</h4>
      <ul class="list-disc list-inside space-y-1 mb-3 text-xs">
        <li><code>ROW_NUMBER()</code>: Strictly consecutive integers (1, 2, 3, 4) with no gaps or ties.</li>
        <li><code>RANK()</code>: Same rank for ties, skips subsequent rank (1, 2, 2, 4).</li>
        <li><code>DENSE_RANK()</code>: Same rank for ties, does NOT skip subsequent rank (1, 2, 2, 3). Ideal for Top-N leaderboards!</li>
      </ul>
      <h4 class="text-base font-bold text-white mb-2">3. Sliding Frame Specifications</h4>
      <p class="mb-2">Use <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> to calculate rolling 7-day moving averages.</p>
    `,
    codeTitle: "Top 3 Products Per Category using DENSE_RANK()",
    code: `WITH ranked_items AS (
    SELECT 
        p.category,
        p.name AS product_name,
        ROUND(SUM(oi.subtotal), 2) AS revenue,
        DENSE_RANK() OVER (PARTITION BY p.category ORDER BY SUM(oi.subtotal) DESC) AS rank_in_cat
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.category, p.product_id, p.name
)
SELECT * FROM ranked_items WHERE rank_in_cat <= 3;`,
    pitfalls: "When using <code>LAST_VALUE()</code>, the default frame is <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, which returns the current row instead of the true partition end! Always specify <code>ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING</code>.",
    quiz: {
      question: "If two items tie for 2nd place, which function assigns the next item rank 3 (instead of 4)?",
      options: ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"],
      answer: 1,
      explanation: "DENSE_RANK() leaves no gaps in the ranking sequence, giving 1, 2, 2, 3."
    }
  },
  3: {
    month: 1,
    title: "Week 3: Recursive CTEs & Hierarchical Graph Queries",
    time: "25 min read",
    overview: "Solve multi-level organization charts, bill-of-materials, referral networks, and calendar date-series generators using recursive Common Table Expressions.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Anatomy of a Recursive CTE</h4>
      <p class="mb-3">A Recursive CTE consists of three essential components connected by <code>UNION ALL</code>:</p>
      <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 space-y-1 mb-3">
        <div>1. Anchor Member: Base query establishing root nodes (depth = 1)</div>
        <div>2. UNION ALL</div>
        <div>3. Recursive Member: Joins the CTE back to the source table to traverse edges</div>
        <div>4. Termination Condition: WHERE depth < max_depth (prevents infinite cycles)</div>
      </div>
      <h4 class="text-base font-bold text-white mb-2">2. Generating Dynamic Sequences</h4>
      <p class="mb-2">Recursive CTEs allow creating dynamic date ranges on the fly without needing a physical calendar table.</p>
    `,
    codeTitle: "Traversing Git Commit History DAG (Google Cloud GitHub Archive)",
    code: `WITH RECURSIVE git_history AS (
  SELECT commit_sha, parent_sha, author_name, message, 1 as depth 
  FROM github_commits 
  WHERE commit_sha = 'c3d4e5f6'
  UNION ALL
  SELECT c.commit_sha, c.parent_sha, c.author_name, c.message, gh.depth + 1 
  FROM github_commits c 
  JOIN git_history gh ON c.commit_sha = gh.parent_sha 
  WHERE gh.depth < 5
)
SELECT depth, commit_sha, author_name, message FROM git_history;`,
    pitfalls: "Always safeguard recursive CTEs with depth limits or check <code>cte_max_recursion_depth</code> (default: 1000) to prevent runaway memory consumption from cyclical graphs.",
    quiz: {
      question: "What operator connects the Anchor Member and Recursive Member in a recursive CTE?",
      options: ["INTERSECT", "UNION ALL", "INNER JOIN", "CROSS APPLY"],
      answer: 1,
      explanation: "UNION ALL combines the initial anchor rows with subsequent recursive iterations."
    }
  },
  4: {
    month: 1,
    title: "Week 4: MySQL 8 Native JSON & Full-Text Search (FTS)",
    time: "25 min read",
    overview: "Query semi-structured telemetry with JSON operators (->, ->>), project relational rows with JSON_TABLE, and build full-text search engines.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. JSON Path Operators</h4>
      <p class="mb-2"><code>payload->'$.device'</code> extracts quoted JSON, while <code>payload->>'$.device'</code> extracts an unquoted clean string.</p>
      <h4 class="text-base font-bold text-white mb-2">2. JSON_TABLE Projection</h4>
      <p class="mb-2">Converts nested JSON documents directly into relational rows and columns on the fly inside the query planner.</p>
      <h4 class="text-base font-bold text-white mb-2">3. Full-Text Search (FTS) Inverted Indexes</h4>
      <p class="mb-2">InnoDB FTS builds inverted word indexes supporting Natural Language and Boolean Mode (<code>+mandatory -excluded*</code>) search with relevancy scores.</p>
    `,
    codeTitle: "Querying JSON & Calculating Aggregates",
    code: `SELECT 
    category,
    COUNT(*) AS total_products,
    ROUND(AVG(base_price), 2) AS avg_price,
    MAX(base_price) AS max_price
FROM products
GROUP BY category
ORDER BY avg_price DESC;`,
    pitfalls: "You cannot directly create a standard B+ Tree index on an entire JSON column. Instead, create a Generated Virtual Column on the extracted JSON key and index the virtual column!",
    quiz: {
      question: "Which MySQL operator extracts a JSON attribute as an unquoted, clean string?",
      options: ["->", "->>", "::json", "#>"],
      answer: 1,
      explanation: "The ->> operator is shorthand for JSON_UNQUOTE(JSON_EXTRACT(...))."
    }
  },
  5: {
    month: 2,
    title: "Week 5: InnoDB Architecture & Memory/Disk Structures",
    time: "30 min read",
    overview: "Understand what happens inside the database engine: Buffer Pool LRU lists, Redo Log WAL, 16KB Page structures, and Doublewrite torn-page protection.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Buffer Pool Architecture</h4>
      <p class="mb-3">The Buffer Pool caches table and index data pages in RAM. It maintains three linked lists: Free List (empty pages), LRU List (cached pages segmented into 5/8 Young and 3/8 Old to prevent scan poisoning), and Flush List (dirty modified pages).</p>
      <h4 class="text-base font-bold text-white mb-2">2. Doublewrite Buffer</h4>
      <p class="mb-2">Prevents torn pages. If an OS crash occurs while writing a 16KB page, the Doublewrite buffer enables pristine restoration before redo logs are applied.</p>
    `,
    codeTitle: "Inspecting Buffer Pool Hit Ratio",
    code: `SELECT 
    ROUND(100 - (100 * 50 / 10000), 2) AS simulated_buffer_pool_hit_pct;`,
    pitfalls: "Setting innodb_buffer_pool_size too small forces constant disk paging; on dedicated database servers, allocate 70-80% of total system RAM to the Buffer Pool.",
    quiz: {
      question: "What is the default page size in the MySQL InnoDB storage engine?",
      options: ["4 KB", "8 KB", "16 KB", "64 KB"],
      answer: 2,
      explanation: "InnoDB uses a 16KB page size by default."
    }
  },
  6: {
    month: 2,
    title: "Week 6: B+ Tree Anatomy & Leaf Page Splits",
    time: "25 min read",
    overview: "Deep dive into B+ Tree data structures, clustered vs secondary indexes, fan-out, and the performance cost of random page splits.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Clustered vs Secondary Indexes</h4>
      <p class="mb-3">In InnoDB, the Primary Key defines the Clustered Index (the table rows physically reside in the leaf pages). Secondary indexes store the secondary key value plus the Primary Key (the bookmark pointer).</p>
      <h4 class="text-base font-bold text-white mb-2">2. Page Splits</h4>
      <p class="mb-2">Sequential inserts fill pages to 15/16 capacity. Random UUID inserts cause 50% split fragmentation, doubling disk footprint and memory consumption.</p>
    `,
    codeTitle: "Product SKU Index Lookup Simulation",
    code: `SELECT product_id, sku, name, base_price, stock_quantity
FROM products
WHERE category = 'Electronics' AND base_price > 100
ORDER BY base_price ASC;`,
    pitfalls: "Avoid random UUID primary keys on high-insert tables; use monotonically increasing BIGINT AUTO_INCREMENT or UUIDv7 (time-ordered).",
    quiz: {
      question: "What do the leaf nodes of an InnoDB secondary index contain?",
      options: ["Full row data", "Physical disk byte offset", "Secondary key value + Primary Key", "Hash pointer"],
      answer: 2,
      explanation: "Secondary indexes store the indexed column values plus the primary key to perform bookmark lookups."
    }
  },
  7: {
    month: 2,
    title: "Week 7: Covering Indexes & Leftmost Prefix Rule",
    time: "30 min read",
    overview: "Learn how covering composite indexes achieve a 100x performance leap by eliminating clustered index bookmark lookups.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. The Covering Index Leap</h4>
      <p class="mb-3">When all columns requested in SELECT, WHERE, and ORDER BY exist in the secondary index leaf pages, MySQL satisfies the query with zero bookmark lookups. Indicated by 'Using index' in EXPLAIN.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Leftmost Prefix Rule</h4>
      <p class="mb-2">An index on (A, B, C) can filter queries on (A) or (A, B) or (A, B, C). It cannot efficiently filter queries on (B) or (C) alone.</p>
    `,
    codeTitle: "Covering Composite Index Query Pattern",
    code: `SELECT order_id, customer_id, order_date, total_amount
FROM orders
WHERE customer_id = 10
ORDER BY order_date DESC;`,
    pitfalls: "Placing range columns before equality columns in a composite index breaks index filtering for subsequent columns. Rule: Equality columns first, range columns last!",
    quiz: {
      question: "What indicates in EXPLAIN that a query was resolved entirely from an index without reading table rows?",
      options: ["Using where", "Using filesort", "Using index", "Using temporary"],
      answer: 2,
      explanation: "'Using index' in the Extra column confirms a pure covering index resolution."
    }
  },
  8: {
    month: 2,
    title: "Week 8: Query Execution Plan Mastery (EXPLAIN ANALYZE)",
    time: "30 min read",
    overview: "Master EXPLAIN FORMAT=TREE and EXPLAIN ANALYZE to compare optimizer cost estimates against real execution timings.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Anatomy of EXPLAIN ANALYZE</h4>
      <p class="mb-3">Introduced in MySQL 8.0.18. Provides <code>actual time=0.045..1.230 rows=50 loops=1</code>. The first number is time to the first row; second is time to finish the node.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Eliminating Using filesort</h4>
      <p class="mb-2">Occurs when InnoDB cannot use an index to satisfy ORDER BY, forcing in-memory or on-disk sort buffer passes.</p>
    `,
    codeTitle: "Customer Order Aggregation & Sort Profile",
    code: `SELECT customer_id, COUNT(*) as order_count, SUM(total_amount) as total_spent
FROM orders
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;`,
    pitfalls: "Never rely solely on estimated cost; always verify with EXPLAIN ANALYZE because outdated table statistics can mislead the optimizer.",
    quiz: {
      question: "Which index access type is the fastest during query execution?",
      options: ["range", "ref", "system / const", "ALL"],
      answer: 2,
      explanation: "const / system access represents single-row lookups on primary or unique keys in constant time."
    }
  },
  9: {
    month: 3,
    title: "Week 9: ACID, WAL & Crash Recovery Tuning",
    time: "25 min read",
    overview: "Deep dive into Write-Ahead Logging (WAL) and benchmark transaction durability vs throughput.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Write-Ahead Logging (WAL)</h4>
      <p class="mb-3">Changes are written to the Redo Log Buffer before dirty data pages are flushed to tablespaces. On crash, committed transactions are replayed (rolled forward) while uncommitted ones are rolled back via Undo logs.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Tuning Commit Flushes</h4>
      <p class="mb-2"><code>innodb_flush_log_at_trx_commit = 1</code> flushes on every commit (Strict ACID). Value <code>2</code> flushes to OS cache every commit and fsyncs every 1s (10x faster TPS with 1s crash window).</p>
    `,
    codeTitle: "Account Transaction Balance Snapshot",
    code: `SELECT account_id, customer_id, current_balance, status
FROM accounts
WHERE current_balance > 5000
ORDER BY current_balance DESC
LIMIT 15;`,
    pitfalls: "Setting innodb_flush_log_at_trx_commit = 0 keeps logs in memory buffer only; a server crash can lose up to 1 second of committed financial data.",
    quiz: {
      question: "Which log file is used during crash recovery to roll back uncommitted transactions?",
      options: ["Redo Log", "Undo Log", "Binary Log", "Slow Query Log"],
      answer: 1,
      explanation: "Undo logs contain inverse operations used to roll back transactions that were in-flight during a crash."
    }
  },
  10: {
    month: 3,
    title: "Week 10: Isolation Levels & MVCC Snapshot Mechanics",
    time: "30 min read",
    overview: "Understand Multi-Version Concurrency Control (MVCC), Read Views, and the 4 ANSI SQL isolation levels.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Hidden Row System Columns</h4>
      <p class="mb-3">Each row contains <code>DB_TRX_ID</code> (transaction ID of creator) and <code>DB_ROLL_PTR</code> (pointer to undo log version chain).</p>
      <h4 class="text-base font-bold text-white mb-2">2. Read View Lifecycles</h4>
      <p class="mb-2">In <code>READ COMMITTED</code>, a new Read View is generated before each statement. In <code>REPEATABLE READ</code>, one Read View is created at transaction start and reused.</p>
    `,
    codeTitle: "High-Balance Account State Inspection",
    code: `SELECT account_id, current_balance, status
FROM accounts
WHERE status = 'ACTIVE'
ORDER BY account_id ASC
LIMIT 10;`,
    pitfalls: "Long-running transactions keep old undo log segments active, preventing purge threads from reclaiming tablespace and causing undo log bloat.",
    quiz: {
      question: "What is the default transaction isolation level in MySQL InnoDB?",
      options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
      answer: 2,
      explanation: "MySQL defaults to REPEATABLE READ with Next-Key locking."
    }
  },
  11: {
    month: 3,
    title: "Week 11: Locking Internals & Deadlock Mastery",
    time: "30 min read",
    overview: "Understand Record Locks, Gap Locks, Next-Key Locks, and guarantee 0 deadlocks via canonical lock ordering.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. InnoDB Lock Hierarchy</h4>
      <p class="mb-3">Record Lock (locks physical index entry), Gap Lock (locks empty gap between entries), Next-Key Lock (Record + Gap lock).</p>
      <h4 class="text-base font-bold text-white mb-2">2. Deadlock Elimination Formula</h4>
      <p class="mb-2">Always lock resources in ascending order: <code>first = LEAST(acc1, acc2); second = GREATEST(acc1, acc2)</code>. Deadlock cycles become mathematically impossible!</p>
    `,
    codeTitle: "Canonical Lock Ordering Simulation",
    code: `SELECT account_id, current_balance, 'LOCKED_SAFELY' AS status
FROM accounts
WHERE account_id IN (LEAST(5, 12), GREATEST(5, 12))
ORDER BY account_id ASC;`,
    pitfalls: "Executing UPDATE or DELETE statements with non-indexed WHERE clauses forces InnoDB to scan and lock every record and gap in the entire table!",
    quiz: {
      question: "What combination constitutes an InnoDB Next-Key Lock?",
      options: ["Table Lock + Row Lock", "Record Lock + Gap Lock", "Shared Lock + Exclusive Lock", "Read Lock + Write Lock"],
      answer: 1,
      explanation: "Next-Key Lock is the union of a Record Lock on the index row and a Gap Lock on the space before it."
    }
  },
  12: {
    month: 3,
    title: "Week 12: Production Server Tuning & Slow Query Logs",
    time: "25 min read",
    overview: "Profile query bottlenecks with slow query logs and configure high-throughput my.cnf parameters.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Configuring Slow Query Profiling</h4>
      <p class="mb-3">Set <code>slow_query_log = 1</code>, <code>long_query_time = 0.05</code> (50ms), and <code>log_queries_not_using_indexes = 1</code>.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Key Server Variables</h4>
      <p class="mb-2">Tune <code>innodb_log_file_size</code> (256MB-1GB), <code>max_connections</code>, and <code>table_open_cache</code> to match server CPU and RAM.</p>
    `,
    codeTitle: "Aggregating Order Fulfillment Velocity",
    code: `SELECT 
    status,
    COUNT(*) AS total_orders,
    ROUND(SUM(total_amount), 2) AS settled_volume
FROM orders
GROUP BY status;`,
    pitfalls: "Leaving long_query_time at the default 10.0 seconds fails to catch 99% of sub-optimal queries that slow down production apps.",
    quiz: {
      question: "Which tool is commonly used to aggregate and summarize MySQL Slow Query Logs?",
      options: ["mysqldump", "pt-query-digest / mysqldumpslow", "mysqlbinlog", "myisamchk"],
      answer: 1,
      explanation: "pt-query-digest from Percona Toolkit analyzes slow query logs and ranks worst offenders."
    }
  },
  13: {
    month: 4,
    title: "Week 13: High-Speed Ingestion & Bulk Data Pipelines",
    time: "25 min read",
    overview: "Ingest millions of records in seconds using LOAD DATA LOCAL INFILE, batch commits, and bulk loading session flags.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Why Single INSERTs Fail at Scale</h4>
      <p class="mb-3">Single INSERTs cause round-trip latency, per-row transaction log flushes, and random index updates. <code>LOAD DATA INFILE</code> streams data directly into InnoDB storage pages.</p>
      <h4 class="text-base font-bold text-white mb-2">2. High-Throughput Ingestion Flags</h4>
      <p class="mb-2">Disable foreign keys and unique checks during bulk loading: <code>SET foreign_key_checks=0; SET unique_checks=0; SET sql_log_bin=0;</code>.</p>
    `,
    codeTitle: "Bulk Order Summary Inspection",
    code: `SELECT 
    COUNT(*) as total_orders,
    ROUND(AVG(total_amount), 2) as avg_order_val,
    ROUND(SUM(total_amount), 2) as gross_revenue
FROM orders;`,
    pitfalls: "Leaving autocommit=1 during bulk inserts wraps each statement in an individual disk sync, reducing load speeds by up to 100x.",
    quiz: {
      question: "Which command provides the fastest bulk ingestion method into MySQL?",
      options: ["INSERT INTO ... VALUES (...) multiple times", "LOAD DATA LOCAL INFILE", "SELECT INTO OUTFILE", "REPLACE INTO"],
      answer: 1,
      explanation: "LOAD DATA INFILE bypasses standard query parsing and writes directly to table pages."
    }
  },
  14: {
    month: 4,
    title: "Week 14: Public Cloud Datasets & Spatial GIS SQL",
    time: "25 min read",
    overview: "Integrate AWS Open Data NYC Taxi and aviation telemetry; index spatial geometries using R-Trees and ST_Distance_Sphere.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. MySQL 8 Spatial GIS Types</h4>
      <p class="mb-3">Supports <code>POINT</code>, <code>LINESTRING</code>, and <code>POLYGON</code> coordinate geometries with spatial indexing using R-Trees.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Great-Circle Distance Calculation</h4>
      <p class="mb-2"><code>ST_Distance_Sphere(pt1, pt2)</code> calculates real-world spherical distance in meters on the globe.</p>
    `,
    codeTitle: "Customer Geo-Distribution by Country",
    code: `SELECT 
    country,
    COUNT(*) AS customer_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2) AS percentage
FROM customers
GROUP BY country
ORDER BY customer_count DESC;`,
    pitfalls: "Standard B+ Tree composite indexes cannot index 2D coordinates efficiently; spatial columns require SPATIAL INDEX (R-Tree).",
    quiz: {
      question: "What spatial index data structure does MySQL InnoDB use for geometry columns?",
      options: ["B+ Tree", "R-Tree", "LSM Tree", "Trie"],
      answer: 1,
      explanation: "R-Trees (Rectangle Trees) index multi-dimensional spatial bounding boxes."
    }
  },
  15: {
    month: 4,
    title: "Week 15: Table Partitioning Architecture",
    time: "30 min read",
    overview: "Architect RANGE, LIST, and HASH partitioning strategies and understand the primary key alignment rule.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Partitioning Types</h4>
      <p class="mb-3">RANGE (time-series dates), LIST (discrete regions), and HASH (even write distribution across physical partitions).</p>
      <h4 class="text-base font-bold text-white mb-2">2. The Golden Rule of Partition Keys</h4>
      <p class="mb-2">Every unique key (including PRIMARY KEY) MUST contain every column in the partitioning expression. If partitioning by order_date, the PK must be (order_id, order_date).</p>
    `,
    codeTitle: "Annual Order Volume Distribution",
    code: `SELECT 
    substr(order_date, 1, 4) AS sales_year,
    COUNT(*) AS total_orders,
    ROUND(SUM(total_amount), 2) AS gross_sales
FROM orders
GROUP BY substr(order_date, 1, 4)
ORDER BY sales_year;`,
    pitfalls: "Partitioning small tables (< 1 million rows) adds routing overhead without performance benefits. Partitioning is for multi-million row datasets.",
    quiz: {
      question: "If a table has PRIMARY KEY (id), can you partition by RANGE (created_at)?",
      options: ["Yes, unconditionally", "No, created_at must be added to the Primary Key", "Yes, if created_at is indexed", "Only in MySQL 5.7"],
      answer: 1,
      explanation: "MySQL strictly requires all partition expression columns to be part of every unique and primary key."
    }
  },
  16: {
    month: 4,
    title: "Week 16: Partition Pruning & Zero-Downtime Data Aging",
    time: "25 min read",
    overview: "Verify partition pruning in EXPLAIN plans and purge millions of historical rows in < 10ms via ALTER TABLE DROP PARTITION.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Partition Pruning</h4>
      <p class="mb-3">The query optimizer checks WHERE predicates and only opens physical tablespace partitions that can contain matching data.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Zero-Cost Data Purging</h4>
      <p class="mb-2"><code>ALTER TABLE ... DROP PARTITION</code> unlinks the physical .ibd file instantly in < 10ms with zero undo/redo log bloat.</p>
    `,
    codeTitle: "Quarterly Revenue Breakdown",
    code: `SELECT 
    substr(order_date, 1, 7) AS order_month,
    COUNT(*) AS total_orders,
    ROUND(SUM(total_amount), 2) AS monthly_rev
FROM orders
GROUP BY substr(order_date, 1, 7)
ORDER BY order_month DESC
LIMIT 12;`,
    pitfalls: "Running DELETE FROM table WHERE date < '2022-01-01' on 10M rows causes massive buffer pool churn and tablespace fragmentation. Always use DROP PARTITION.",
    quiz: {
      question: "Why is DROP PARTITION faster than DELETE FROM WHERE date < '2022-01-01'?",
      options: ["It skips binary logs", "It unlinks the physical partition file without row-by-row undo/redo logging", "It uses multi-threading", "It converts rows to CSV"],
      answer: 1,
      explanation: "DROP PARTITION is an instantaneous filesystem deletion of the partition tablespace file."
    }
  },
  17: {
    month: 5,
    title: "Week 17: GTID-Based Replication & Semi-Sync",
    time: "30 min read",
    overview: "Deploy modern Global Transaction Identifier (GTID) replication, three-thread architectures, and zero-loss semi-sync clusters.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. GTID Mechanics</h4>
      <p class="mb-3">Each transaction receives a globally unique coordinate (<code>source_id:transaction_id</code>). Eliminates tracking binlog file offsets during failover.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Semi-Synchronous Replication</h4>
      <p class="mb-2">The primary waits until at least one replica has received and written the event to its Relay Log before committing to the client, guaranteeing zero data loss.</p>
    `,
    codeTitle: "Active Customers per Loyalty Tier",
    code: `SELECT 
    tier,
    COUNT(*) AS total_customers,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM customers), 2) AS pct_of_base
FROM customers
GROUP BY tier
ORDER BY total_customers DESC;`,
    pitfalls: "Statement-based replication (SBR) causes replication divergence with non-deterministic functions like NOW() or RAND(). Always use ROW-based binary logging.",
    quiz: {
      question: "What is the primary advantage of GTID replication over classic binary log coordinates?",
      options: ["Faster network compression", "Automatic failover and replica repointing without tracking binlog file coordinates", "Disables table locking", "Removes the need for Primary Keys"],
      answer: 1,
      explanation: "GTID automatically matches transaction coordinates across replicas during failovers."
    }
  },
  18: {
    month: 5,
    title: "Week 18: ProxySQL & Automated Read/Write Splitting",
    time: "30 min read",
    overview: "Configure ProxySQL connection multiplexing, route writes to primary master, and load-balance reads across read replicas.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. ProxySQL Layer Architecture</h4>
      <p class="mb-3">Decouples application connection pools from backend nodes. Serves 5,000 application client connections with just 50 persistent backend MySQL connections.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Query Rules Regex</h4>
      <p class="mb-2">Rule 1 routes <code>^SELECT.*FOR UPDATE</code> to Master (Hostgroup 10). Rule 2 routes <code>^SELECT</code> to Read Replicas (Hostgroup 20).</p>
    `,
    codeTitle: "Simulating Read-Heavy Customer Order History",
    code: `SELECT o.order_id, o.order_date, o.status, o.total_amount
FROM orders o
WHERE o.customer_id = 25
ORDER BY o.order_date DESC;`,
    pitfalls: "Routing SELECT ... FOR UPDATE to read replicas causes lock failures. Always ensure locked reads are routed to the primary master hostgroup.",
    quiz: {
      question: "Why should SELECT ... FOR UPDATE always be routed to the Master hostgroup?",
      options: ["Replicas do not have storage", "Exclusive row locks can only be held on the writable primary node", "ProxySQL requires it", "It is 10x faster"],
      answer: 1,
      explanation: "Row-level exclusive locks must be acquired on the primary master where write transactions execute."
    }
  },
  19: {
    month: 5,
    title: "Week 19: Enterprise Backups & Point-in-Time Recovery",
    time: "25 min read",
    overview: "Perform consistent snapshots using mysqldump --single-transaction and execute point-in-time recovery (PITR) to the second.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Non-Blocking Consistent Snapshots</h4>
      <p class="mb-3"><code>mysqldump --single-transaction</code> creates an MVCC repeatable read snapshot, allowing full database backups without locking InnoDB tables.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Replaying Binary Logs</h4>
      <p class="mb-2">Use <code>mysqlbinlog --start-position --stop-position</code> to replay transactions right up to the exact second before an accidental DROP TABLE.</p>
    `,
    codeTitle: "Financial Account Ledger Audit Query",
    code: `SELECT 
    COUNT(*) as total_accounts,
    ROUND(SUM(current_balance), 2) as aggregate_deposits,
    ROUND(AVG(current_balance), 2) as average_balance
FROM accounts;`,
    pitfalls: "Taking backups without --master-data=2 fails to record the binary log coordinates, making point-in-time disaster recovery impossible.",
    quiz: {
      question: "Which flag allows mysqldump to back up InnoDB tables consistently without locking them?",
      options: ["--lock-all-tables", "--single-transaction", "--quick", "--skip-opt"],
      answer: 1,
      explanation: "--single-transaction creates a consistent MVCC snapshot at transaction start."
    }
  },
  20: {
    month: 5,
    title: "Week 20: Hardened Enterprise Security & Compliance",
    time: "25 min read",
    overview: "Implement Role-Based Access Control (RBAC), enforce data-at-rest encryption, TLS in transit, and defense against SQL injection.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Role-Based Access Control (RBAC)</h4>
      <p class="mb-3">Create specific roles (<code>app_readonly</code>, <code>app_write</code>) and assign them to users under the Principle of Least Privilege.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Data Protection</h4>
      <p class="mb-2">Enforce TLS for all client connections and use InnoDB tablespace encryption with keyrings for data-at-rest compliance.</p>
    `,
    codeTitle: "Active Product Catalog Pricing Summary",
    code: `SELECT 
    category,
    COUNT(*) AS active_products,
    ROUND(MIN(base_price), 2) AS min_price,
    ROUND(MAX(base_price), 2) AS max_price
FROM products
WHERE is_active = 1
GROUP BY category;`,
    pitfalls: "Never concatenate raw user strings into SQL queries. Always use parameterized Prepared Statements to prevent SQL Injection.",
    quiz: {
      question: "What is the single most effective defense against SQL Injection?",
      options: ["Regex input validation", "Parameterized Prepared Statements", "WAF firewalls", "MD5 hashing"],
      answer: 1,
      explanation: "Prepared statements separate SQL syntax from untrusted data parameters at the engine level."
    }
  },
  21: {
    month: 6,
    title: "Week 21: Capstone Project 1 - Multi-Tenant E-Commerce Analytics",
    time: "35 min read",
    overview: "Finalize and benchmark your 5M+ record e-commerce analytics engine, verify 100x covering index gains, and deploy automated rollups.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Architecture Blueprint</h4>
      <p class="mb-3">Combines 3NF normalized orders with native MySQL 8 JSON telemetry logs, indexed via generated virtual columns.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Milestone Verification</h4>
      <p class="mb-2">Validate that covering indexes reduce query execution time from 1,850ms to 18ms on multi-million row datasets.</p>
    `,
    codeTitle: "Customer Cohort Activity Aggregation",
    code: `SELECT 
    substr(order_date, 1, 7) AS cohort_month,
    COUNT(DISTINCT customer_id) AS active_cohort_buyers,
    ROUND(SUM(total_amount), 2) AS monthly_revenue
FROM orders
WHERE status = 'COMPLETED'
GROUP BY substr(order_date, 1, 7)
ORDER BY cohort_month ASC
LIMIT 12;`,
    pitfalls: "Do not run raw table scans for analytics dashboard KPIs; deploy MySQL Event Schedulers to maintain pre-aggregated summary rollups.",
    quiz: {
      question: "How do Materialized Rollups improve analytics dashboard performance?",
      options: ["They compress disk space", "They pre-compute aggregates so queries hit thousands of rows instead of millions", "They disable transactions", "They replace primary keys"],
      answer: 1,
      explanation: "Rollup tables pre-aggregate metrics into small summary tables, providing sub-5ms queries."
    }
  },
  22: {
    month: 6,
    title: "Week 22: Capstone Project 2 - ACID Financial Ledger & Fraud Suite",
    time: "35 min read",
    overview: "Deploy safe money transfer stored procedures with canonical lock ordering, test 100% deadlock immunity, and run AML fraud detection.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Zero-Deadlock Mathematical Guarantee</h4>
      <p class="mb-3">By locking resources strictly in order of <code>LEAST(from_id, to_id)</code> followed by <code>GREATEST(from_id, to_id)</code>, wait cycles are eliminated.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Sliding-Window AML Detection</h4>
      <p class="mb-2">Window functions detect velocity bursts (> 4 transactions within 1 hour) and smurfing attempts ($9,000-$9,999) across 1M+ transactions.</p>
    `,
    codeTitle: "Simulating Atomic Money Transfer Check",
    code: `SELECT 
    account_id,
    customer_id,
    current_balance,
    CASE WHEN current_balance >= 250.00 THEN 'SUFFICIENT_FUNDS' ELSE 'INSUFFICIENT_FUNDS' END AS transfer_eligibility
FROM accounts
WHERE account_id IN (1, 2);`,
    pitfalls: "Never trust application code to enforce non-negative balances; always enforce CHECK (current_balance >= 0.00) in the InnoDB engine.",
    quiz: {
      question: "How does canonical lock ordering prevent deadlocks between Account A and Account B?",
      options: ["It locks all accounts simultaneously", "It ensures every transaction acquires locks in identical numerical order", "It turns off row locking", "It converts InnoDB to MyISAM"],
      answer: 1,
      explanation: "Enforcing identical lock acquisition order eliminates cycles in the wait-for graph."
    }
  },
  23: {
    month: 6,
    title: "Week 23: Capstone Project 3 - Cloud HA & ProxySQL Load Testing",
    time: "35 min read",
    overview: "Run multi-threaded latency profilers comparing direct connections vs connection pooling and measure QPS and p95/p99 metrics.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. Connection Multiplexing</h4>
      <p class="mb-3">Eliminates memory overhead by sharing backend database connections across thousands of concurrent client threads.</p>
      <h4 class="text-base font-bold text-white mb-2">2. Measuring p99 Latency</h4>
      <p class="mb-2">Average latency hides tail spikes. Senior database engineers always optimize for p95 and p99 percentile response times.</p>
    `,
    codeTitle: "Simulated Mixed Workload Point Lookup",
    code: `SELECT order_id, customer_id, order_date, status, total_amount
FROM orders
WHERE order_id = 42;`,
    pitfalls: "Testing database performance with a single thread does not expose lock contention or thread cache bottlenecks; always benchmark with multi-threaded suites.",
    quiz: {
      question: "Why is p99 latency more important than average latency in production systems?",
      options: ["p99 is easier to calculate", "p99 reveals tail latency spikes experienced by worst-case requests", "p99 is always smaller", "p99 ignores database locks"],
      answer: 1,
      explanation: "p99 measures the slowest 1% of queries, exposing lock waits, page split stalls, and I/O bottlenecks."
    }
  },
  24: {
    month: 6,
    title: "Week 24: Portfolio Showcase, Resume Bullets & Staff Interview Prep",
    time: "35 min read",
    overview: "Package your 3 capstones on GitHub, craft Google XYZ formula resume bullets, and drill all 50 technical interview questions.",
    theory: `
      <h4 class="text-base font-bold text-white mb-2">1. The Google XYZ Resume Formula</h4>
      <p class="mb-3">"Accomplished [X] as measured by [Y] by doing [Z]". Example: Slashed p99 query latency by 118x (from 1,420ms to 12ms) across 5M+ rows by designing covering composite indexes.</p>
      <h4 class="text-base font-bold text-white mb-2">2. GitHub Repository Presentation</h4>
      <p class="mb-2">Include visual architecture diagrams, before/after benchmark comparison tables, and 1-click reproducibility instructions.</p>
    `,
    codeTitle: "Portfolio Milestone Grand Total Query",
    code: `SELECT 
    'All Systems Operational' AS status,
    24 AS completed_weeks,
    3 AS capstone_projects,
    'Ready for Staff DBA / Backend Roles' AS career_readiness;`,
    pitfalls: "Never list vague responsibilities on your resume. Always quantify business impact and technical metrics (e.g. TPS, ms latency, row counts).",
    quiz: {
      question: "Which of these resume bullets demonstrates highest technical impact?",
      options: [
        "Responsible for writing MySQL queries for the analytics team.",
        "Engineered covering composite indexes across 5M+ records, slashing p99 latency by 118x (from 1,420ms to 12ms).",
        "Helped optimize database performance.",
        "Worked with MySQL 8.0 databases."
      ],
      answer: 1,
      explanation: "Option B follows the Google XYZ formula with concrete scale (5M+), metrics (118x / 12ms), and technical mechanism."
    }
  }
};

// ------------------------------------------------------------------------
// 3. Hands-On Labs Data
// ------------------------------------------------------------------------
const LABS = [
  {
    id: "lab1",
    title: "Lab 01: Window Functions & Recursive CTEs",
    badge: "Analytics",
    summary: "Production-grade analytical SQL patterns covering DENSE_RANK, LAG, NTILE quartiles, and moving averages.",
    sql: `-- Lab 1 Query: 7-Day Centered Moving Sales Average
SELECT 
    order_date,
    ROUND(total_amount, 2) AS order_total,
    ROUND(AVG(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING
    ), 2) AS moving_avg_window
FROM orders
LIMIT 20;`
  },
  {
    id: "lab2",
    title: "Lab 02: Covering Index & EXPLAIN Optimization",
    badge: "100x Speedup",
    summary: "Demonstrates eliminating clustered index bookmark lookups, reducing query cost from 14,200 to 12.4.",
    sql: `-- Lab 2 Query: Customer Order Status Lookup
SELECT order_id, customer_id, order_date, status, total_amount
FROM orders
WHERE customer_id = 15
ORDER BY order_date DESC;`
  },
  {
    id: "lab3",
    title: "Lab 03: Concurrency, Deadlocks & Canonical Ordering",
    badge: "ACID Concurrency",
    summary: "Reproduction of MySQL Error 1213 deadlocks and mathematical prevention using LEAST/GREATEST lock ordering.",
    sql: `-- Lab 3 Demonstration: Canonical Lock Sequence
SELECT account_id, current_balance, 'LOCKED' as lock_status
FROM accounts 
WHERE account_id IN (LEAST(10, 50), GREATEST(10, 50))
ORDER BY account_id ASC;`
  },
  {
    id: "lab4",
    title: "Lab 04: Big Data Table Partitioning & Pruning",
    badge: "10M+ Scale",
    summary: "RANGE & HASH partitioning mechanics and instant sub-10ms historical data purging via DROP PARTITION.",
    sql: `-- Lab 4 Demonstration: Querying Target Time Ranges
SELECT 
    substr(order_date, 1, 4) as order_year,
    COUNT(*) as orders_count,
    ROUND(SUM(total_amount), 2) as annual_revenue
FROM orders
GROUP BY substr(order_date, 1, 4)
ORDER BY order_year;`
  }
];

// ------------------------------------------------------------------------
// 4. 50 Pro Interview Flashcards Sample
// ------------------------------------------------------------------------
const FLASHCARDS = [
  {
    category: "internals",
    categoryLabel: "InnoDB Internals",
    q: "What is the Doublewrite Buffer in InnoDB and why does it exist?",
    a: "Operating systems write data in 4KB chunks, while InnoDB pages are 16KB. If a crash occurs during a write, a 'torn page' results. The Doublewrite Buffer writes the 16KB page contiguously to a reserved area of disk first before writing to the actual .ibd file, allowing flawless crash recovery if a torn page occurs."
  },
  {
    category: "internals",
    categoryLabel: "InnoDB Internals",
    q: "What is the physical sequence of events during a COMMIT in MySQL?",
    a: "1. Redo log buffer is flushed and synced to disk (satisfying Durability). 2. Binary log is synced using 2PC. 3. Undo log is marked as inactive (available for purge). 4. Memory buffer pool page is marked dirty and written to disk asynchronously later."
  },
  {
    category: "indexing",
    categoryLabel: "Indexing & Cost",
    q: "Why does a 'Covering Index' provide a 10x-100x performance leap?",
    a: "A covering index satisfies all columns in SELECT, WHERE, and ORDER BY directly from the secondary index B+ Tree leaf pages in memory. It skips the expensive secondary-to-clustered bookmark lookup (which otherwise causes random disk I/O)."
  },
  {
    category: "indexing",
    categoryLabel: "Indexing & Cost",
    q: "Explain the Leftmost Prefix Rule and how MySQL 8 Index Skip Scan modifies it.",
    a: "For index (A, B), queries on B alone normally cannot use the index. MySQL 8 Index Skip Scan allows the optimizer to skip A if A has very low cardinality (e.g. status or gender), executing sub-scans for each distinct value of A."
  },
  {
    category: "concurrency",
    categoryLabel: "MVCC & Locking",
    q: "How does InnoDB prevent Phantom Reads in Repeatable Read isolation?",
    a: "Through Next-Key Locking (the combination of a Record Lock on index entries and a Gap Lock on the space before each entry). This blocks concurrent INSERT statements from inserting rows into the locked gap."
  },
  {
    category: "concurrency",
    categoryLabel: "MVCC & Locking",
    q: "What is the canonical solution to eliminate database deadlocks?",
    a: "Deterministic Canonical Lock Ordering (Dijkstra's Resource Hierarchy). Ensure every transaction locks resources in the exact same global order (e.g., LEAST(acc1, acc2) then GREATEST(acc1, acc2)). Cycles in the lock wait graph become mathematically impossible."
  },
  {
    category: "scaling",
    categoryLabel: "Scaling & HA",
    q: "What is the core architectural restriction on MySQL Partition Keys?",
    a: "Every unique key on the table (including the PRIMARY KEY) MUST include every column used in the partitioning expression. You cannot partition by (order_date) if your primary key is solely (order_id)."
  },
  {
    category: "scaling",
    categoryLabel: "Scaling & HA",
    q: "How does ProxySQL perform intelligent read/write query splitting?",
    a: "ProxySQL evaluates SQL statements against regex rules. Statements starting with '^SELECT.*FOR UPDATE' and writes (INSERT, UPDATE) route to Hostgroup 10 (Master), while regular '^SELECT' routes to Hostgroup 20 (Read Replicas)."
  }
];

// ------------------------------------------------------------------------
// 5. In-Memory Database Initialization (SQL.js)
// ------------------------------------------------------------------------
async function initDatabase() {
  const statusBadge = document.getElementById('db-status-badge');
  try {
    statusBadge.innerText = "Loading WASM...";
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    
    db = new SQL.Database();
    statusBadge.innerText = "Seeding Tables...";

    db.run(`
      CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        country TEXT,
        city TEXT,
        tier TEXT,
        created_at TEXT
      );

      CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        sku TEXT UNIQUE,
        name TEXT,
        category TEXT,
        base_price REAL,
        cost_price REAL,
        stock_quantity INTEGER
      );

      CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        status TEXT,
        payment_method TEXT,
        total_amount REAL
      );

      CREATE TABLE order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        unit_price REAL,
        subtotal REAL
      );

      CREATE TABLE accounts (
        account_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        current_balance REAL,
        status TEXT
      );

      CREATE TABLE github_commits (
        commit_sha TEXT PRIMARY KEY,
        parent_sha TEXT,
        author_name TEXT,
        commit_date TEXT,
        message TEXT
      );

      CREATE TABLE so_posts (
        post_id INTEGER PRIMARY KEY,
        post_type_id INTEGER,
        parent_id INTEGER,
        score INTEGER,
        title TEXT,
        tags TEXT
      );

      CREATE TABLE blockchain_transactions (
        tx_id INTEGER PRIMARY KEY,
        tx_hash TEXT,
        from_address TEXT,
        to_address TEXT,
        amount_satoshis INTEGER,
        fee_satoshis INTEGER
      );

      CREATE TABLE fineweb_pretrain_docs (
        doc_id INTEGER PRIMARY KEY,
        source_corpus TEXT,
        token_count INTEGER,
        educational_score REAL,
        toxicity_score REAL
      );
    `);

    const countries = ["USA", "GBR", "DEU", "CAN", "FRA", "IND", "AUS", "SGP"];
    const tiers = ["STANDARD", "SILVER", "GOLD", "PLATINUM"];
    for (let i = 1; i <= 50; i++) {
      const c = countries[i % countries.length];
      const t = tiers[i % tiers.length];
      db.run(`INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [
        i, `user.${i}@example.com`, `FirstName${i}`, `LastName${i}`, c, "Metro City", t, `2023-0${(i % 9) + 1}-15`
      ]);
    }

    const categories = ["Electronics", "Fitness", "Home & Kitchen", "Books", "Fashion"];
    for (let i = 1; i <= 25; i++) {
      const cat = categories[i % categories.length];
      const cost = (15 + (i * 7.5)).toFixed(2);
      const price = (cost * 1.5).toFixed(2);
      db.run(`INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?);`, [
        i, `SKU-${cat.substring(0,3).toUpperCase()}-${i}`, `Enterprise ${cat} Model ${i}`, cat, price, cost, 100 + i
      ]);
    }

    let itemId = 1;
    for (let ordId = 1; ordId <= 150; ordId++) {
      const custId = (ordId % 50) + 1;
      const m = (ordId % 12) + 1;
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const ordDate = `2023-${monthStr}-10 14:30:00`;
      const numItems = (ordId % 3) + 1;
      let total = 0;

      for (let k = 0; k < numItems; k++) {
        const prodId = ((ordId + k) % 25) + 1;
        const qty = (k % 2) + 1;
        const unitPrice = 45.00 + (prodId * 2);
        const sub = qty * unitPrice;
        total += sub;

        db.run(`INSERT INTO order_items VALUES (?, ?, ?, ?, ?, ?);`, [
          itemId++, ordId, prodId, qty, unitPrice, sub
        ]);
      }

      db.run(`INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?);`, [
        ordId, custId, ordDate, 'COMPLETED', 'CREDIT_CARD', total.toFixed(2)
      ]);
    }

    for (let accId = 1; accId <= 50; accId++) {
      db.run(`INSERT INTO accounts VALUES (?, ?, ?, ?);`, [
        accId, accId, (1500.00 + (accId * 125)).toFixed(2), 'ACTIVE'
      ]);
    }

    // Seed Google Cloud GitHub Commits (DAG with parent_sha)
    db.run(`INSERT INTO github_commits VALUES 
      ('a1b2c3d4', NULL, 'Linus Torvalds', '2023-01-01 10:00:00', 'Initial kernel tree import'),
      ('b2c3d4e5', 'a1b2c3d4', 'Kernel Dev', '2023-01-03 14:20:00', 'Optimize memory page allocation'),
      ('c3d4e5f6', 'b2c3d4e5', 'Lead Architect', '2023-01-05 18:45:00', 'Implement B+ Tree concurrency latching'),
      ('d4e5f6a1', 'c3d4e5f6', 'Security Eng', '2023-01-08 09:15:00', 'Hardening buffer overflow protections');
    `);

    // Seed Google Cloud Stack Overflow Posts
    db.run(`INSERT INTO so_posts VALUES 
      (101, 1, NULL, 154, 'Why is my MySQL index skipped on leading wildcard LIKE?', '<mysql><indexing><performance>'),
      (102, 2, 101, 210, 'Leading wildcards invalidate B+Tree range search order.', '<mysql><indexing>'),
      (103, 1, NULL, 95, 'How to eliminate deadlocks in high concurrency transactions?', '<mysql><innodb><deadlock>'),
      (104, 2, 103, 140, 'Use canonical lock ordering via LEAST and GREATEST.', '<mysql><innodb><deadlock>');
    `);

    // Seed Google Cloud Crypto Blockchain Transactions
    db.run(`INSERT INTO blockchain_transactions VALUES 
      (1, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', 5000000000, 10000),
      (2, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce270', '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', '1HLoD9E4SDFFPDiYfNYnkBLQNx5LgR5bF2', 2500000000, 15000),
      (3, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce271', '1HLoD9E4SDFFPDiYfNYnkBLQNx5LgR5bF2', '1FzWLkAahHBCxgLKGq7KeU959JyWHZviK5', 1200000000, 12000);
    `);

    // Seed Hugging Face FineWeb LLM Pretraining Documents
    db.run(`INSERT INTO fineweb_pretrain_docs VALUES 
      (1, 'FineWeb', 4820, 0.942, 0.001),
      (2, 'FineWeb', 2150, 0.885, 0.004),
      (3, 'RedPajama', 9400, 0.915, 0.002),
      (4, 'FineWeb', 1240, 0.620, 0.085);
    `);

    statusBadge.innerText = "Active (9 Tables Loaded)";
    renderSchemaExplorer();
  } catch (err) {
    statusBadge.innerText = "WASM Load Error";
    console.error("Database initialization failed:", err);
  }
}

let currentScaleMode = 'sample';

function setScaleMode(mode) {
  currentScaleMode = mode;
  const sampleBtn = document.getElementById('scale-btn-sample');
  const cloudBtn = document.getElementById('scale-btn-cloud');

  if (mode === 'cloud') {
    cloudBtn.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-600 text-white transition-all";
    sampleBtn.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white transition-all";
  } else {
    sampleBtn.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-600 text-white transition-all";
    cloudBtn.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white transition-all";
  }
  renderSchemaExplorer();
}

function openCloudDockerModal() {
  document.getElementById('cloud-docker-modal').classList.remove('hidden');
}

function closeCloudDockerModal() {
  document.getElementById('cloud-docker-modal').classList.add('hidden');
}

function openCapacityModal() {
  document.getElementById('capacity-modal').classList.remove('hidden');
}

function closeCapacityModal() {
  document.getElementById('capacity-modal').classList.add('hidden');
}

function runCapacityQueryInPlayground() {
  closeCapacityModal();
  switchTab('playground');
  const capacitySQL = `-- Database Raw Storage Capacity & Million-Row Breakdown
SELECT 
    'orders' AS table_name, 1000000 AS approx_rows, 142.1 AS data_mb, 68.3 AS index_mb, 210.4 AS total_mb
UNION ALL
SELECT 'order_items', 2500000, 295.0, 135.2, 430.2
UNION ALL
SELECT 'user_events', 1000000, 125.3, 70.2, 195.5
UNION ALL
SELECT 'financial_transactions', 1000000, 130.0, 65.0, 195.0
UNION ALL
SELECT 'customers', 100000, 12.0, 6.2, 18.2
UNION ALL
SELECT 'products', 10000, 1.7, 1.1, 2.8
ORDER BY total_mb DESC;`;
  document.getElementById('sql-editor').value = capacitySQL;
  executeSQLQuery();
}

// ------------------------------------------------------------------------
// 6. Schema Tree & Quick Sample Buttons
// ------------------------------------------------------------------------
function renderSchemaExplorer() {
  const treeContainer = document.getElementById('schema-tree');
  if (!db) return;

  const sampleTables = [
    { name: "github_commits (Google Cloud)", count: "4 rows", size: "8 KB", cols: ["commit_sha (PK)", "parent_sha", "author_name", "message"] },
    { name: "so_posts (Google Cloud)", count: "4 rows", size: "8 KB", cols: ["post_id (PK)", "post_type_id", "score", "tags"] },
    { name: "blockchain_transactions (Crypto)", count: "3 rows", size: "8 KB", cols: ["tx_id (PK)", "tx_hash", "from_addr", "amount_satoshis"] },
    { name: "fineweb_pretrain_docs (AI)", count: "4 rows", size: "8 KB", cols: ["doc_id (PK)", "source_corpus", "token_count", "educational_score"] },
    { name: "orders", count: "150 rows", size: "32 KB", cols: ["order_id (PK)", "customer_id", "order_date", "total_amount"] },
    { name: "order_items", count: "250 rows", size: "48 KB", cols: ["item_id (PK)", "order_id", "product_id", "subtotal"] },
    { name: "customers", count: "50 rows", size: "12 KB", cols: ["customer_id (PK)", "email", "country", "tier"] },
    { name: "products", count: "25 rows", size: "8 KB", cols: ["product_id (PK)", "sku", "category", "base_price"] },
    { name: "accounts", count: "50 rows", size: "10 KB", cols: ["account_id (PK)", "customer_id", "current_balance"] }
  ];

  const cloudTables = [
    { name: "nyc_yellow_taxi_trips (AWS)", count: "1,500,000,000 rows", size: "520.4 GB", cols: ["trip_id (PK)", "pickup_dt", "dropoff_dt", "total_amt"] },
    { name: "amazon_product_reviews (AWS)", count: "130,000,000 rows", size: "148.2 GB", cols: ["review_id (PK)", "product_id", "body (FTS)", "star_rating"] },
    { name: "common_crawl_warc (AWS)", count: "Petabytes", size: "4.8 PB", cols: ["warc_id (PK)", "domain", "tld", "http_status", "crawl_dt"] },
    { name: "github_commits (Google Cloud)", count: "10,000,000+ rows", size: "2.4 TB", cols: ["commit_sha (PK)", "parent_sha", "repo_id", "author_email"] },
    { name: "so_posts (Google Cloud)", count: "50,000,000 rows", size: "185.0 GB", cols: ["post_id (PK)", "parent_id", "score", "tags (FTS)"] },
    { name: "blockchain_transactions (Google)", count: "900,000,000 rows", size: "1.2 TB", cols: ["tx_hash (PK)", "from_addr", "to_addr", "satoshis"] },
    { name: "fineweb_pretrain_docs (Hugging Face)", count: "15 Trillion Tokens", size: "44.0 TB", cols: ["doc_id (PK)", "token_cnt", "edu_score", "toxicity"] },
    { name: "order_items", count: "2,500,000 rows", size: "430.2 MB", cols: ["item_id (PK)", "order_id (FK)", "product_id (FK)", "subtotal"] },
    { name: "orders", count: "1,000,000 rows", size: "210.4 MB", cols: ["order_id (PK)", "customer_id (FK)", "order_date", "total_amount"] }
  ];

  const tables = currentScaleMode === 'cloud' ? cloudTables : sampleTables;

  treeContainer.innerHTML = tables.map(t => `
    <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-200">
        <span class="flex items-center"><i class="fa-solid fa-table text-cyan-400 mr-1.5"></i>${t.name}</span>
        <div class="flex items-center space-x-1">
          <span class="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">${t.count}</span>
          <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">${t.size}</span>
        </div>
      </div>
      <div class="text-[11px] text-slate-400 font-mono truncate">
        ${t.cols.join(", ")}
      </div>
    </div>
  `).join("");

  const buttonsContainer = document.getElementById('sample-query-buttons');
  buttonsContainer.innerHTML = [
    { label: "Git Commits Recursive CTE (DAG)", sql: "WITH RECURSIVE git_history AS (\n  SELECT commit_sha, parent_sha, author_name, message, 1 as depth FROM github_commits WHERE commit_sha = 'c3d4e5f6'\n  UNION ALL\n  SELECT c.commit_sha, c.parent_sha, c.author_name, c.message, gh.depth + 1 FROM github_commits c JOIN git_history gh ON c.commit_sha = gh.parent_sha WHERE gh.depth < 5\n)\nSELECT depth, commit_sha, author_name, message FROM git_history;" },
    { label: "Stack Overflow Tag Co-Occurrence", sql: "SELECT p1.tags AS tag_a, p2.tags AS tag_b, COUNT(*) AS shared_questions FROM so_posts p1 JOIN so_posts p2 ON p1.post_id = p2.post_id AND p1.tags < p2.tags GROUP BY p1.tags, p2.tags ORDER BY shared_questions DESC;" },
    { label: "Bitcoin UTXO Double-Entry Ledger", sql: "SELECT from_address, SUM(amount_satoshis) AS total_sent, COUNT(tx_id) AS total_tx FROM blockchain_transactions GROUP BY from_address ORDER BY total_sent DESC;" },
    { label: "FineWeb LLM Pretrain Quality Filter", sql: "SELECT doc_id, source_corpus, token_count, educational_score FROM fineweb_pretrain_docs WHERE educational_score >= 0.850 AND toxicity_score <= 0.010 ORDER BY educational_score DESC;" },
    { label: "NYC Taxi Monthly Revenue & Growth", sql: "WITH monthly AS (SELECT substr(order_date, 1, 7) as mth, ROUND(SUM(total_amount), 2) as rev FROM orders GROUP BY substr(order_date, 1, 7)) SELECT mth, rev, LAG(rev, 1) OVER (ORDER BY mth) as prev_rev FROM monthly;" },
    { label: "List All Tables (System Master)", sql: "SELECT name AS table_name, type FROM sqlite_master WHERE type='table' ORDER BY name;" }
  ].map((sq, idx) => `
    <button onclick="loadSampleQueryText(\`${sq.sql.replace(/`/g, '\\`')}\`)" class="text-left px-2.5 py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 hover:text-cyan-400 text-xs text-slate-300 transition-colors truncate">
      <i class="fa-solid fa-angle-right text-cyan-500 mr-1.5 text-[10px]"></i>${sq.label}
    </button>
  `).join("");
}

function loadSampleQueryText(sql) {
  document.getElementById('sql-editor').value = sql;
  executeSQLQuery();
}

function clearEditor() {
  document.getElementById('sql-editor').value = "";
}

// ------------------------------------------------------------------------
// 7. Query Execution & Table Rendering
// ------------------------------------------------------------------------
function executeSQLQuery() {
  const editor = document.getElementById('sql-editor');
  const alertBox = document.getElementById('query-alert');
  const statsBox = document.getElementById('query-stats');
  const resultContainer = document.getElementById('result-table-container');

  const query = editor.value.trim();
  if (!query) return;

  alertBox.classList.add('hidden');
  
  if (!db) {
    alertBox.className = "p-3 rounded-lg text-xs font-mono bg-red-950/80 border border-red-800 text-red-300 block";
    alertBox.innerText = "Error: Database engine is still initializing. Please wait a second.";
    return;
  }

  const startTime = performance.now();
  try {
    const results = db.exec(query);
    const duration = (performance.now() - startTime).toFixed(2);

    if (results.length === 0) {
      statsBox.innerText = `0 rows affected (${duration} ms)`;
      resultContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-sm">
          <i class="fa-solid fa-circle-check text-emerald-400 text-xl mb-2"></i>
          <div>Statement executed successfully. No tabular output returned.</div>
        </div>
      `;
      return;
    }

    const { columns, values } = results[0];
    statsBox.innerText = `${values.length} rows returned (${duration} ms)`;

    let tableHTML = `
      <table class="w-full text-left text-xs font-mono border-collapse">
        <thead>
          <tr class="bg-slate-800 text-cyan-400 border-b border-slate-700">
            ${columns.map(c => `<th class="p-2.5 font-semibold">${c}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
    `;

    tableHTML += values.map((row, rIdx) => `
      <tr class="${rIdx % 2 === 0 ? 'bg-slate-950/60' : 'bg-slate-900/60'} hover:bg-slate-800/50">
        ${row.map(val => `<td class="p-2.5 text-slate-200">${val !== null ? val : '<span class="text-slate-600">NULL</span>'}</td>`).join("")}
      </tr>
    `).join("");

    tableHTML += `</tbody></table>`;
    resultContainer.innerHTML = tableHTML;

  } catch (err) {
    statsBox.innerText = "Execution failed";
    alertBox.className = "p-3 rounded-lg text-xs font-mono bg-red-950/80 border border-red-800 text-red-300 block";
    alertBox.innerText = `SQL Error: ${err.message}`;
  }
}

// ------------------------------------------------------------------------
// 8. Curriculum Tracker & Lesson Modal Reader
// ------------------------------------------------------------------------
function renderCurriculum() {
  const container = document.getElementById('curriculum-container');
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');

  container.innerHTML = CURRICULUM.map(m => `
    <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md">
      <div class="bg-slate-800/70 p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Month ${m.month}</span>
          <h3 class="text-base font-bold text-white mt-0.5">${m.title}</h3>
        </div>
        <span class="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono">4 Weeks</span>
      </div>
      <div class="p-4 space-y-3">
        <p class="text-xs text-slate-400">${m.focus}</p>
        <div class="space-y-3 pt-2">
          ${m.weeks.map(w => {
            const isDone = !!savedProgress[`w_${w.week}`];
            return `
              <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/50 transition-all space-y-2.5">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-2.5 cursor-pointer" onclick="openLessonModal(${w.week})">
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Week ${w.week}</span>
                    <span class="text-xs font-bold text-white hover:text-cyan-400 transition-colors ${isDone ? 'line-through text-slate-500' : ''}">
                      ${w.title}
                    </span>
                  </div>
                  <input type="checkbox" id="w_${w.week}" ${isDone ? 'checked' : ''} onchange="toggleWeekProgress(${w.week})" 
                    class="h-4 w-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 cursor-pointer" title="Toggle Completion">
                </div>
                <p class="text-[11px] text-slate-400 leading-relaxed cursor-pointer" onclick="openLessonModal(${w.week})">
                  ${w.desc}
                </p>
                <div class="pt-1 flex items-center justify-between border-t border-slate-900">
                  <button onclick="openLessonModal(${w.week})" class="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold border border-cyan-500/30 transition-all flex items-center shadow-sm">
                    <i class="fa-solid fa-book-open mr-1.5"></i>Start Course Lesson
                  </button>
                  <span class="text-[10px] text-slate-500 font-mono">~25-30 min</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `).join("");

  updateProgressStats();
}

function toggleWeekProgress(weekNum) {
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');
  savedProgress[`w_${weekNum}`] = !savedProgress[`w_${weekNum}`];
  localStorage.setItem('mysql_pro_progress', JSON.stringify(savedProgress));
  renderCurriculum();
  updateModalCompleteBtnState();
}

function updateProgressStats() {
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');
  const completed = Object.values(savedProgress).filter(Boolean).length;
  const pct = Math.round((completed / 24) * 100);

  document.getElementById('header-progress').innerText = `${pct}%`;
  document.getElementById('tracker-status').innerText = `${completed} / 24 Weeks Completed (${pct}%)`;
  document.getElementById('tracker-bar').style.width = `${pct}%`;
}

// ------------------------------------------------------------------------
// 9. Lesson Course Player Modal Controls
// ------------------------------------------------------------------------
function openLessonModal(weekNum) {
  activeModalWeek = weekNum;
  const lesson = LESSON_DETAILS[weekNum];
  if (!lesson) return;

  const modal = document.getElementById('lesson-modal');
  document.getElementById('modal-month-badge').innerText = `Month ${lesson.month} • Week ${weekNum}`;
  document.getElementById('modal-lesson-title').innerText = lesson.title;

  const body = document.getElementById('modal-lesson-body');
  body.innerHTML = `
    <!-- Lesson Header Card -->
    <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
      <div class="flex items-center space-x-2 text-xs text-cyan-400 font-semibold">
        <i class="fa-solid fa-clock"></i>
        <span>Estimated Time: ${lesson.time}</span>
      </div>
      <p class="text-sm text-slate-200 leading-relaxed font-sans">${lesson.overview}</p>
    </div>

    <!-- Core Theory Section -->
    <div class="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
      <h3 class="text-base font-bold text-white flex items-center">
        <i class="fa-solid fa-graduation-cap text-cyan-400 mr-2"></i>Core Theory & Architecture Breakdown
      </h3>
      <div class="text-xs text-slate-300 leading-relaxed space-y-3">
        ${lesson.theory}
      </div>
    </div>

    <!-- Executable Practical Code Block -->
    <div class="space-y-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      <div class="bg-slate-800/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <span class="text-xs font-bold text-cyan-300 flex items-center">
          <i class="fa-solid fa-terminal mr-2"></i>${lesson.codeTitle}
        </span>
        <button onclick="runLessonCodeInPlayground(${weekNum})" class="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center shadow-md">
          <i class="fa-solid fa-play mr-1.5"></i>Run in SQL Playground
        </button>
      </div>
      <pre class="p-4 font-mono text-xs text-cyan-200 overflow-x-auto"><code>${lesson.code}</code></pre>
    </div>

    <!-- Common Pitfalls & Pro Advice -->
    <div class="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs space-y-1">
      <div class="font-bold flex items-center"><i class="fa-solid fa-triangle-exclamation text-amber-400 mr-2"></i>Senior DBA Pitfalls & Pro Insights</div>
      <div class="leading-relaxed text-slate-300">${lesson.pitfalls}</div>
    </div>

    <!-- Interactive Knowledge Check Quiz -->
    <div class="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
      <h4 class="text-xs font-bold text-white uppercase tracking-wider flex items-center">
        <i class="fa-solid fa-circle-question text-cyan-400 mr-2"></i>Knowledge Check Quiz
      </h4>
      <p class="text-xs text-slate-200 font-semibold">${lesson.quiz.question}</p>
      <div class="space-y-2 pt-1" id="quiz-options-container">
        ${lesson.quiz.options.map((opt, oIdx) => `
          <button onclick="answerLessonQuiz(${weekNum}, ${oIdx})" id="quiz-opt-${oIdx}" 
            class="w-full text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500 hover:text-white transition-all flex items-center justify-between">
            <span>${opt}</span>
            <span class="text-[10px] text-slate-500 font-mono">Option ${oIdx + 1}</span>
          </button>
        `).join("")}
      </div>
      <div id="quiz-feedback" class="hidden p-3 rounded-lg text-xs font-mono"></div>
    </div>
  `;

  // Update navigation buttons
  document.getElementById('modal-prev-btn').disabled = (weekNum === 1);
  document.getElementById('modal-prev-btn').style.opacity = (weekNum === 1) ? "0.4" : "1.0";
  document.getElementById('modal-next-btn').disabled = (weekNum === 24);
  document.getElementById('modal-next-btn').style.opacity = (weekNum === 24) ? "0.4" : "1.0";

  updateModalCompleteBtnState();
  modal.classList.remove('hidden');
}

function closeLessonModal() {
  document.getElementById('lesson-modal').classList.add('hidden');
}

function prevLesson() {
  if (activeModalWeek > 1) {
    openLessonModal(activeModalWeek - 1);
  }
}

function nextLesson() {
  if (activeModalWeek < 24) {
    openLessonModal(activeModalWeek + 1);
  }
}

function updateModalCompleteBtnState() {
  const savedProgress = JSON.parse(localStorage.getItem('mysql_pro_progress') || '{}');
  const isDone = !!savedProgress[`w_${activeModalWeek}`];
  const btn = document.getElementById('modal-complete-btn');

  if (isDone) {
    btn.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-white flex items-center";
    btn.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5"></i>Completed!`;
  } else {
    btn.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md bg-cyan-600 hover:bg-cyan-500 text-white flex items-center";
    btn.innerHTML = `<i class="fa-solid fa-check mr-1.5"></i>Mark Week Completed`;
  }
}

function toggleCurrentModalComplete() {
  toggleWeekProgress(activeModalWeek);
}

function answerLessonQuiz(weekNum, selectedIdx) {
  const lesson = LESSON_DETAILS[weekNum];
  if (!lesson) return;

  const feedback = document.getElementById('quiz-feedback');
  const isCorrect = (selectedIdx === lesson.quiz.answer);

  lesson.quiz.options.forEach((_, idx) => {
    const optBtn = document.getElementById(`quiz-opt-${idx}`);
    if (idx === lesson.quiz.answer) {
      optBtn.className = "w-full text-left p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-xs text-emerald-200 transition-all flex items-center justify-between";
    } else if (idx === selectedIdx) {
      optBtn.className = "w-full text-left p-2.5 rounded-lg bg-red-950/80 border border-red-600 text-xs text-red-200 transition-all flex items-center justify-between";
    }
  });

  feedback.classList.remove('hidden');
  if (isCorrect) {
    feedback.className = "p-3 rounded-lg text-xs font-sans bg-emerald-950/60 border border-emerald-800 text-emerald-300 block";
    feedback.innerHTML = `<strong>Correct!</strong> ${lesson.quiz.explanation}`;
  } else {
    feedback.className = "p-3 rounded-lg text-xs font-sans bg-red-950/60 border border-red-800 text-red-300 block";
    feedback.innerHTML = `<strong>Not quite:</strong> ${lesson.quiz.explanation}`;
  }
}

function runLessonCodeInPlayground(weekNum) {
  const lesson = LESSON_DETAILS[weekNum];
  if (!lesson) return;

  document.getElementById('sql-editor').value = lesson.code;
  closeLessonModal();
  switchTab('playground');
  executeSQLQuery();
}

// ------------------------------------------------------------------------
// 10. Hands-On Labs Renderer
// ------------------------------------------------------------------------
let activeLabId = "lab1";

function renderLabs() {
  const listContainer = document.getElementById('lab-list-buttons');
  listContainer.innerHTML = LABS.map(l => `
    <button onclick="selectLab('${l.id}')" class="w-full text-left p-3.5 rounded-xl border transition-all ${activeLabId === l.id ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">${l.badge}</span>
      </div>
      <div class="text-sm font-bold mt-1 text-slate-200">${l.title}</div>
      <div class="text-xs text-slate-400 mt-1 line-clamp-2">${l.summary}</div>
    </button>
  `).join("");

  const lab = LABS.find(l => l.id === activeLabId) || LABS[0];
  const detailContainer = document.getElementById('lab-detail-view');
  detailContainer.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">${lab.badge} Lab</span>
          <h3 class="text-xl font-bold text-white mt-1">${lab.title}</h3>
        </div>
        <button onclick="sendLabToPlayground('${lab.id}')" class="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md transition-all flex items-center">
          <i class="fa-solid fa-play mr-1.5"></i>Run in SQL Playground
        </button>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">${lab.summary}</p>
      <div class="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
        <pre>${lab.sql}</pre>
      </div>
    </div>
  `;
}

function selectLab(labId) {
  activeLabId = labId;
  renderLabs();
}

function sendLabToPlayground(labId) {
  const lab = LABS.find(l => l.id === labId);
  if (!lab) return;
  document.getElementById('sql-editor').value = lab.sql;
  switchTab('playground');
  executeSQLQuery();
}

// ------------------------------------------------------------------------
// 11. Portfolio Capstones & Resume Bullets
// ------------------------------------------------------------------------
const PORTFOLIO_PROJECTS = [
  {
    title: "Project 1: NYC TLC Urban Transit Analytics Engine",
    scale: "AWS Open Data: 3,000,000+ Real S3 Trips",
    highlight: "100x Speedup (1,850ms -> 12ms)",
    desc: "Ingested and partitioned 3M+ real NYC Taxi records from s3://nyc-tlc/. Engineered covering composite indexes on (pickup_datetime, total_amount), eliminating clustered index bookmark lookups with sub-50ms analytical rollups."
  },
  {
    title: "Project 2: Ultra-High-Throughput ACID Financial Ledger",
    scale: "1,000,000+ Concurrent Fare Settlements",
    highlight: "100% Deadlock-Free Guarantee",
    desc: "Implemented atomic stored procedures with canonical lock ordering (LEAST/GREATEST), eliminating Error 1213 deadlocks under 50 concurrent threads with sliding-window AML fraud detection."
  },
  {
    title: "Project 3: Cloud HA, ProxySQL & AWS Aurora S3 Pipeline",
    scale: "5,000 Client Connections Multiplexed",
    highlight: "Native S3 Ingestion + < 3s Failover",
    desc: "Engineered high-availability cloud database routing writes to master and load-balancing reads across GTID read replicas, paired with native AWS Aurora LOAD DATA FROM S3 pipelines."
  }
];

const RESUME_BULLETS = [
  "Engineered covering composite indexes across 5,000,000+ records, slashing p99 query latency by 118x (from 1,420ms to 12ms) and eliminating clustered index bookmark lookups.",
  "Designed a high-throughput double-entry financial ledger supporting 1,000,000+ transactions; eliminated Error 1213 deadlocks under 50 concurrent threads via deterministic canonical lock ordering.",
  "Implemented RANGE and HASH table partitioning on a 10M+ row dataset, leveraging Partition Pruning to eliminate unneeded I/O scans and enabling sub-10ms data purging without tablespace bloat.",
  "Architected high-availability cloud database with ProxySQL read/write query splitting, connection pooling 5,000 application client connections with 75% primary CPU offload."
];

function renderPortfolio() {
  const container = document.getElementById('portfolio-cards');
  container.innerHTML = PORTFOLIO_PROJECTS.map(p => `
    <div class="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
      <div class="space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">${p.scale}</span>
        <h4 class="text-base font-bold text-white">${p.title}</h4>
        <div class="text-xs font-semibold text-emerald-400 flex items-center">
          <i class="fa-solid fa-bolt mr-1.5"></i>${p.highlight}
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${p.desc}</p>
      </div>
    </div>
  `).join("");

  const bulletsContainer = document.getElementById('resume-bullets-list');
  bulletsContainer.innerHTML = RESUME_BULLETS.map(b => `
    <div class="flex items-start space-x-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
      <i class="fa-solid fa-circle-check text-cyan-400 mt-0.5 text-xs"></i>
      <span class="text-xs text-slate-200 leading-relaxed">${b}</span>
    </div>
  `).join("");
}

// ------------------------------------------------------------------------
// 12. Interview Flashcards
// ------------------------------------------------------------------------
let activeCategory = 'all';

function renderFlashcards() {
  const container = document.getElementById('flashcard-container');
  const filtered = activeCategory === 'all' ? FLASHCARDS : FLASHCARDS.filter(f => f.category === activeCategory);

  container.innerHTML = filtered.map((fc, idx) => `
    <div class="flashcard-card bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 cursor-pointer" onclick="toggleFlashcardAnswer(${idx})">
      <div class="flex justify-between items-center text-xs">
        <span class="font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">${fc.categoryLabel}</span>
        <span class="text-slate-500 font-mono text-[11px]">Click to flip</span>
      </div>
      <h4 class="text-sm font-bold text-white">${fc.q}</h4>
      <div id="fc-ans-${idx}" class="hidden pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
        ${fc.a}
      </div>
    </div>
  `).join("");
}

function toggleFlashcardAnswer(idx) {
  const ans = document.getElementById(`fc-ans-${idx}`);
  if (ans) {
    ans.classList.toggle('hidden');
  }
}

function filterFlashcards(cat) {
  activeCategory = cat;
  document.querySelectorAll('.fc-filter-btn').forEach(btn => btn.classList.remove('active', 'bg-cyan-600', 'text-white'));
  event.target.classList.add('active', 'bg-cyan-600', 'text-white');
  renderFlashcards();
}

// ------------------------------------------------------------------------
// 13. Tab Switcher
// ------------------------------------------------------------------------
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const activeContent = document.getElementById(`view-${tabId}`);
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (tabId === 'playground' && !document.getElementById('sql-editor').value) {
    loadSampleQueryText("SELECT * FROM customers LIMIT 10;");
  }
}

// ------------------------------------------------------------------------
// 14. Keyboard Shortcuts & Boot
// ------------------------------------------------------------------------
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (currentTab === 'playground') {
      executeSQLQuery();
    }
  }
  if (e.key === 'Escape') {
    closeLessonModal();
  }
});

// App Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  renderCurriculum();
  renderLabs();
  renderPortfolio();
  renderFlashcards();
});

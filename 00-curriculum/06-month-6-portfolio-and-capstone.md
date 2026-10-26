# Month 6: Capstone Portfolio Projects on Cloud Big Data (Weeks 21 - 24)

## Objective
Finalize, benchmark, and deploy 3 production-grade capstone portfolio projects powered by **Google Cloud Public Datasets** (GitHub & Blockchain), **AWS Open Data Registry** (NYC TLC Taxi & Common Crawl), and **Hugging Face Hub** (FineWeb 15T Tokens).

---

### Week 21: Capstone Project 1 — Developer Ecosystem Analytics Engine
- **Core Cloud Datasets**:
  - Google Cloud GitHub Public Archive (`bigquery-public-data.github_repos`)
  - Stack Overflow Public Dataset (`bigquery-public-data.stackoverflow`)
- **Key Technical Showcase**:
  - Recursive CTEs evaluating 10-level deep Git commit DAGs and repository fork trees.
  - Secondary composite B+Tree indexing on 40-character SHA-1 commit hashes achieving 100x speedup over sequential scans.
  - Market-basket tag co-occurrence matrix analytics identifying developer technology stacks.
- **Deliverables**: Tested SQL scripts, `EXPLAIN ANALYZE` execution profiles, and reproducible schema benchmark suite.

### Week 22: Capstone Project 2 — Institutional Blockchain Ledger & ACID Settlement
- **Core Cloud Dataset**:
  - Google Cloud Bitcoin & Ethereum Public Blockchain (`bigquery-public-data.crypto_bitcoin`)
- **Key Technical Showcase**:
  - Double-entry accounting system with strict UTXO (Unspent Transaction Output) balance verification.
  - Multi-threaded stress testing (50 concurrent worker threads executing high-frequency transfers).
  - Canonical Lock Ordering (`LEAST(from_addr, to_addr)`) mathematically eliminating deadlocks.
  - Real-time Anti-Money Laundering (AML) sliding-window fraud detection using analytic window functions.
- **Deliverables**: Threaded Python concurrency tester, atomic stored procedures, and deadlock analysis verification report.

### Week 23: Capstone Project 3 — Petabyte Web & LLM Pretraining Data Pipeline
- **Core Cloud Datasets**:
  - AWS Open Data NYC TLC Taxi & Common Crawl WARC (`s3://commoncrawl/`)
  - Hugging Face FineWeb (15 Trillion Tokens) & RedPajama Pretraining Metadata
- **Key Technical Showcase**:
  - High-throughput `LOAD DATA FROM S3` cloud ingestion pipeline.
  - Multi-terabyte temporal RANGE partitioning with sub-10ms `DROP PARTITION` automated data lifecycle pruning.
  - ProxySQL read/write query splitting, connection pooling, and automated failover.
  - Quality score filtering on millions of web documents prior to LLM tokenization.
- **Deliverables**: Docker Compose multi-node cluster, ProxySQL routing configuration, and automated benchmark runner.

### Week 24: Portfolio Launch, Resume Bullets & Technical Interview Mastery
- **Portfolio Publishing**:
  - Packaging repositories on GitHub with clean architectural READMEs, system topology diagrams, and benchmarking tables.
  - Publishing technical case studies on LinkedIn and personal engineering blogs.
- **Resume Polishing**:
  - Translating projects into Google XYZ resume bullet points demonstrating measurable scale (e.g. *"Architected partitioned MySQL 8 cluster processing 50M+ rows, slashing query latency by 98% from 4.8s to 0.04s"*).
- **Interview Drills**:
  - Drilling all 50 senior database engineering interview questions covering InnoDB storage engines, MVCC internals, locking graphs, and replication failovers.

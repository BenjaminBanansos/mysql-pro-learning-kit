# Month 6: Capstone Portfolio Projects on AWS Open Data (Weeks 21 - 24)

## Objective
Finalize and benchmark your 3 production-grade portfolio projects built on **AWS Open Data Registry** datasets, publish a high-visibility GitHub showcase repository, and master Staff/Senior technical database interview rounds.

---

### Week 21: Capstone Project 1 Finalization (NYC TLC Urban Transit Analytics Engine)
- **Dataset**: AWS Open Data Registry (`s3://nyc-tlc/trip data/`) — 3,000,000+ real trips.
- **Execution Checklist**:
  - Ingest and partition 3,000,000+ NYC taxi trips by year/quarter.
  - Implement covering composite indexes on `(pickup_datetime, passenger_count, total_amount, tip_amount)`.
  - Validate **100x query latency drop (from 1,850ms to 12ms)** using `EXPLAIN ANALYZE`.
  - Deploy automated MySQL Event Schedulers maintaining nightly summary rollups.
- **Deliverables**:
  - `04-portfolio-projects/project-1-ecommerce-analytics/README.md` populated with real benchmark comparisons and diagrams.

### Week 22: Capstone Project 2 Finalization (ACID Financial Ledger & Fare Settlement)
- **Execution Checklist**:
  - Deploy `sp_execute_safe_transfer` stored procedure.
  - Run multi-threaded concurrency stress test with 50 parallel workers.
  - Validate 0 deadlocks and zero negative balances using canonical lock ordering (`LEAST`/`GREATEST`).
  - Execute real-time AML fraud detection queries across 1M+ transactions.
- **Deliverables**:
  - `04-portfolio-projects/project-2-financial-ledger/README.md` with concurrency test outputs and audit integrity proof.

### Week 23: Capstone Project 3 Finalization (Cloud HA, ProxySQL & AWS Aurora S3 Pipeline)
- **Execution Checklist**:
  - Configure ProxySQL query rules to route writes to master and load-balance reads across replicas.
  - Set up native AWS Aurora S3 ingestion pipelines.
  - Run `04-portfolio-projects/project-3-cloud-ha-proxysql/benchmark_runner.py` measuring QPS and p95/p99 latencies.
- **Deliverables**:
  - `04-portfolio-projects/project-3-cloud-ha-proxysql/README.md` complete with load test graphs and failover metrics.

### Week 24: Portfolio Launch, Resume Bullets & Technical Interview Drills
- **GitHub Packaging**:
  - Showcase all 3 projects on your public GitHub repository.
  - Record a 3-minute video walkthrough explaining your covering index optimization and deadlock prevention.
- **Resume & LinkedIn Polish**:
  - Integrate quantifiable Google XYZ formula bullet points from `05-career-and-interview/resume_bullet_points_template.md`.
  - Publish the LinkedIn technical breakdown post.
- **Technical Interview Drills**:
  - Complete all 50 questions in `05-career-and-interview/mysql_pro_interview_questions.md`.

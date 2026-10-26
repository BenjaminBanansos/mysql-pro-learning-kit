# Month 6: Capstone Portfolio Projects & Job-Ready Showcase (Weeks 21 - 24)

## Objective
Finalize and benchmark your 3 production-grade portfolio projects, publish a high-visibility GitHub showcase repository, and master Staff/Senior technical database interview rounds.

---

### Week 21: Capstone Project 1 Finalization (E-Commerce Analytics Engine)
- **Execution Checklist**:
  - Ingest 5,000,000+ orders and clickstream events.
  - Implement and verify the Customer Cohort Retention Heatmap pipeline.
  - Benchmark unoptimized queries vs covering index optimizations (record exact ms latencies).
  - Configure the automated MySQL Event Scheduler for nightly materialized rollups.
- **Deliverables**:
  - `04-portfolio-projects/project-1-ecommerce-analytics/README.md` populated with your actual benchmark numbers and diagrams.

### Week 22: Capstone Project 2 Finalization (ACID Financial Ledger)
- **Execution Checklist**:
  - Deploy `sp_execute_safe_transfer` stored procedure.
  - Run multi-threaded concurrency stress test with 50 parallel workers.
  - Validate 0 deadlocks and zero negative balances.
  - Execute the real-time AML fraud detection queries across 1M+ transactions.
- **Deliverables**:
  - `04-portfolio-projects/project-2-financial-ledger/README.md` with concurrency test outputs and audit integrity proof.

### Week 23: Capstone Project 3 Finalization (Cloud HA & ProxySQL)
- **Execution Checklist**:
  - Review ProxySQL query routing rules and hostgroup separation.
  - Run `04-portfolio-projects/project-3-cloud-ha-proxysql/benchmark_runner.py` comparing QPS and p95/p99 latencies.
  - Document the high-availability failover sequence.
- **Deliverables**:
  - `04-portfolio-projects/project-3-cloud-ha-proxysql/README.md` complete with load test graphs and failover metrics.

### Week 24: Portfolio Launch, Resume Integration & Mock Interviews
- **GitHub Packaging**:
  - Push repository to GitHub following `05-career-and-interview/portfolio_presentation_guide.md`.
  - Record a 3-minute Loom walkthrough explaining your covering index optimization and deadlock prevention.
- **Resume & LinkedIn Polish**:
  - Integrate quantifiable bullet points from `05-career-and-interview/resume_bullet_points_template.md`.
  - Publish the LinkedIn technical breakdown post.
- **Technical Interview Drills**:
  - Complete all 50 questions in `05-career-and-interview/mysql_pro_interview_questions.md`.

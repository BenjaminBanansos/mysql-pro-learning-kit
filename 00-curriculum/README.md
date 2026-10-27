# 🎓 MySQL Pro Academy: Complete 10-Chapter Master Curriculum Syllabus
## Intermediate to Staff DBA & Cloud Data Architect Specialization

> **Academic Standard:** Modeled after top-tier university curricula (Stanford CS145, CMU 15-445/645, UC Berkeley CS186) and premier Coursera/edX Database Specializations.  
> **Theoretical Grounding:** Formally rooted in peer-reviewed seminal computer science literature (Edgar F. Codd, Jim Gray, Michael Stonebraker, C.J. Date, Peter Chen, David DeWitt, Goetz Graefe).  
> **Pedagogical Framework:** Structured strictly under **Bloom's Revised Taxonomy** with explicit Module Learning Outcomes (MLOs), diagnostic assessment with distractor rationales, and an integrated 10-phase Capstone Project.  
> **Cloud Scale:** Direct integration with live cloud big data containers across **Amazon Web Services (AWS S3)**, **Google Cloud (BigQuery)**, and **Hugging Face Hub**.

---

## 🏛️ Specialization Curriculum Map

| Ch # | Chapter Title | Academic Foundation & Seminal Literature | Bloom's Competency Focus | Overarching Capstone Project Milestone |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Relational Foundations & Declarative SQL** | Codd (1970) *CACM*, Date (2004), Chamberlin & Boyce (1974) | Relational Algebra, Logical Data Independence, Entity Integrity | **Phase 1:** Data Warehouse Scaffold & Logical Entity Blueprint |
| **02** | **Cloud Big Data Storage & Columnar Formats** | Ghemawat et al. (2003) *GFS*, Stonebraker (2005) *C-Store*, Le Dem (2013) *Parquet* | Decoupled Storage/Compute, Row (NSM) vs Columnar (DSM), Snappy | **Phase 2:** Cloud Object Manifest & Remote Container Registry |
| **03** | **Streaming Ingestion Protocols** | Armbrust et al. (2020) *Lakehouse*, Hellerstein (2007), IETF RFC 7233 | Zero-Copy Streaming, HTTP 206 Byte-Range, Socket Buffering | **Phase 3:** High-Speed Ingestion Pipeline streaming S3 Open Data |
| **04** | **Schema DDL, Normalization & B+ Trees** | Chen (1976) *ER Model*, Boyce & Codd (1974) *BCNF*, Tuuri & Bains *InnoDB* | 1NF–BCNF Normalization, 16KB Page Layout, Exact Numeric Types | **Phase 4:** Production Relational DDL with Integrity Constraints |
| **05** | **Bulk Data Ingestion & ACID WAL** | Gray & Reuter (1993) *Transaction Processing*, Mohan (1992) *ARIES* | ACID Invariants, Write-Ahead Logging (WAL), Disk Fsync Amortization | **Phase 5:** 100,000+ rows/sec Bulk Batch Ingest Benchmark |
| **06** | **Projections, Columnar Access & Covering Indexes** | Graefe (1993) *Volcano*, Silberschatz et al. (2020), Knuth (1968) | Projection Operator ($\pi$), Covering Indexes, Wildcard Elimination | **Phase 6:** Covering Index Analytics Views & Low-Latency API Layer |
| **07** | **Index Filtering & SARGable Predicates** | Comer (1979) *B-Tree*, Graefe (1995) *Cascades*, Winand (2012) | Selection ($\sigma$), SARGability, $O(\log N)$ B+ Tree Range Traversals | **Phase 7:** Index-Accelerated SARGable Query Architecture |
| **08** | **Dimensional Aggregations & OLAP Cubes** | Gray et al. (1997) *Data Cube*, Kimball & Ross (2013), Silberschatz (2020) | Distributive vs Holistic Aggregates ($\gamma$), WHERE vs HAVING | **Phase 8:** OLAP Executive Rollup & Metric Aggregation Engine |
| **09** | **Relational Join Algorithms & Hash Joins** | DeWitt et al. (1984) *Grace Hash Join*, Shapiro (1986), Oracle (2023) | Nested Loops, Grace Hash Join ($O(M+N)$), Market Basket Inequalities | **Phase 9:** Multi-Cloud Relational Join Weaver & Co-Occurrence Matrix |
| **10** | **Window Intelligence & Recursive CTEs** | ISO/IEC 9075:2016 *ANSI SQL*, Cormen et al. (2009) *Algorithms*, Winand | Tuple-Preserving Windowing, LAG/LEAD, Recursive DAG Induction | **Phase 10:** Capstone Final Deployment: Real-Time Executive Dashboard |

---

## 🏗️ Integrated Capstone Project: Multi-Cloud Enterprise Data Warehouse

Rather than disconnected toy exercises, every chapter in this course builds a concrete milestone of a production-grade portfolio capstone project:
- **Repository Location:** `capstone/`
- **Architecture:** Hybrid multi-cloud analytical warehouse ingesting and synthesizing:
  1. **AWS Open Data Registry:** 130M+ Amazon Reviews & NYC Taxi Telemetry
  2. **Google Cloud BigQuery:** GitHub Commit Graphs & Bitcoin Blockchain Ledgers
  3. **Hugging Face Hub:** FineWeb LLM Pretraining Tokens
- **Portfolio Outcome:** A fully functional, tested, documented, and reproducible data warehouse repository designed to pass Senior Data Engineer and Staff DBA technical hiring bars.

---

## 🚀 Navigation & Study Track

- [Chapter 1: Relational Foundations, Tuple Calculus & Declarative SQL](./chapter-01-zero-to-one-foundations.md)
- [Chapter 2: Modern Cloud Big Data Ecosystem: Distributed Object Stores & Columnar Formats](./chapter-02-cloud-big-data-ecosystem.md)
- [Chapter 3: Streaming Ingestion Protocols: Fetching Data from Remote Cloud Containers](./chapter-03-fetching-data-from-cloud-containers.md)
- [Chapter 4: Relational Schema Architecture: Normalization, B+ Tree Indexes & DDL Invariants](./chapter-04-designing-table-blueprint-ddl.md)
- [Chapter 5: High-Throughput Bulk Data Loading, ACID Transactions & Write-Ahead Logging](./chapter-05-blazing-fast-cloud-data-ingestion.md)
- [Chapter 6: Relational Algebra Projections, Columnar Access & Zero-Copy Selective Querying](./chapter-06-reading-projecting-data-select.md)
- [Chapter 7: Index-Accelerated Filtering, SARGable Predicates & B+ Tree Range Traversals](./chapter-07-filtering-real-records-where.md)
- [Chapter 8: Dimensional Aggregations, Distributive Functions & OLAP Summarization](./chapter-08-data-summarization-aggregates-group-by.md)
- [Chapter 9: Relational Join Algorithms: Nested Loop, Hash Joins & Multi-Source Synthesis](./chapter-09-combining-datasets-joins.md)
- [Chapter 10: Advanced Analytical SQL: Window Intelligence, Partitions & Recursive CTE Graph Traversal](./chapter-10-advanced-analytics-window-functions.md)

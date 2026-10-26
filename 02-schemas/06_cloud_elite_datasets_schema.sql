-- ============================================================================
-- 06_cloud_elite_datasets_schema.sql
-- Enterprise Schemas for AWS Open Data, Google Cloud BigQuery & Hugging Face Hub
-- Covers: GitHub Public Archive, Stack Overflow, Blockchain Ledgers, Common Crawl & FineWeb
-- ============================================================================

CREATE DATABASE IF NOT EXISTS cloud_big_data_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE cloud_big_data_db;

-- ----------------------------------------------------------------------------
-- 1. GOOGLE CLOUD: GITHUB PUBLIC ARCHIVE (github_repos)
-- Focus: Recursive CTE Git DAGs, High-Cardinality Hash Indexing, Star Analytics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS github_repos (
    repo_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    repo_name VARCHAR(150) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    primary_language VARCHAR(50),
    stars_count INT UNSIGNED DEFAULT 0,
    forks_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (repo_id),
    UNIQUE KEY uq_repo_name (repo_name),
    INDEX idx_lang_stars (primary_language, stars_count DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS github_commits (
    commit_sha CHAR(40) NOT NULL,
    repo_id BIGINT UNSIGNED NOT NULL,
    parent_sha CHAR(40) DEFAULT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(150) NOT NULL,
    commit_date DATETIME NOT NULL,
    message TEXT NOT NULL,
    lines_added INT UNSIGNED DEFAULT 0,
    lines_deleted INT UNSIGNED DEFAULT 0,
    PRIMARY KEY (commit_sha),
    INDEX idx_repo_date (repo_id, commit_date DESC),
    INDEX idx_parent (parent_sha),
    INDEX idx_author_date (author_email, commit_date),
    CONSTRAINT fk_commit_repo FOREIGN KEY (repo_id) REFERENCES github_repos(repo_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. GOOGLE CLOUD: STACK OVERFLOW PUBLIC DATASET
-- Focus: Self-Join Tag Co-Occurrence, Reputation Window Functions, JSON Badges
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS so_users (
    user_id BIGINT UNSIGNED NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    reputation INT NOT NULL DEFAULT 1,
    creation_date DATETIME NOT NULL,
    views INT UNSIGNED DEFAULT 0,
    up_votes INT UNSIGNED DEFAULT 0,
    down_votes INT UNSIGNED DEFAULT 0,
    custom_badges JSON,
    PRIMARY KEY (user_id),
    INDEX idx_reputation (reputation DESC)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS so_posts (
    post_id BIGINT UNSIGNED NOT NULL,
    post_type_id TINYINT UNSIGNED NOT NULL COMMENT '1=Question, 2=Answer',
    parent_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Refers to Question ID if post is an answer',
    accepted_answer_id BIGINT UNSIGNED DEFAULT NULL,
    owner_user_id BIGINT UNSIGNED,
    score INT NOT NULL DEFAULT 0,
    view_count INT UNSIGNED DEFAULT 0,
    title VARCHAR(300),
    tags VARCHAR(250) COMMENT 'Format: <mysql><indexing><innodb>',
    creation_date DATETIME NOT NULL,
    PRIMARY KEY (post_id),
    INDEX idx_parent (parent_id),
    INDEX idx_owner_date (owner_user_id, creation_date),
    INDEX idx_score (score DESC),
    FULLTEXT INDEX idx_fts_title (title)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. GOOGLE CLOUD: BITCOIN & ETHEREUM BLOCKCHAIN LEDGER
-- Focus: Clustered UTXO Model, Strict Double-Entry Ledger, Canonical Locking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blockchain_blocks (
    block_height BIGINT UNSIGNED NOT NULL,
    block_hash CHAR(64) NOT NULL,
    timestamp DATETIME NOT NULL,
    tx_count INT UNSIGNED NOT NULL,
    total_fee_satoshis BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (block_height),
    UNIQUE KEY uq_block_hash (block_hash)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blockchain_transactions (
    tx_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    tx_hash CHAR(64) NOT NULL,
    block_height BIGINT UNSIGNED NOT NULL,
    from_address VARCHAR(80) NOT NULL,
    to_address VARCHAR(80) NOT NULL,
    amount_satoshis BIGINT UNSIGNED NOT NULL,
    fee_satoshis INT UNSIGNED NOT NULL,
    tx_timestamp DATETIME NOT NULL,
    PRIMARY KEY (tx_id, tx_timestamp),
    UNIQUE KEY uq_tx_hash (tx_hash, tx_timestamp),
    INDEX idx_from_addr (from_address, tx_timestamp),
    INDEX idx_to_addr (to_address, tx_timestamp)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(tx_timestamp)) (
    PARTITION p_early VALUES LESS THAN (2020),
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ----------------------------------------------------------------------------
-- 4. AWS OPEN DATA: COMMON CRAWL (WARC Web Scrape Index)
-- Focus: Petabyte Web Crawl Metadata, Domain Graph Analytics, Prefix Hashing
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS common_crawl_warc_index (
    warc_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    domain VARCHAR(150) NOT NULL,
    tld VARCHAR(20) NOT NULL,
    url_path VARCHAR(500) NOT NULL,
    http_status SMALLINT UNSIGNED NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    content_digest CHAR(40) NOT NULL,
    crawl_date DATE NOT NULL,
    PRIMARY KEY (warc_id, crawl_date),
    INDEX idx_domain (domain, crawl_date),
    INDEX idx_tld_status (tld, http_status)
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(crawl_date)) (
    PARTITION p_crawl_2023_q1 VALUES LESS THAN (TO_DAYS('2023-04-01')),
    PARTITION p_crawl_2023_q2 VALUES LESS THAN (TO_DAYS('2023-07-01')),
    PARTITION p_crawl_2023_q3 VALUES LESS THAN (TO_DAYS('2023-10-01')),
    PARTITION p_crawl_2023_q4 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_crawl_future VALUES LESS THAN MAXVALUE
);

-- ----------------------------------------------------------------------------
-- 5. HUGGING FACE HUB: FINEWEB & REDPAJAMA (15 Trillion Token Metadata)
-- Focus: Pretraining Filtering Pipeline, Vocabulary Frequency Tables, Quality Scoring
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fineweb_pretrain_docs (
    doc_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    source_corpus VARCHAR(50) NOT NULL DEFAULT 'FineWeb',
    token_count INT UNSIGNED NOT NULL,
    character_count INT UNSIGNED NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    educational_score DECIMAL(4, 3) NOT NULL COMMENT 'Calculated quality score from 0.000 to 1.000',
    toxicity_score DECIMAL(4, 3) NOT NULL DEFAULT 0.000,
    crawl_date DATE NOT NULL,
    PRIMARY KEY (doc_id),
    INDEX idx_quality_tokens (educational_score DESC, token_count DESC),
    INDEX idx_source_lang (source_corpus, language_code)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- SAMPLE DATA POPULATION FOR BENCHMARKING & LOCAL TESTING
-- ----------------------------------------------------------------------------
INSERT INTO github_repos (repo_name, organization, primary_language, stars_count, forks_count) VALUES
('mysql/mysql-server', 'mysql', 'C++', 12400, 4800),
('facebook/react', 'facebook', 'JavaScript', 225000, 45000),
('torvalds/linux', 'torvalds', 'C', 178000, 52000),
('golang/go', 'golang', 'Go', 121000, 18000);

INSERT INTO github_commits (commit_sha, repo_id, parent_sha, author_name, author_email, commit_date, message, lines_added, lines_deleted) VALUES
('a1b2c3d4e5f60718293041526374859607182930', 1, NULL, 'Oracle Engineer', 'dev1@mysql.com', '2023-01-10 14:32:00', 'Optimizing InnoDB redo log flush mechanics', 145, 32),
('b2c3d4e5f6a10718293041526374859607182931', 1, 'a1b2c3d4e5f60718293041526374859607182930', 'Performance Lead', 'perf@mysql.com', '2023-01-12 09:15:00', 'Implement Hash Join spill-to-disk logic', 320, 84),
('c3d4e5f6a1b20718293041526374859607182932', 1, 'b2c3d4e5f6a10718293041526374859607182931', 'Kernel Hacker', 'kernel@mysql.com', '2023-01-15 18:22:00', 'Fix B+ Tree leaf page split concurrency race', 88, 12);

INSERT INTO so_posts (post_id, post_type_id, parent_id, accepted_answer_id, owner_user_id, score, view_count, title, tags, creation_date) VALUES
(1001, 1, NULL, 1002, 501, 142, 25800, 'Why does MySQL index not work with leading wildcard LIKE?', '<mysql><indexing><performance>', '2023-02-01 10:00:00'),
(1002, 2, 1001, NULL, 602, 198, 0, NULL, NULL, '2023-02-01 10:15:00'),
(1003, 1, NULL, NULL, 503, 89, 14200, 'How to eliminate deadlocks in MySQL InnoDB transactions?', '<mysql><innodb><transactions><deadlock>', '2023-02-05 14:20:00');

INSERT INTO fineweb_pretrain_docs (source_corpus, token_count, character_count, language_code, educational_score, toxicity_score, crawl_date) VALUES
('FineWeb', 4250, 21250, 'en', 0.945, 0.002, '2023-05-15'),
('FineWeb', 1820, 9100, 'en', 0.880, 0.005, '2023-05-16'),
('RedPajama', 8900, 44500, 'en', 0.920, 0.001, '2023-05-18');

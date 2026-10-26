-- ========================================================================
-- Schema: finance_db (High-Concurrency ACID Ledger & Fraud Analytics)
-- Target Scale: 1,000,000+ financial transactions, 50,000 accounts
-- Focus: Row-level locking, Deadlock avoidance, MVCC, Audit trails
-- ========================================================================

CREATE DATABASE IF NOT EXISTS finance_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE finance_db;

-- 1. Accounts Table (Subject to high-frequency concurrent balance updates)
CREATE TABLE IF NOT EXISTS accounts (
    account_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id INT UNSIGNED NOT NULL,
    account_number VARCHAR(34) NOT NULL, -- IBAN standard length
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    version INT UNSIGNED NOT NULL DEFAULT 1, -- Optimistic locking token
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (account_id),
    UNIQUE KEY uq_account_number (account_number),
    KEY idx_accounts_customer (customer_id),
    CONSTRAINT chk_positive_balance CHECK (current_balance >= 0.00)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 2. Financial Transactions Ledger Table (Immutable double-entry append-only)
CREATE TABLE IF NOT EXISTS financial_transactions (
    txn_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    from_account_id BIGINT UNSIGNED NOT NULL,
    to_account_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('SETTLED', 'PENDING', 'REVERSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    txn_type VARCHAR(30) NOT NULL,
    is_flagged TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (txn_id),
    KEY idx_txn_from_acc_time (from_account_id, created_at),
    KEY idx_txn_to_acc_time (to_account_id, created_at),
    KEY idx_txn_status_flagged (status, is_flagged, amount),
    CONSTRAINT fk_txn_from_acc
        FOREIGN KEY (from_account_id) REFERENCES accounts (account_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_txn_to_acc
        FOREIGN KEY (to_account_id) REFERENCES accounts (account_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- 3. Transaction Audit Trail (Temporal Ledger for Regulatory Compliance)
CREATE TABLE IF NOT EXISTS transaction_audit_log (
    audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    txn_id BIGINT UNSIGNED NOT NULL,
    previous_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM_WORKER',
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    PRIMARY KEY (audit_id),
    KEY idx_audit_txn (txn_id)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

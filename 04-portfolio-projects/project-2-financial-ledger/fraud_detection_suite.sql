-- ========================================================================
-- Portfolio Project 2: Real-Time Fraud & AML Anomaly Detection Suite
-- Database: finance_db (1,000,000+ Transactions)
-- Focus: Sliding Window Frames, Rapid Structuring (Smurfing), Velocity Bursts
-- ========================================================================

USE finance_db;

-- ------------------------------------------------------------------------
-- Detection 1: High Velocity Burst Attack Detection
-- Finds accounts initiating >= 4 transactions within a 1-hour window
-- ------------------------------------------------------------------------
WITH ranked_txns AS (
    SELECT 
        txn_id,
        from_account_id,
        amount,
        created_at,
        COUNT(*) OVER (
            PARTITION BY from_account_id 
            ORDER BY created_at 
            RANGE BETWEEN INTERVAL 1 HOUR PRECEDING AND CURRENT ROW
        ) AS txns_in_last_hour,
        ROUND(SUM(amount) OVER (
            PARTITION BY from_account_id 
            ORDER BY created_at 
            RANGE BETWEEN INTERVAL 1 HOUR PRECEDING AND CURRENT ROW
        ), 2) AS outflow_in_last_hour
    FROM financial_transactions
    WHERE status = 'SETTLED'
)
SELECT 
    from_account_id,
    txn_id,
    created_at,
    amount,
    txns_in_last_hour,
    outflow_in_last_hour
FROM ranked_txns
WHERE txns_in_last_hour >= 4
ORDER BY outflow_in_last_hour DESC
LIMIT 50;

-- ------------------------------------------------------------------------
-- Detection 2: Anti-Structuring / Smurfing Detection
-- Identifies accounts deliberately splitting transfers just below regulatory AML ($10,000)
-- ------------------------------------------------------------------------
SELECT 
    from_account_id,
    COUNT(txn_id) AS structuring_frequency,
    ROUND(SUM(amount), 2) AS total_structured_amount,
    MIN(created_at) AS first_attempt,
    MAX(created_at) AS last_attempt
FROM financial_transactions
WHERE amount BETWEEN 9000.00 AND 9999.99
  AND status = 'SETTLED'
GROUP BY from_account_id
HAVING structuring_frequency >= 2
ORDER BY structuring_frequency DESC, total_structured_amount DESC;

-- ------------------------------------------------------------------------
-- Detection 3: Rapid Balance Depletion Anomaly
-- Detects accounts where recent 24-hour transfers drained more than 90% of original funds
-- ------------------------------------------------------------------------
WITH account_daily_outflow AS (
    SELECT 
        from_account_id,
        ROUND(SUM(amount), 2) AS total_outflow_24h,
        COUNT(txn_id) AS total_txns
    FROM financial_transactions
    WHERE created_at >= NOW() - INTERVAL 1 DAY
      AND status = 'SETTLED'
    GROUP BY from_account_id
)
SELECT 
    a.account_id,
    a.customer_id,
    a.current_balance,
    o.total_outflow_24h,
    ROUND((o.total_outflow_24h / (a.current_balance + o.total_outflow_24h)) * 100, 2) AS depletion_percentage
FROM accounts a
JOIN account_daily_outflow o ON a.account_id = o.from_account_id
WHERE (o.total_outflow_24h / (a.current_balance + o.total_outflow_24h)) >= 0.90
ORDER BY o.total_outflow_24h DESC
LIMIT 25;

-- ========================================================================
-- Portfolio Project 1: Production Analytics Pipelines
-- Database: analytics_db
-- ========================================================================

USE analytics_db;

-- ------------------------------------------------------------------------
-- Pipeline 1: Customer Cohort Retention Analysis (Heatmap Engine)
-- Tracks how many customers from a signup cohort return to buy in months 1..6
-- ------------------------------------------------------------------------
WITH customer_first_purchase AS (
    SELECT 
        customer_id,
        MIN(DATE_FORMAT(order_date, '%Y-%m-01')) AS cohort_month
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY customer_id
),
customer_activities AS (
    SELECT 
        o.customer_id,
        fp.cohort_month,
        DATE_FORMAT(o.order_date, '%Y-%m-01') AS activity_month,
        TIMESTAMPDIFF(MONTH, fp.cohort_month, DATE_FORMAT(o.order_date, '%Y-%m-01')) AS month_number
    FROM orders o
    JOIN customer_first_purchase fp ON o.customer_id = fp.customer_id
    WHERE o.status = 'COMPLETED'
),
cohort_size AS (
    SELECT cohort_month, COUNT(DISTINCT customer_id) AS total_customers
    FROM customer_first_purchase
    GROUP BY cohort_month
),
retention_matrix AS (
    SELECT 
        ca.cohort_month,
        ca.month_number,
        COUNT(DISTINCT ca.customer_id) AS active_customers
    FROM customer_activities ca
    GROUP BY ca.cohort_month, ca.month_number
)
SELECT 
    rm.cohort_month,
    cs.total_customers AS cohort_size,
    rm.month_number,
    rm.active_customers,
    ROUND((rm.active_customers / cs.total_customers) * 100, 2) AS retention_rate_pct
FROM retention_matrix rm
JOIN cohort_size cs ON rm.cohort_month = cs.cohort_month
WHERE rm.month_number BETWEEN 0 AND 6
ORDER BY rm.cohort_month, rm.month_number;

-- ------------------------------------------------------------------------
-- Pipeline 2: Market Basket Affinity Analysis (Frequently Bought Together)
-- Self-joins order_items to find top product co-purchases without duplicates
-- ------------------------------------------------------------------------
SELECT 
    p1.name AS product_a,
    p2.name AS product_b,
    COUNT(DISTINCT oi1.order_id) AS times_bought_together
FROM order_items oi1
JOIN order_items oi2 
    ON oi1.order_id = oi2.order_id 
   AND oi1.product_id < oi2.product_id -- Prevents symmetric pairs (A,B) and (B,A)
JOIN products p1 ON oi1.product_id = p1.product_id
JOIN products p2 ON oi2.product_id = p2.product_id
GROUP BY oi1.product_id, oi2.product_id, p1.name, p2.name
HAVING times_bought_together >= 5
ORDER BY times_bought_together DESC
LIMIT 20;

-- ------------------------------------------------------------------------
-- Pipeline 3: Multi-Stage Telemetry Conversion Funnel
-- Measures session drop-off: Search -> Add to Cart -> Completed Checkout
-- ------------------------------------------------------------------------
WITH session_events AS (
    SELECT 
        session_id,
        MAX(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) AS has_searched,
        MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS has_carted,
        MAX(CASE WHEN event_type = 'checkout_step' THEN 1 ELSE 0 END) AS has_checked_out
    FROM user_events
    WHERE session_id IS NOT NULL
    GROUP BY session_id
)
SELECT 
    COUNT(*) AS total_sessions,
    SUM(has_searched) AS sessions_with_search,
    SUM(has_carted) AS sessions_with_cart,
    SUM(has_checked_out) AS sessions_with_checkout,
    ROUND((SUM(has_carted) / NULLIF(SUM(has_searched), 0)) * 100, 2) AS search_to_cart_pct,
    ROUND((SUM(has_checked_out) / NULLIF(SUM(has_carted), 0)) * 100, 2) AS cart_to_checkout_pct
FROM session_events;

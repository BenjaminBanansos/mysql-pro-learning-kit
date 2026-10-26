-- ========================================================================
-- Lab 01: Advanced Window Functions & CTEs (Production-Level Analytical SQL)
-- Database: analytics_db
-- Target: 1M+ Orders, 2.5M+ Items
-- ========================================================================

USE analytics_db;

-- ------------------------------------------------------------------------
-- Exercise 1: Top 3 Revenue-Generating Products Per Category
-- Techniques: CTE, DENSE_RANK(), Partitioning by Category
-- ------------------------------------------------------------------------
WITH product_sales AS (
    SELECT 
        p.category,
        p.product_id,
        p.name AS product_name,
        ROUND(SUM(oi.subtotal), 2) AS total_revenue,
        COUNT(DISTINCT oi.order_id) AS distinct_orders
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.category, p.product_id, p.name
),
ranked_products AS (
    SELECT 
        category,
        product_id,
        product_name,
        total_revenue,
        distinct_orders,
        DENSE_RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC) AS sales_rank
    FROM product_sales
)
SELECT 
    category,
    sales_rank,
    product_id,
    product_name,
    total_revenue,
    distinct_orders
FROM ranked_products
WHERE sales_rank <= 3
ORDER BY category, sales_rank;

-- ------------------------------------------------------------------------
-- Exercise 2: Month-over-Month (MoM) Growth & Lag Analysis
-- Techniques: DATE_FORMAT, SUM(), LAG(), NULLIF to prevent division by zero
-- ------------------------------------------------------------------------
WITH monthly_revenue AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS sales_month,
        ROUND(SUM(total_amount), 2) AS current_month_revenue,
        COUNT(order_id) AS total_orders
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
revenue_with_lag AS (
    SELECT 
        sales_month,
        current_month_revenue,
        total_orders,
        LAG(current_month_revenue, 1) OVER (ORDER BY sales_month) AS prev_month_revenue
    FROM monthly_revenue
)
SELECT 
    sales_month,
    current_month_revenue,
    prev_month_revenue,
    ROUND(current_month_revenue - prev_month_revenue, 2) AS mom_dollar_change,
    ROUND(((current_month_revenue - prev_month_revenue) / NULLIF(prev_month_revenue, 0)) * 100, 2) AS mom_growth_pct
FROM revenue_with_lag
ORDER BY sales_month;

-- ------------------------------------------------------------------------
-- Exercise 3: Running Cumulative Total & 7-Day Centered Moving Average
-- Techniques: Sliding Window Frame (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
-- ------------------------------------------------------------------------
WITH daily_sales AS (
    SELECT 
        DATE(order_date) AS order_day,
        ROUND(SUM(total_amount), 2) AS day_revenue
    FROM orders
    WHERE status = 'COMPLETED' AND order_date >= '2023-01-01'
    GROUP BY DATE(order_date)
)
SELECT 
    order_day,
    day_revenue,
    -- Running Cumulative Total from Day 1 to Current Day
    ROUND(SUM(day_revenue) OVER (ORDER BY order_day ROWS UNBOUNDED PRECEDING), 2) AS cumulative_revenue_ytd,
    -- 7-Day Moving Average
    ROUND(AVG(day_revenue) OVER (ORDER BY order_day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS moving_avg_7d
FROM daily_sales
ORDER BY order_day
LIMIT 100;

-- ------------------------------------------------------------------------
-- Exercise 4: Customer RFM Segmentation via NTILE(4) Quartiles
-- Techniques: NTILE, DATEDIFF, Advanced Customer Scoring
-- ------------------------------------------------------------------------
WITH customer_metrics AS (
    SELECT 
        customer_id,
        MAX(order_date) AS last_order_date,
        COUNT(order_id) AS order_frequency,
        ROUND(SUM(total_amount), 2) AS monetary_value
    FROM orders
    WHERE status = 'COMPLETED'
    GROUP BY customer_id
),
rfm_scores AS (
    SELECT 
        customer_id,
        last_order_date,
        order_frequency,
        monetary_value,
        -- Recency: Recent orders score higher (Quartile 4 is best)
        NTILE(4) OVER (ORDER BY last_order_date ASC) AS r_score,
        -- Frequency: More orders score higher
        NTILE(4) OVER (ORDER BY order_frequency ASC) AS f_score,
        -- Monetary: Higher spend scores higher
        NTILE(4) OVER (ORDER BY monetary_value ASC) AS m_score
    FROM customer_metrics
)
SELECT 
    customer_id,
    order_frequency,
    monetary_value,
    CONCAT(r_score, f_score, m_score) AS rfm_cell,
    CASE 
        WHEN r_score = 4 AND f_score = 4 AND m_score = 4 THEN 'VIP Champion'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customer'
        WHEN r_score = 1 AND f_score >= 3 THEN 'At Risk / Churning'
        ELSE 'Regular Buyer'
    END AS customer_persona
FROM rfm_scores
ORDER BY monetary_value DESC
LIMIT 50;

-- ------------------------------------------------------------------------
-- Exercise 5: Recursive CTE for Multi-Level Referral Trees / Org Hierarchy
-- Techniques: WITH RECURSIVE, Anchor member, Recursive member, Cycle detection
-- ------------------------------------------------------------------------
-- Simulating a synthetic referral structure where customer_id % 7 is the referrer
WITH RECURSIVE referral_tree AS (
    -- Anchor Member: Top-tier influencers (Customer 1 to 5)
    SELECT 
        customer_id,
        email,
        1 AS depth,
        CAST(customer_id AS CHAR(1000)) AS referral_path
    FROM customers
    WHERE customer_id BETWEEN 1 AND 3
    
    UNION ALL
    
    -- Recursive Member: People referred down the hierarchy
    SELECT 
        c.customer_id,
        c.email,
        rt.depth + 1,
        CONCAT(rt.referral_path, ' -> ', c.customer_id)
    FROM customers c
    JOIN referral_tree rt ON (c.customer_id % 100) = rt.customer_id
    WHERE rt.depth < 4 -- Guard against deep recursion
)
SELECT depth, customer_id, email, referral_path
FROM referral_tree
ORDER BY depth, customer_id
LIMIT 50;

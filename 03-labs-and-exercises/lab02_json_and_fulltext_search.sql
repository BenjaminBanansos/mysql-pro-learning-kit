-- ========================================================================
-- Lab 02: MySQL 8 JSON Analytics & Full-Text Search
-- Database: analytics_db
-- Focus: JSON Operators, JSON_TABLE, Multi-Valued Indexes, Boolean FTS
-- ========================================================================

USE analytics_db;

-- ------------------------------------------------------------------------
-- Part 1: Native JSON Querying & Extraction
-- ------------------------------------------------------------------------

-- 1.1 Direct path extraction using -> (returns quoted JSON) vs ->> (returns unquoted string)
SELECT 
    event_id,
    event_type,
    payload->'$.device' AS device_quoted,
    payload->>'$.device' AS device_unquoted,
    payload->>'$.ip' AS ip_address,
    payload->>'$.response_ms' AS latency_ms
FROM user_events
WHERE event_type = 'search'
LIMIT 10;

-- 1.2 Aggregating on JSON fields with type casting
SELECT 
    payload->>'$.device' AS device_type,
    COUNT(*) AS total_hits,
    ROUND(AVG(CAST(payload->>'$.response_ms' AS UNSIGNED)), 2) AS avg_latency_ms,
    MAX(CAST(payload->>'$.response_ms' AS UNSIGNED)) AS max_latency_ms
FROM user_events
WHERE event_type = 'page_view'
GROUP BY payload->>'$.device'
ORDER BY total_hits DESC;

-- ------------------------------------------------------------------------
-- Part 2: JSON_TABLE - Relational Projection of Unstructured Telemetry
-- ------------------------------------------------------------------------

-- Transforming JSON documents into a relational tabular view on the fly
SELECT 
    jt.event_id,
    jt.session_id,
    jt.search_term,
    jt.results_returned,
    jt.ip_address
FROM user_events e,
JSON_TABLE(
    e.payload,
    '$' COLUMNS (
        event_id FOR ORDINALITY,
        session_id VARCHAR(64) PATH '$.session_id',
        search_term VARCHAR(100) PATH '$.query',
        results_returned INT PATH '$.results_count',
        ip_address VARCHAR(45) PATH '$.ip'
    )
) AS jt
WHERE e.event_type = 'search'
LIMIT 20;

-- ------------------------------------------------------------------------
-- Part 3: Indexing JSON Documents in MySQL 8
-- ------------------------------------------------------------------------

-- Note: You cannot index an entire JSON blob directly.
-- Instead, use Generated Virtual Columns or Functional Indexes:

-- Example: Adding an index on extracted JSON field if not already in schema
ALTER TABLE user_events 
ADD INDEX idx_json_ip ((CAST(payload->>'$.ip' AS CHAR(45))));

-- Verify the query planner uses the functional index:
EXPLAIN SELECT * 
FROM user_events 
WHERE CAST(payload->>'$.ip' AS CHAR(45)) = '192.168.1.100';

-- ------------------------------------------------------------------------
-- Part 4: High-Performance Full-Text Search (FTS)
-- ------------------------------------------------------------------------

-- 4.1 Natural Language Search with Relevancy Score
SELECT 
    product_id,
    sku,
    name,
    category,
    base_price,
    MATCH(name) AGAINST('Enterprise Electronics' IN NATURAL LANGUAGE MODE) AS relevance_score
FROM products
WHERE MATCH(name) AGAINST('Enterprise Electronics' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC
LIMIT 10;

-- 4.2 Boolean Mode with Strict Inclusion (+), Exclusion (-), and Wildcards (*)
SELECT 
    product_id,
    name,
    category,
    base_price
FROM products
WHERE MATCH(name) AGAINST('+Enterprise +Electronics* -Model' IN BOOLEAN MODE)
LIMIT 20;

-- 4.3 Inspecting FTS Index Performance with EXPLAIN
EXPLAIN FORMAT=TREE
SELECT product_id, name, base_price
FROM products
WHERE MATCH(name) AGAINST('+Fitness*' IN BOOLEAN MODE);

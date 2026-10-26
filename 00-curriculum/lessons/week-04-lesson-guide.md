# Week 4 Comprehensive Lesson: MySQL 8 Native JSON & Full-Text Search on AWS Reviews

Welcome to **Week 4** of the MySQL Intermediate to Pro curriculum!

This lesson explores two modern MySQL capabilities essential for modern web applications and cloud analytics: **Semi-structured JSON manipulation** and **InnoDB Full-Text Search (FTS)** using the 130M+ Amazon Customer Reviews dataset from the AWS Open Data Registry (`s3://amazon-reviews-pds/`).

---

## 📦 Part 1: Native JSON Data Type & Operators

MySQL 8 provides native binary storage for JSON documents, offering automatic validation, efficient lookup by key without parsing strings, and in-place partial updates.

### Key Extraction Operators:
- `->` : **Extracts JSON value (Preserves Quotes)**. E.g., `payload->'$.device'` returns `"iPhone 14"`.
- `->>` : **Unquotes JSON value as plain text**. E.g., `payload->>'$.device'` returns `iPhone 14`. Equivalent to `JSON_UNQUOTE(JSON_EXTRACT(payload, '$.device'))`.

```sql
-- Querying JSON telemetry in MySQL 8
SELECT 
    event_id,
    user_id,
    payload->>'$.browser' AS browser_name,
    CAST(payload->>'$.cart_total' AS DECIMAL(10,2)) AS cart_value,
    JSON_CONTAINS(payload, '"credit_card"', '$.payment_methods') AS has_credit_card
FROM user_events
WHERE payload->>'$.country' = 'US';
```

---

## 🔄 Part 2: Relational Projection with `JSON_TABLE()`

`JSON_TABLE()` is a powerful MySQL 8 function that converts nested JSON arrays and objects into a tabular virtual relational table that can be queried, joined, and aggregated directly with SQL:

```sql
SELECT 
    jt.item_id,
    jt.item_sku,
    jt.quantity,
    jt.unit_price
FROM orders o,
JSON_TABLE(
    o.raw_payload,
    '$.items[*]' COLUMNS (
        item_id     FOR ORDINALITY,
        item_sku    VARCHAR(50)   PATH '$.sku',
        quantity    INT           PATH '$.qty',
        unit_price  DECIMAL(10,2) PATH '$.price'
    )
) AS jt
WHERE o.order_id = 1042;
```

---

## 🔍 Part 3: InnoDB Full-Text Search (FTS) Architecture

Standard `LIKE '%keyword%'` queries cannot use standard B+Tree indexes because of the leading wildcard, forcing full table scans across millions of rows.

InnoDB solves this with **Inverted Indexes**:
- Tokenizes text into individual words using the Built-in ngram parser or default white-space tokenizer.
- Eliminates common **stopwords** (e.g., `the`, `is`, `at`).
- Stores token entries in auxiliary tables (`FTS_*_INDEX_*`), mapping each word to document IDs and byte offsets.

### Full-Text Search on AWS Amazon Customer Reviews (130M+ Scale)
```sql
-- DDL: Adding FULLTEXT index
ALTER TABLE amazon_product_reviews 
ADD FULLTEXT INDEX idx_fts_review_text (review_headline, review_body);

-- Boolean Mode Search with relevance score
SELECT 
    review_id,
    product_title,
    star_rating,
    ROUND(MATCH(review_headline, review_body) AGAINST ('+battery +"wireless charging" -defective' IN BOOLEAN MODE), 4) AS relevance_score
FROM amazon_product_reviews
WHERE MATCH(review_headline, review_body) AGAINST ('+battery +"wireless charging" -defective' IN BOOLEAN MODE)
ORDER BY relevance_score DESC
LIMIT 15;
```

### Boolean Mode Operators:
- `+` : Word **must** be present.
- `-` : Word **must not** be present (exclusion).
- `""` : Exact literal phrase match.
- `*` : Prefix wildcard (e.g., `charg*` matches charge, charger, charging).
- `>` / `<` : Increases or decreases the word's contribution to relevance score.

---

## ⚡ Part 4: Indexing JSON with Generated Virtual Columns

While you cannot index an entire JSON blob directly with a B+Tree, MySQL allows you to extract specific keys into **Generated Virtual Columns** and index them:

```sql
-- Step 1: Add Virtual Column
ALTER TABLE user_events
ADD COLUMN device_os VARCHAR(50) 
GENERATED ALWAYS AS (payload->>'$.os') VIRTUAL;

-- Step 2: Create B+Tree index on the virtual column
CREATE INDEX idx_user_events_os ON user_events (device_os);

-- Step 3: Query executes with instant index lookup (Ref / Range)
EXPLAIN SELECT * FROM user_events WHERE device_os = 'iOS';
```

---

## ✅ Week 4 Checklist
- [ ] Understand the difference between `->` and `->>`.
- [ ] Project nested JSON arrays into relational rows using `JSON_TABLE()`.
- [ ] Create InnoDB Full-Text indexes and write complex Boolean mode queries.
- [ ] Index semi-structured JSON properties using Generated Virtual Columns.

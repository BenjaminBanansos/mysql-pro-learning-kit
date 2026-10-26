# Week 6 Comprehensive Lesson: B+ Tree Anatomy & Indexing High-Cardinality Hashes

Welcome to **Week 6** of the MySQL Intermediate to Pro curriculum!

This lesson demystifies the physical storage mechanics of MySQL's default storage engine: **InnoDB B+ Trees**. You will understand how clustered and secondary indexes physically lay out data on disk, why indexing random hashes (like 40-character Git SHA-1 hashes or 64-character Bitcoin transaction hashes) causes severe leaf-page fragmentation, and how senior architects optimize storage layout.

---

## 🌳 Part 1: Anatomy of an InnoDB B+ Tree

In InnoDB, **every table is physically organized as a B+ Tree clustered index**. There is no separate "heap" table.

```
                    Root Page (16KB)
                   ┌─────────────────┐
                   │  Key 100 │ 500  │
                   └────────┬───┬────┘
           ┌────────────────┘   └────────────────┐
           ▼                                     ▼
     Branch Page                           Branch Page
    ┌────────────┐                        ┌────────────┐
    │  10 │  50  │                        │ 600 │ 800  │
    └────┬───┬───┘                        └────┬───┬───┘
         │   │                                 │   │
   ┌─────┘   └─────┐                     ┌─────┘   └─────┐
   ▼               ▼                     ▼               ▼
Leaf Page 1   Leaf Page 2           Leaf Page 3     Leaf Page 4
┌───────────┐ ┌───────────┐         ┌───────────┐   ┌───────────┐
│Row 1..9   │-│Row 10..49 │---------│Row 600..  │---│Row 800..  │
└───────────┘ └───────────┘         └───────────┘   └───────────┘
 ◄────────── Doubly Linked List for Fast Sequential Scans ──────────►
```

### Key Architectural Characteristics:
1. **16KB Fixed Page Size**: All data and index nodes are stored in 16,384-byte blocks (`innodb_page_size`).
2. **Clustered Index**: The `PRIMARY KEY` is the clustered index. The leaf pages contain the **actual table row data** (all columns).
3. **Secondary Index**: Leaves of a secondary index store only the indexed column values and the **Primary Key pointer** (to locate the row via bookmark lookup).
4. **Doubly-Linked Leaves**: All leaf nodes are linked in key order, allowing high-speed range scans without returning to the root node.

---

## 💥 Part 2: The High-Cardinality Hash Trap (Git SHA & Bitcoin Hashes)

When designing schemas for systems like GitHub or Blockchain ledgers, developers often define tables with the hash as the Primary Key:

```sql
-- ❌ DANGEROUS AT SCALE: Random Primary Key
CREATE TABLE blockchain_transactions (
    tx_hash CHAR(64) PRIMARY KEY, -- Random cryptographic hash!
    block_height BIGINT,
    amount_satoshis BIGINT
) ENGINE=InnoDB;
```

### What happens inside the B+ Tree during heavy inserts:
1. **Sequential Insert (AUTO_INCREMENT INT)**:
   - Each new ID is greater than the last.
   - MySQL appends rows to the rightmost leaf page with **15/16 page fill factor (~93.75% storage density)**. Zero fragmentation.
2. **Random Insert (SHA-1 / SHA-256 / UUIDv4)**:
   - Hashes are evenly and randomly distributed across the entire 64-character spectrum.
   - Every new insert lands randomly in the middle of an existing leaf page.
   - When a 16KB leaf page is full and receives a random insert, InnoDB must perform a **50-50 Page Split**:
     - Allocates a brand new 16KB page.
     - Moves half the records from the full page into the new page.
     - Results in **~50% average page fill factor** (wasting half of your RAM and disk!).
     - Generates massive random disk I/O, evicting hot pages from the Buffer Pool.

---

## 🛡️ Part 3: The Senior Architect Solution

How do enterprise architects store random hashes efficiently?

### Pattern 1: Sequential Surrogate Primary Key
Make the physical clustered index sequential, and put a secondary index on the hash:

```sql
--  PRO PATTERN: Clustered Sequential PK + Secondary Hash Index
CREATE TABLE blockchain_transactions (
    tx_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, -- Fast sequential append!
    tx_hash CHAR(64) NOT NULL,
    block_height BIGINT UNSIGNED NOT NULL,
    amount_satoshis BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (tx_id),
    UNIQUE KEY uq_tx_hash (tx_hash)
) ENGINE=InnoDB;
```

### Pattern 2: Binary Hash Packing (Save 50% Storage)
Hexadecimal strings (e.g. `CHAR(64)` for SHA-256) use 64 bytes. If stored as raw binary (`BINARY(32)`), storage is cut by 50%:

```sql
--  PRO STORAGE: UNHEX() and HEX()
ALTER TABLE blockchain_transactions 
ADD COLUMN tx_hash_bin BINARY(32) NOT NULL;

-- Insert packed binary:
INSERT INTO blockchain_transactions (tx_hash_bin) VALUES (UNHEX('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'));

-- Select as human-readable hex:
SELECT HEX(tx_hash_bin) FROM blockchain_transactions;
```

---

## ✅ Week 6 Checklist
- [ ] Diagram an InnoDB 3-level B+ Tree hierarchy (Root, Branch, Leaf).
- [ ] Explain why secondary indexes require clustered index bookmark lookups.
- [ ] Measure the performance penalty of 50-50 page splits from random hash keys.
- [ ] Apply binary packing (`BINARY(32)`) and surrogate integer keys to eliminate fragmentation.

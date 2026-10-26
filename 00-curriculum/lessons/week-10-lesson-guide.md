# Week 10 Comprehensive Lesson: Isolation Levels & MVCC Snapshot Mechanics

Welcome to **Week 10** of the MySQL Intermediate to Pro curriculum!

This lesson demystifies one of the most powerful concurrency engines in modern computer science: **Multi-Version Concurrency Control (MVCC)** in MySQL InnoDB. You will learn how MySQL allows thousands of concurrent readers to query balances without locking writers, how Read Views work under the hood, and how transaction isolation levels differ in production financial and blockchain systems.

---

## ⚡ Part 1: The Golden Rule of MVCC

> [!NOTE]
> **"Readers never block Writers, and Writers never block Readers."**
> In MySQL InnoDB (under `READ COMMITTED` and `REPEATABLE READ`), a simple `SELECT` query is a **Non-Locking Consistent Read**. It reads a historical snapshot of the data from the **Undo Log**, completely ignoring locks held by concurrent update transactions.

---

## 🧱 Part 2: InnoDB Hidden System Columns

Every row physically stored inside an InnoDB clustered index contains three hidden system columns:

| Column Name | Size | Purpose |
| :--- | :--- | :--- |
| **`DB_TRX_ID`** | 6 Bytes | The transaction ID that inserted or last updated this row. |
| **`DB_ROLL_PTR`** | 7 Bytes | Roll Pointer: A pointer to the previous version of this row in the **Undo Log**. |
| **`DB_ROW_ID`** | 6 Bytes | Auto-increment row ID generated only if the table has no explicit Primary Key. |

### The Undo Log Version Chain:
When transaction 105 updates an account balance from $500 to $700, and then transaction 110 updates it to $1000:

```
[Clustered Leaf Page]
Current Row: Balance = $1,000 | DB_TRX_ID = 110 | DB_ROLL_PTR ────┐
                                                                  ▼
[Undo Log Segment]                                       Version 2: Balance = $700 
                                                         DB_TRX_ID = 105 | DB_ROLL_PTR ──┐
                                                                                         ▼
                                                                                Version 1: Balance = $500
                                                                                DB_TRX_ID = 95 | DB_ROLL_PTR = NULL
```

If a concurrent query began when the database was at Transaction 100, MySQL traverses the roll pointer backward along the Undo Log chain until it finds a version committed prior to Transaction 100 ($500)!

---

## 🔍 Part 3: Read Committed vs Repeatable Read

The difference between the two most common isolation levels boils down to **when the Read View is created**:

### 1. `READ COMMITTED`
- A **new Read View is created for every single statement** within the transaction.
- If Transaction B commits a change between your first `SELECT` and second `SELECT`, you **will see the newly committed rows**.
- Subject to **Non-Repeatable Reads**.

### 2. `REPEATABLE READ` (MySQL Default)
- A single **Read View is created at the first `SELECT` statement** and remains frozen for the entire duration of the transaction.
- Even if 1,000 other transactions insert, update, or delete rows and commit, your transaction sees the exact same consistent snapshot.
- Eliminates **Dirty Reads** and **Non-Repeatable Reads**.

---

## 🛡️ Part 4: Locking Reads (`FOR UPDATE` & `FOR SHARE`)

When executing financial settlements or crypto balance deductions, snapshot reads are dangerous because two transactions could read the same balance concurrently and both spend it (Double-Spending problem).

To bypass MVCC and read the **current live physical row with an exclusive lock**:
```sql
-- Acquires an Exclusive (X) Record/Next-Key Lock:
SELECT balance_satoshis 
FROM crypto_accounts 
WHERE address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' 
FOR UPDATE;
```
Any other transaction attempting to modify or `SELECT ... FOR UPDATE` this row will wait until the active transaction issues `COMMIT` or `ROLLBACK`.

---

## ✅ Week 10 Checklist
- [ ] Name the 3 hidden system columns in an InnoDB clustered index row.
- [ ] Explain how the `DB_ROLL_PTR` traverses the Undo Log version chain.
- [ ] Describe the exact difference between `READ COMMITTED` and `REPEATABLE READ`.
- [ ] Prevent double-spending in financial transactions using `SELECT ... FOR UPDATE`.

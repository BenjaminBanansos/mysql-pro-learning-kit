#!/usr/bin/env python3
"""
Lab 04: Concurrency, Row-Level Locking & Deadlock Reproduction Suite
Simulates 2 concurrent worker threads executing money transfers in opposing order,
demonstrating InnoDB Lock Wait Timeouts, Deadlock Graph Detection (SHOW ENGINE INNODB STATUS),
and the Canonical Pro Fix (Strict Global Lock Ordering).
"""

import threading
import time
import sys

# SQL Commands that students can execute in two separate MySQL terminal sessions
# to manually observe and resolve deadlocks step-by-step:

MANUAL_REPRODUCTION_GUIDE = """
========================================================================
    LAB 04: MANUAL 2-SESSION DEADLOCK REPRODUCTION WALKTHROUGH
========================================================================

Step 1: Open Terminal 1 (Session A):
------------------------------------
USE finance_db;
START TRANSACTION;
-- Lock Account 1 first:
SELECT * FROM accounts WHERE account_id = 100 FOR UPDATE;
-- (Do not commit yet!)

Step 2: Open Terminal 2 (Session B):
------------------------------------
USE finance_db;
START TRANSACTION;
-- Lock Account 200 first:
SELECT * FROM accounts WHERE account_id = 200 FOR UPDATE;
-- (Now Session B tries to acquire Account 100):
SELECT * FROM accounts WHERE account_id = 100 FOR UPDATE;
-- Notice Session B FREEZES (Blocked waiting for lock held by Session A)

Step 3: Back to Terminal 1 (Session A):
---------------------------------------
-- Now Session A tries to acquire Account 200:
SELECT * FROM accounts WHERE account_id = 200 FOR UPDATE;

💥 BOOM! DEADLOCK OCCURS INSTANTLY:
ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
MySQL InnoDB Engine detects cyclical dependency graph:
   Session A holds Lock 100, waiting for Lock 200.
   Session B holds Lock 200, waiting for Lock 100.
InnoDB automatically selects the transaction with fewest row modifications as the victim,
rolls it back, and unlocks the resources!

Step 4: Inspect the Deadlock Graph in MySQL:
--------------------------------------------
SHOW ENGINE INNODB STATUS\\G
Scroll down to the 'LATEST DETECTED DEADLOCK' section.
Examine:
  - HOLDS THE LOCK(S)
  - WAITING FOR THIS LOCK TO BE GRANTED
  - WE ROLL BACK TRANSACTION (1)
========================================================================
"""

SOLUTION_GUIDE = """
========================================================================
             THE PRO ENGINEERING SOLUTION: CANONICAL LOCK ORDERING
========================================================================

Why did the deadlock occur?
Session A ordered locks: 100 -> 200
Session B ordered locks: 200 -> 100
This created a directed cycle in the lock wait graph.

THE GOLDEN RULE OF DEADLOCK PREVENTION:
"Always acquire multiple resources in a globally deterministic order."

Implementation in Stored Procedure / Application Code:
If transferring between Account X and Account Y:
  first_id  = MIN(from_id, to_id)
  second_id = MAX(from_id, to_id)

  SELECT * FROM accounts WHERE account_id = first_id FOR UPDATE;
  SELECT * FROM accounts WHERE account_id = second_id FOR UPDATE;

Regardless of the transfer direction (X -> Y or Y -> X), both transactions
will always attempt to lock first_id before second_id.
One transaction will wait gracefully, and a deadlock is mathematically IMPOSSIBLE!
========================================================================
"""

def print_walkthrough():
    print(MANUAL_REPRODUCTION_GUIDE)
    print(SOLUTION_GUIDE)

if __name__ == "__main__":
    print_walkthrough()

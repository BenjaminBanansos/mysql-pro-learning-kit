-- ========================================================================
-- Portfolio Project 2: Production Safe Money Transfer Stored Procedure
-- Database: finance_db
-- Focus: Deadlock Immunity, ACID Isolation, Error Handlers, Audit Trail
-- ========================================================================

USE finance_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_execute_safe_transfer$$

CREATE PROCEDURE sp_execute_safe_transfer(
    IN p_from_account BIGINT UNSIGNED,
    IN p_to_account BIGINT UNSIGNED,
    IN p_amount DECIMAL(15,2),
    OUT p_status_code INT,
    OUT p_status_message VARCHAR(255)
)
proc_body: BEGIN
    DECLARE v_first_lock BIGINT UNSIGNED;
    DECLARE v_second_lock BIGINT UNSIGNED;
    DECLARE v_from_balance DECIMAL(15,2);
    DECLARE v_from_status VARCHAR(20);
    DECLARE v_to_status VARCHAR(20);
    DECLARE v_new_txn_id BIGINT UNSIGNED;

    -- Error Handler: Automatically Rollback on any SQL Exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_status_message = MESSAGE_TEXT;
        ROLLBACK;
        SET p_status_code = 500;
    END;

    -- STEP 1: Input Validation
    IF p_from_account = p_to_account THEN
        SET p_status_code = 400;
        SET p_status_message = 'Cannot transfer funds to the same account';
        LEAVE proc_body;
    END IF;

    IF p_amount <= 0.00 THEN
        SET p_status_code = 400;
        SET p_status_message = 'Transfer amount must be strictly greater than zero';
        LEAVE proc_body;
    END IF;

    -- STEP 2: Canonical Deterministic Lock Ordering (Eliminates Deadlocks)
    SET v_first_lock = LEAST(p_from_account, p_to_account);
    SET v_second_lock = GREATEST(p_from_account, p_to_account);

    -- Begin Explicit Transaction
    START TRANSACTION;

    -- Lock both account rows in strictly ascending primary key order
    -- This prevents cyclical lock waits regardless of transfer direction!
    PERFORM_FIRST_LOCK: BEGIN
        SELECT current_balance, status 
        INTO v_from_balance, v_from_status
        FROM accounts 
        WHERE account_id = v_first_lock 
        FOR UPDATE;
    END;

    PERFORM_SECOND_LOCK: BEGIN
        SELECT status 
        INTO v_to_status
        FROM accounts 
        WHERE account_id = v_second_lock 
        FOR UPDATE;
    END;

    -- Re-fetch source account data cleanly under locked snapshot
    SELECT current_balance, status 
    INTO v_from_balance, v_from_status
    FROM accounts 
    WHERE account_id = p_from_account;

    SELECT status 
    INTO v_to_status
    FROM accounts 
    WHERE account_id = p_to_account;

    -- STEP 3: Verify Account Statuses and Balance
    IF v_from_status != 'ACTIVE' THEN
        ROLLBACK;
        SET p_status_code = 403;
        SET p_status_message = 'Source account is frozen or inactive';
        LEAVE proc_body;
    END IF;

    IF v_to_status != 'ACTIVE' THEN
        ROLLBACK;
        SET p_status_code = 403;
        SET p_status_message = 'Destination account is frozen or inactive';
        LEAVE proc_body;
    END IF;

    IF v_from_balance < p_amount THEN
        ROLLBACK;
        SET p_status_code = 402;
        SET p_status_message = 'Insufficient funds for requested transfer';
        LEAVE proc_body;
    END IF;

    -- STEP 4: Debit Source & Credit Target
    UPDATE accounts 
    SET current_balance = current_balance - p_amount,
        version = version + 1
    WHERE account_id = p_from_account;

    UPDATE accounts 
    SET current_balance = current_balance + p_amount,
        version = version + 1
    WHERE account_id = p_to_account;

    -- STEP 5: Create Immutable Ledger Record
    INSERT INTO financial_transactions 
        (from_account_id, to_account_id, amount, currency, status, txn_type, is_flagged, created_at)
    VALUES 
        (p_from_account, p_to_account, p_amount, 'USD', 'SETTLED', 'TRANSFER', 0, NOW());

    SET v_new_txn_id = LAST_INSERT_ID();

    -- STEP 6: Append to Audit Log
    INSERT INTO transaction_audit_log (txn_id, previous_status, new_status, notes)
    VALUES (v_new_txn_id, 'PENDING', 'SETTLED', 'Automated atomic safe transfer completed successfully');

    -- Commit transaction
    COMMIT;

    SET p_status_code = 200;
    SET p_status_message = 'Transfer completed successfully';
END proc_body$$

DELIMITER ;

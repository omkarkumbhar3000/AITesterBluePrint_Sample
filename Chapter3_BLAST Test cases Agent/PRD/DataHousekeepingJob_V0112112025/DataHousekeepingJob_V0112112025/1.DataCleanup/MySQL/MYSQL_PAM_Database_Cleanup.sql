-- DROP any existing procedure of the same name (safe re-run)
DROP PROCEDURE IF EXISTS Cleanup_ArconPam;
DELIMITER $$

CREATE PROCEDURE Cleanup_ArconPam()
BEGIN
  DECLARE rows_affected INT DEFAULT 1;
  DECLARE idx_count INT DEFAULT 0;

  -- make sure we operate on current DB; change if you want a specific schema:
  SET @schema := DATABASE();

  -- Improve performance: disable autocommit inside procedure and commit explicitly
  SET autocommit = 0;

  -- 1. TRUNCATE LOG / TEMP TABLES
  
  START TRANSACTION;
    TRUNCATE TABLE sso_arcos_applicationlog;
    TRUNCATE TABLE ArconPamApiLog;
    TRUNCATE TABLE sso_ApiRequestResponseDetails;
    TRUNCATE TABLE sso_error_logs;
    TRUNCATE TABLE sso_execheck;
    TRUNCATE TABLE SIEMARCOSLog;
    TRUNCATE TABLE SIEMARCOSCommandLog;
  COMMIT;

  
  -- 2. CREATE TEMPORARY INDEXES (if not exists)
  
  -- SIEMARCOSenvision.EventTimeStamp
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'SIEMARCOSenvision'
     AND INDEX_NAME = 'idx_tmp_SIEMARCOSenvision_EventTimeStamp';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_SIEMARCOSenvision_EventTimeStamp 
      ON SIEMARCOSenvision (EventTimeStamp);
  END IF;

  -- sso_service_log_realtime.slr_started_on
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_service_log_realtime'
     AND INDEX_NAME = 'idx_tmp_sso_service_log_realtime_started';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_sso_service_log_realtime_started 
      ON sso_service_log_realtime (slr_started_on);
  END IF;

  -- sso_arcos_out_box.aob_created_on
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_arcos_out_box'
     AND INDEX_NAME = 'idx_tmp_sso_arcos_out_box_created';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_sso_arcos_out_box_created 
      ON sso_arcos_out_box (aob_created_on);
  END IF;

  -- sso_Api_User_Log.LogInDateTime
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_Api_User_Log'
     AND INDEX_NAME = 'idx_tmp_sso_Api_User_Log_login';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_sso_Api_User_Log_login 
      ON sso_Api_User_Log (LogInDateTime);
  END IF;

  -- sso_users_services_timebased_command composite
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_users_services_timebased_command'
     AND INDEX_NAME = 'idx_tmp_sso_users_services_timebased_command_dup';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_sso_users_services_timebased_command_dup
      ON sso_users_services_timebased_command (stc_ust_id, stc_ssc_id, stc_id);
  END IF;

  -- sso_user_restricted_commands composite
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_user_restricted_commands'
     AND INDEX_NAME = 'idx_tmp_sso_user_restricted_commands_dup';
  IF idx_count = 0 THEN
    CREATE INDEX idx_tmp_sso_user_restricted_commands_dup
      ON sso_user_restricted_commands (sus_service_id, sus_sud_id, ssc_id, surc_id);
  END IF;

  COMMIT;

  
  -- 3. BATCH DELETE OLD DATA
  -- Use LIMIT 10000 per iteration and small sleep
  

  -- SIEMARCOSenvision: older than 1 day
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM SIEMARCOSenvision
    WHERE EventTimeStamp < (NOW() - INTERVAL 1 DAY)
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1); -- yield a second
    END IF;
  END WHILE;

  -- sso_service_log_realtime: older than 7 days
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM sso_service_log_realtime
    WHERE slr_started_on < (NOW() - INTERVAL 7 DAY)
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1);
    END IF;
  END WHILE;

  -- sso_arcos_out_box: older than 1 day
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM sso_arcos_out_box
    WHERE aob_created_on < (NOW() - INTERVAL 1 DAY)
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1);
    END IF;
  END WHILE;

  -- sso_Api_User_Log: older than 1 hour
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM sso_Api_User_Log
    WHERE LogInDateTime < (NOW() - INTERVAL 1 HOUR)
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1);
    END IF;
  END WHILE;

  COMMIT;

  
  -- 4. REMOVE DUPLICATES FROM sso_users_services_timebased_command
  -- Keep the MIN(stc_id) per (stc_ust_id, stc_ssc_id)
  
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM sso_users_services_timebased_command
    WHERE stc_id NOT IN (
      SELECT id_keep FROM (
        SELECT MIN(stc_id) AS id_keep
        FROM sso_users_services_timebased_command
        GROUP BY stc_ust_id, stc_ssc_id
      ) AS keep_set
    )
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1);
    END IF;
  END WHILE;

  COMMIT;

  
  -- 5. REMOVE DUPLICATES FROM sso_user_restricted_commands
  -- Keep the MIN(surc_id) per (sus_service_id, sus_sud_id, ssc_id)
  
  SET rows_affected = 1;
  WHILE rows_affected > 0 DO
    DELETE FROM sso_user_restricted_commands
    WHERE surc_id NOT IN (
      SELECT id_keep FROM (
        SELECT MIN(surc_id) AS id_keep
        FROM sso_user_restricted_commands
        GROUP BY sus_service_id, sus_sud_id, ssc_id
      ) AS keep_set
    )
    LIMIT 10000;
    SET rows_affected = ROW_COUNT();
    IF rows_affected > 0 THEN
      COMMIT;
      SELECT SLEEP(1);
    END IF;
  END WHILE;

  COMMIT;

  
  -- 6. DROP TEMPORARY INDEXES (if they were created)
  
  -- We check before dropping to avoid errors on DROP
  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'SIEMARCOSenvision'
     AND INDEX_NAME = 'idx_tmp_SIEMARCOSenvision_EventTimeStamp';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_SIEMARCOSenvision_EventTimeStamp ON SIEMARCOSenvision;
  END IF;

  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_service_log_realtime'
     AND INDEX_NAME = 'idx_tmp_sso_service_log_realtime_started';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_sso_service_log_realtime_started ON sso_service_log_realtime;
  END IF;

  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_arcos_out_box'
     AND INDEX_NAME = 'idx_tmp_sso_arcos_out_box_created';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_sso_arcos_out_box_created ON sso_arcos_out_box;
  END IF;

  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_Api_User_Log'
     AND INDEX_NAME = 'idx_tmp_sso_Api_User_Log_login';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_sso_Api_User_Log_login ON sso_Api_User_Log;
  END IF;

  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_users_services_timebased_command'
     AND INDEX_NAME = 'idx_tmp_sso_users_services_timebased_command_dup';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_sso_users_services_timebased_command_dup
      ON sso_users_services_timebased_command;
  END IF;

  SELECT COUNT(*) INTO idx_count
    FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema
     AND TABLE_NAME = 'sso_user_restricted_commands'
     AND INDEX_NAME = 'idx_tmp_sso_user_restricted_commands_dup';
  IF idx_count > 0 THEN
    DROP INDEX idx_tmp_sso_user_restricted_commands_dup
      ON sso_user_restricted_commands;
  END IF;

  COMMIT;

  -- Final message
  SELECT 'Data cleanup completed successfully!' AS Result;

  -- Restore autocommit to default ON for the session (optional)
  SET autocommit = 1;
END$$

DELIMITER ;

-- Call the procedure
CALL Cleanup_ArconPam();

-- (Optional) Drop the procedure if you don't want it kept:
-- DROP PROCEDURE IF EXISTS Cleanup_ArconPam;

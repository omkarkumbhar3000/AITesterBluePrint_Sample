SET NOCOUNT ON;

------------------------------------------------------------
-- 1. TRUNCATE ERROR, INFO DATA
------------------------------------------------------------

TRUNCATE TABLE	sso_arcos_applicationlog
TRUNCATE TABLE	ArconPamApiLog
TRUNCATE TABLE	sso_ApiRequestResponseDetails
TRUNCATE TABLE	sso_error_logs
TRUNCATE TABLE	sso_execheck
TRUNCATE TABLE SIEMARCOSLog
TRUNCATE TABLE SIEMARCOSCommandLog

------------------------------------------------------------
-- 2. CREATE TEMPORARY INDEXES FOR PERFORMANCE
------------------------------------------------------------

CREATE INDEX idx_tmp_SIEMARCOSenvision_EventTimeStamp 
ON SIEMARCOSenvision (EventTimeStamp);

CREATE INDEX idx_tmp_sso_service_log_realtime_started 
ON sso_service_log_realtime (slr_started_on);

CREATE INDEX idx_tmp_sso_arcos_out_box_created 
ON sso_arcos_out_box (aob_created_on);

CREATE INDEX idx_tmp_sso_Api_User_Log_login 
ON sso_Api_User_Log (LogInDateTime);

CREATE INDEX idx_tmp_sso_users_services_timebased_command_dup
ON sso_users_services_timebased_command (stc_ust_id, stc_ssc_id, stc_id);

CREATE INDEX idx_tmp_sso_user_restricted_commands_dup
ON sso_user_restricted_commands (sus_service_id, sus_sud_id, ssc_id, surc_id);

------------------------------------------------------------
-- 3. BATCH DELETE OLD DATA (NO STORED PROCEDURES)
------------------------------------------------------------

-- Delete from SIEMARCOSenvision (older than 1 day)
WHILE 1 = 1
BEGIN
    DELETE TOP (10000)
    FROM SIEMARCOSenvision
    WHERE EventTimeStamp < DATEADD(DAY, -1, GETDATE());

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

-- Delete from sso_service_log_realtime (older than 7 days)
WHILE 1 = 1
BEGIN
    DELETE TOP (10000)
    FROM sso_service_log_realtime
    WHERE slr_started_on < DATEADD(DAY, -7, GETDATE());

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

-- Delete from sso_arcos_out_box (older than 1 day)
WHILE 1 = 1
BEGIN
    DELETE TOP (10000)
    FROM sso_arcos_out_box
    WHERE aob_created_on < DATEADD(DAY, -1, GETDATE());

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

-- Delete from sso_Api_User_Log (older than 1 hour)
WHILE 1 = 1
BEGIN
    DELETE TOP (10000)
    FROM sso_Api_User_Log
    WHERE LogInDateTime < DATEADD(HOUR, -1, GETDATE());

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

------------------------------------------------------------
-- 4. REMOVE DUPLICATES FROM sso_users_services_timebased_command
------------------------------------------------------------
-- Remove duplicates by keeping the smallest stc_id per (stc_ust_id, stc_ssc_id)

WHILE 1 = 1
BEGIN
    ;WITH CTE_Duplicates AS (
        SELECT stc_id,
               ROW_NUMBER() OVER (PARTITION BY stc_ust_id, stc_ssc_id ORDER BY stc_id) AS rn
        FROM sso_users_services_timebased_command
    )
    DELETE TOP (10000)
    FROM sso_users_services_timebased_command
    WHERE stc_id IN (
        SELECT stc_id FROM CTE_Duplicates WHERE rn > 1
    );

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

------------------------------------------------------------
-- 5. REMOVE DUPLICATES FROM sso_user_restricted_commands
------------------------------------------------------------
-- Remove duplicates by keeping the smallest surc_id per (sus_service_id, sus_sud_id, ssc_id)
WHILE 1 = 1
BEGIN
    ;WITH CTE_Duplicates AS (
        SELECT surc_id,
               ROW_NUMBER() OVER (PARTITION BY sus_service_id, sus_sud_id, ssc_id ORDER BY surc_id) AS rn
        FROM sso_user_restricted_commands
    )
    DELETE TOP (10000)
    FROM sso_user_restricted_commands
    WHERE surc_id IN (
        SELECT surc_id FROM CTE_Duplicates WHERE rn > 1
    );

    IF @@ROWCOUNT = 0 BREAK;
    WAITFOR DELAY '00:00:01';
END;

------------------------------------------------------------
-- 6. DROP TEMPORARY INDEXES AFTER CLEANUP
------------------------------------------------------------
DROP INDEX idx_tmp_SIEMARCOSenvision_EventTimeStamp ON SIEMARCOSenvision;
DROP INDEX idx_tmp_sso_service_log_realtime_started ON sso_service_log_realtime;
DROP INDEX idx_tmp_sso_arcos_out_box_created ON sso_arcos_out_box;
DROP INDEX idx_tmp_sso_Api_User_Log_login ON sso_Api_User_Log;
DROP INDEX idx_tmp_sso_users_services_timebased_command_dup ON sso_users_services_timebased_command;
DROP INDEX idx_tmp_sso_user_restricted_commands_dup ON sso_user_restricted_commands;

PRINT 'Data cleanup completed successfully!';

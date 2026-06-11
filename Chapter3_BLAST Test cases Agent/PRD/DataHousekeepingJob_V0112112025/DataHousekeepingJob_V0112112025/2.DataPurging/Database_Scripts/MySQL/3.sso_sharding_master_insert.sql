SET @retention_period = 365;
SET @backup_database_name = 'ARCOSDB_SH_20241202'; -- Replace with the current date (e.g., 20240101)

INSERT INTO sso_sharding_master 
    (ssm_sharding_name, ssm_start_date, ssm_end_date, ssm_status)
SELECT 
    @backup_database_name AS ssm_sharding_name,
    (SELECT sul_active_from FROM sso_user_log LIMIT 1) AS ssm_start_date,
    (CURDATE() - INTERVAL @retention_period DAY) AS ssm_end_date,
    'WIP' AS ssm_status
WHERE NOT EXISTS (SELECT 1 FROM sso_sharding_master WHERE ssm_sharding_name = @backup_database_name);

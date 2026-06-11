CREATE TABLE IF NOT EXISTS sso_cleanup_log (
    scl_log_id INT AUTO_INCREMENT NOT NULL,
    scl_table_name VARCHAR(256) NULL,
    scl_column_name VARCHAR(256) NULL,
    scl_total_count INT NULL,
    scl_deleted_count INT NULL,
    scl_timestamps DATETIME NULL,
    PRIMARY KEY (scl_log_id)
);
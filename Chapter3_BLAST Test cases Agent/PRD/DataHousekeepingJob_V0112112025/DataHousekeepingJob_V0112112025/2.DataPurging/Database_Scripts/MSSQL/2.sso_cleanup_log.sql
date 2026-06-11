IF NOT EXISTS (SELECT * FROM  sys.tables WHERE  object_id = OBJECT_ID(N'sso_cleanup_log'))
BEGIN
CREATE TABLE sso_cleanup_log(
    scl_log_id INT IDENTITY(1,1) NOT NULL,
    scl_table_name NVARCHAR(256) NULL,
    scl_column_name NVARCHAR(256) NULL,
    scl_total_count INT NULL,
    scl_deleted_count INT NULL,
    scl_timestamps DATETIME NULL,
    PRIMARY KEY (scl_log_id)  
	)
END
GO



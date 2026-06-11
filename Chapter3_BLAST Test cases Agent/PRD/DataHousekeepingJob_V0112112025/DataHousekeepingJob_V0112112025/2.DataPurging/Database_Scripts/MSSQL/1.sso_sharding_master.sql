IF NOT EXISTS (SELECT * FROM  sys.tables WHERE  object_id = OBJECT_ID(N'sso_sharding_master'))
BEGIN
	CREATE TABLE sso_sharding_master(
		ssm_id INT IDENTITY(1,1) NOT NULL,
		ssm_sharding_name VARCHAR (255) NULL,
		ssm_start_date DATETIME NULL,
		ssm_end_date DATETIME NULL,
		ssm_status VARCHAR (50) NULL
	) ON [PRIMARY]
END
GO
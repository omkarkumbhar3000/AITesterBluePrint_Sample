CREATE TABLE IF NOT EXISTS sso_sharding_master (
    ssm_id INT AUTO_INCREMENT NOT NULL,
    ssm_sharding_name VARCHAR(255) NULL,
    ssm_start_date DATETIME NULL,
    ssm_end_date DATETIME NULL,
    ssm_status VARCHAR(50) NULL,
    PRIMARY KEY (ssm_id)
);

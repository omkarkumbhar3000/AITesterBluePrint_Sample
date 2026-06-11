declare @retention_period int = 365
declare @backup_database_name varchar(255) = 'ARCOSDB__Shard_20251104' -- Put current date (eg. 20240101) at the place of "yyyyMMdd"

insert into sso_sharding_master 
	   (ssm_sharding_name
	   ,ssm_start_date
	   ,ssm_end_date
	   ,ssm_status)
select @backup_database_name as ssm_sharding_name
       ,(select top 1 sul_active_from  from sso_user_log order by sul_id asc) as ssm_start_date
       ,(GETDATE()-@retention_period) as ssm_end_date
	   ,'WIP' as ssm_status
where not exists(select 1 from sso_sharding_master where ssm_sharding_name = @backup_database_name)


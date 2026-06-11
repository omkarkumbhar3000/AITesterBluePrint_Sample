;WITH CET_Large_Tables As (
SELECT t.Name AS TableName
      ,p.rows AS RowCounts
	  ,CAST(ROUND((SUM(a.used_pages) / 128.00), 2) AS NUMERIC(36, 2)) AS Used_MB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
GROUP BY t.Name, p.Rows)

SELECT * FROM CET_Large_Tables
ORDER BY Used_MB desc;
GO

select * from sso_sharding_master;
GO

select * from sso_cleanup_log
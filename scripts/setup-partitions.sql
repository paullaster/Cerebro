-- Enable partitioning extension
CREATE EXTENSION IF NOT EXISTS pg_partman;

-- Create parent table (already defined in Prisma)
-- Collections table partitioning by month
SELECT partman.create_parent(
    p_parent_table := 'public.collections',
    p_control := 'partition_date',
    p_type := 'native',
    p_interval := '1 month',
    p_premake := 3,
    p_start_partition := '2024-01-01 00:00:00'::text
);

-- Create partitions for audit_logs
SELECT partman.create_parent(
    p_parent_table := 'audit.audit_logs',
    p_control := 'timestamp',
    p_type := 'native',
    p_interval := '1 month',
    p_premake := 3
);

-- Create default indexes on child tables
-- These will be inherited by all partitions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collections_farmer_status 
ON public.collections (farmer_id, status, partition_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collections_agent_date 
ON public.collections (store_agent_id, partition_date DESC);

-- Set up retention policy (keep 36 months of data)
UPDATE partman.part_config 
SET retention = '36 months', retention_keep_table = false
WHERE parent_table IN ('public.collections', 'audit.audit_logs');

-- Run maintenance to create initial partitions
SELECT partman.run_maintenance('public.collections');
SELECT partman.run_maintenance('audit.audit_logs');
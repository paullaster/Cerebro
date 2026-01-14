-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_partman";

-- Create partitions schema
CREATE SCHEMA IF NOT EXISTS partitions;

-- Function to generate UUID v7
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid AS $$
DECLARE
  v_time timestamp with time zone:= null;
  v_secs decimal(20, 6) := null;
  v_usec decimal(20, 6) := null;
  v_timestamp_hex varchar(16) := null;
  v_timestamp_bytes bytea;
  v_random_bytes bytea;
  v_bytes bytea;
BEGIN
  -- Get current timestamp in microseconds
  v_time := clock_timestamp();
  v_secs := EXTRACT(EPOCH FROM v_time);
  v_usec := (v_secs * 1000000) % 1000000;
  v_secs := FLOOR(v_secs);
  
  -- Convert to hexadecimal
  v_timestamp_hex := lpad(to_hex((v_secs * 1000 + FLOOR(v_usec / 1000))::bigint), 12, '0')
                   || lpad(to_hex((v_usec % 1000 * 1000)::bigint), 4, '0');
  
  -- Convert hex to bytes
  v_timestamp_bytes := decode(v_timestamp_hex, 'hex');
  
  -- Generate random bytes for the rest
  v_random_bytes := gen_random_bytes(10);
  
  -- Construct the UUID bytes
  v_bytes := substring(v_timestamp_bytes from 1 for 6)
           || substring(v_random_bytes from 1 for 2)
           || set_byte(substring(v_random_bytes from 3 for 4), 0, (b'0111'::bit(4)::integer << 4) | (get_byte(substring(v_random_bytes from 3 for 4), 0) & b'00001111'::bit(4)::integer))
           || set_byte(substring(v_random_bytes from 7 for 4), 0, (b'10'::bit(2)::integer << 6) | (get_byte(substring(v_random_bytes from 7 for 4), 0) & b'00111111'::bit(8)::integer));
  
  RETURN encode(v_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql;

-- Create parent collection table
CREATE TABLE IF NOT EXISTS public.collections (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  store_agent_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  farmer_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  produce_type_id         UUID NOT NULL REFERENCES public.produce_types(id) ON DELETE RESTRICT,
  weight_kg               DECIMAL(10, 2) NOT NULL CHECK (weight_kg > 0),
  quality_grade           VARCHAR(1) NOT NULL CHECK (quality_grade IN ('A', 'B', 'C')),
  applied_rate            DECIMAL(12, 4) NOT NULL,
  calculated_payout_amount DECIMAL(14, 4) NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'DISPUTED', 'PAID', 'CANCELLED', 'WASTED')),
  notes                   TEXT,
  collected_at            TIMESTAMPTZ NOT NULL,
  verified_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Partition key
  partition_date          DATE NOT NULL DEFAULT CURRENT_DATE
) PARTITION BY RANGE (partition_date);

-- Create partition for current month
CREATE TABLE IF NOT EXISTS partitions.collections_y2024_m01 
PARTITION OF public.collections
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Set up pg_partman for automated partitioning
SELECT partman.create_parent(
  p_parent_table := 'public.collections',
  p_control := 'partition_date',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3,
  p_start_partition := '2024-01-01'::text
);

-- Create indexes on parent (will be inherited by partitions)
CREATE INDEX IF NOT EXISTS idx_collections_farmer_status ON public.collections(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_collections_agent_date ON public.collections(store_agent_id, partition_date DESC);
CREATE INDEX IF NOT EXISTS idx_collections_status_date ON public.collections(status, partition_date);
CREATE INDEX IF NOT EXISTS idx_collections_produce_date ON public.collections(produce_type_id, partition_date);

-- Create similar partitioned tables for audit_logs and wastage_records
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  actor_user_id   UUID REFERENCES public.users(id),
  action          VARCHAR(100) NOT NULL,
  target_resource VARCHAR(100) NOT NULL,
  target_id       VARCHAR(100) NOT NULL,
  old_value       JSONB,
  new_value       JSONB,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

SELECT partman.create_parent(
  p_parent_table := 'public.audit_logs',
  p_control := 'created_at',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3
);

-- Set retention policy (keep 36 months)
UPDATE partman.part_config 
SET retention = '36 months', retention_keep_table = false
WHERE parent_table IN ('public.collections', 'public.audit_logs');

-- Create maintenance job for partitions
SELECT partman.run_maintenance();
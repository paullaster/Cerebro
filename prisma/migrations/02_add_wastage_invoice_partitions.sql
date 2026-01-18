-- Create partitioned WastageRecord table
CREATE TABLE IF NOT EXISTS public.wastage_records (
  id                      UUID DEFAULT uuid_generate_v7(),
  collection_id           UUID REFERENCES public.collections(id), -- Nullable as per PRD
  agent_id                UUID NOT NULL REFERENCES public.users(id),
  produce_type_id         UUID NOT NULL REFERENCES public.produce_types(id),
  weight_kg               DECIMAL(10, 2) NOT NULL CHECK (weight_kg > 0),
  reason                  VARCHAR(50) NOT NULL CHECK (reason IN ('SPOILAGE', 'THEFT', 'QUALITY_REJECTION')),
  declared_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Partition key (using declared_at as it correlates with created_at/date)
  partition_date          DATE NOT NULL DEFAULT CURRENT_DATE,

  CONSTRAINT pk_wastage_records PRIMARY KEY (id, partition_date)
) PARTITION BY RANGE (partition_date);

-- Create partition for current month
CREATE TABLE IF NOT EXISTS partitions.wastage_records_y2024_m01 
PARTITION OF public.wastage_records
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Setup pg_partman for WastageRecord
SELECT partman.create_parent(
  p_parent_table := 'public.wastage_records',
  p_control := 'partition_date',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3,
  p_start_partition := '2024-01-01'::text
);

-- Indexes for WastageRecord
CREATE INDEX IF NOT EXISTS idx_wastage_agent_date ON public.wastage_records(agent_id, partition_date DESC);
CREATE INDEX IF NOT EXISTS idx_wastage_produce_date ON public.wastage_records(produce_type_id, partition_date);
CREATE INDEX IF NOT EXISTS idx_wastage_collection ON public.wastage_records(collection_id);


-- Create partitioned Invoice table
CREATE TABLE IF NOT EXISTS public.invoices (
  id                      UUID DEFAULT uuid_generate_v7(),
  collection_id           UUID NOT NULL, -- Logical FK, but strict FK might be hard if across partitions or if collection_id isn't in partition key. 
                                         -- However, Collection is also partitioned. 
                                         -- Let's assume logical FK or constraint if possible.
  amount                  DECIMAL(14, 4) NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
  qr_code_url             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Partition key
  partition_date          DATE NOT NULL DEFAULT CURRENT_DATE,

  CONSTRAINT pk_invoices PRIMARY KEY (id, partition_date)
) PARTITION BY RANGE (partition_date);

-- Create partition for current month
CREATE TABLE IF NOT EXISTS partitions.invoices_y2024_m01 
PARTITION OF public.invoices
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Setup pg_partman for Invoice
SELECT partman.create_parent(
  p_parent_table := 'public.invoices',
  p_control := 'partition_date',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3,
  p_start_partition := '2024-01-01'::text
);

-- Indexes for Invoice
CREATE INDEX IF NOT EXISTS idx_invoices_collection ON public.invoices(collection_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status_date ON public.invoices(status, partition_date);

-- Retention Policy Update
UPDATE partman.part_config 
SET retention = '36 months', retention_keep_table = false
WHERE parent_table IN ('public.wastage_records', 'public.invoices');

-- Run maintenance
SELECT partman.run_maintenance('public.wastage_records');
SELECT partman.run_maintenance('public.invoices');

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id           SERIAL PRIMARY KEY,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  email        VARCHAR(255),
  phone        VARCHAR(50),
  sex          VARCHAR(10),
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- DNA file uploads
CREATE TABLE IF NOT EXISTS dna_files (
  id           SERIAL PRIMARY KEY,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  filename     VARCHAR(255) NOT NULL,
  file_format  VARCHAR(20) NOT NULL CHECK (file_format IN ('23andme', 'tellmegen', 'unknown')),
  total_snps   INTEGER DEFAULT 0,
  status       VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  error_msg    TEXT,
  uploaded_at  TIMESTAMP DEFAULT NOW()
);

-- Individual SNP records per patient
CREATE TABLE IF NOT EXISTS patient_snps (
  id           BIGSERIAL PRIMARY KEY,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_id      INTEGER NOT NULL REFERENCES dna_files(id) ON DELETE CASCADE,
  rsid         VARCHAR(100) NOT NULL,
  chromosome   VARCHAR(10),
  position     BIGINT,
  genotype     VARCHAR(10),
  UNIQUE (patient_id, rsid)
);

-- Gene reference cache (populated from NCBI API)
CREATE TABLE IF NOT EXISTS gene_reference (
  id                    SERIAL PRIMARY KEY,
  rsid                  VARCHAR(100) UNIQUE NOT NULL,
  gene_name             VARCHAR(200),
  gene_id               VARCHAR(50),
  chromosome            VARCHAR(10),
  position              BIGINT,
  clinical_significance TEXT,
  alleles               TEXT,
  global_maf            TEXT,
  enriched_at           TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_patient_snps_patient     ON patient_snps (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_snps_rsid        ON patient_snps (rsid);
CREATE INDEX IF NOT EXISTS idx_patient_snps_chrom_pos   ON patient_snps (chromosome, position);
CREATE INDEX IF NOT EXISTS idx_patient_snps_pid_rsid    ON patient_snps (patient_id, rsid);

CREATE INDEX IF NOT EXISTS idx_gene_ref_rsid            ON gene_reference (rsid);
CREATE INDEX IF NOT EXISTS idx_gene_ref_gene_name       ON gene_reference (gene_name);
CREATE INDEX IF NOT EXISTS idx_gene_ref_chrom_pos       ON gene_reference (chromosome, position);
CREATE INDEX IF NOT EXISTS idx_gene_ref_gene_trgm       ON gene_reference USING GIN (gene_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_dna_files_patient        ON dna_files (patient_id);

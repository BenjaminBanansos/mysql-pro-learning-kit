-- Phase 1 Capstone Milestone: Scaffold Warehouse Schema Blueprint
-- Data Dictionary and Initial Relational Table Definitions
CREATE TABLE IF NOT EXISTS warehouse_metadata (
  entity_id INTEGER PRIMARY KEY,
  entity_name TEXT NOT NULL UNIQUE,
  domain_category TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

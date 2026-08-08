-- Supabase / Postgres migration reference (not used in M1 local dev)
-- Mirrors prisma/schema.prisma for production deployment.
-- TODO: apply via `supabase migration new initial` when moving off SQLite.

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TODO(RLS): Enable row level security on every table below.
-- Example policy pattern (adjust when auth.uid() is wired):

/*
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspace_member_select ON workspaces
  FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()  -- map to Supabase auth user
    )
  );
*/

-- Enum types (Postgres)
-- CREATE TYPE member_role AS ENUM ('OWNER', 'OFFICER', 'MEMBER');
-- CREATE TYPE event_status AS ENUM ('PLANNING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
-- CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
-- CREATE TYPE draft_channel AS ENUM ('EMAIL', 'SLACK');
-- CREATE TYPE draft_status AS ENUM ('DRAFT', 'AWAITING_APPROVAL', 'SENT', 'REJECTED');

-- See prisma/schema.prisma for full field definitions.
-- Tables: workspaces, workspace_members, partners, contacts, events,
--         tasks, run_of_show_items, drafts, metrics, follow_ups

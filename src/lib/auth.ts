/**
 * Auth stub — NextAuth / Supabase Auth ready.
 *
 * M1 uses a development bypass. Replace `getSession` with real session lookup
 * (NextAuth `auth()` or Supabase `getUser`) before production.
 *
 * Multi-tenant scoping:
 * - Every query MUST filter by workspaceId from the authenticated member's workspace.
 * - TODO(RLS): When migrating to Supabase Postgres, enable RLS on all tables and
 *   add policies like:
 *     CREATE POLICY workspace_select ON events FOR SELECT
 *       USING (workspace_id IN (
 *         SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
 *       ));
 * - Never trust client-supplied workspaceId without verifying membership.
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type Session = {
  user: SessionUser;
};

const DEV_USER: SessionUser = {
  id: "dev-user-1",
  email: "officer@club.example",
  name: "Dev Officer",
};

export async function getSession(): Promise<Session | null> {
  if (process.env.COOK_AUTH_BYPASS === "true") {
    return { user: DEV_USER };
  }

  // TODO: wire NextAuth or Supabase Auth
  // const session = await auth();
  // if (!session?.user) return null;
  // return session;

  return null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

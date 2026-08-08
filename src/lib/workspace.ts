import { db } from "@/lib/db";

/**
 * Resolve the active workspace for the current request.
 * M1: uses COOK_WORKSPACE_ID env or the first workspace in the database.
 *
 * TODO: derive from authenticated user's membership once real auth ships.
 */
export async function getActiveWorkspaceId(): Promise<string | null> {
  const pinned = process.env.COOK_WORKSPACE_ID;
  if (pinned) {
    const ws = await db.workspace.findUnique({ where: { id: pinned } });
    if (ws) return ws.id;
  }

  const first = await db.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  return first?.id ?? null;
}

export async function requireActiveWorkspaceId(): Promise<string> {
  const id = await getActiveWorkspaceId();
  if (!id) {
    throw new Error("No workspace found. Create one from the Home screen.");
  }
  return id;
}

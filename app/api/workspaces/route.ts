import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { getStore, toWorkspaceDto } from "@/lib/db";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const workspaces = await getStore().listWorkspaces(user.id);
  return NextResponse.json({ workspaces: workspaces.map(toWorkspaceDto) });
}

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    flow?: import("@/lib/accounts/flowPersistence").PersistedFlow;
  };
  const name = body.name?.trim().slice(0, 60) || "Neuer Plan";

  const store = getStore();
  const workspace = await store.createWorkspace(user.id, name);
  // Optionaler Startzustand: übernimmt einen mitgeschickten Flow (z. B. Migration).
  if (body.flow) {
    await store.saveFlow(user.id, workspace.id, body.flow);
  }

  return NextResponse.json({ workspace: toWorkspaceDto(workspace) });
}

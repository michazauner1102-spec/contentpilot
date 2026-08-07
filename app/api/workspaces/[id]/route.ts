import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { getStore, toWorkspaceDto } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim().slice(0, 60);
  if (!name) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }

  const workspace = await getStore().renameWorkspace(user.id, id, name);
  if (!workspace) {
    return NextResponse.json({ error: "Plan nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ workspace: toWorkspaceDto(workspace) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const store = getStore();
  const workspaces = await store.listWorkspaces(user.id);
  if (workspaces.length <= 1) {
    return NextResponse.json(
      { error: "Der letzte Plan kann nicht gelöscht werden." },
      { status: 400 }
    );
  }

  const deleted = await store.deleteWorkspace(user.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Plan nicht gefunden" }, { status: 404 });
  }

  const rest = await store.listWorkspaces(user.id);
  return NextResponse.json({
    workspaces: rest.map(toWorkspaceDto),
    activeWorkspaceId: rest[0]?.id ?? null,
  });
}

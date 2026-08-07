import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { getStore, toWorkspaceDto } from "@/lib/db";
import type { PersistedFlow } from "@/lib/accounts/flowPersistence";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const flow = await getStore().loadFlow(user.id, id);
  return NextResponse.json({ flow });
}

/** navigator.sendBeacon kann nur POST — gleiche Semantik wie PUT. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return PUT(req, ctx);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { flow?: PersistedFlow };
  if (!body.flow) {
    return NextResponse.json({ error: "flow fehlt" }, { status: 400 });
  }

  const workspace = await getStore().saveFlow(user.id, id, body.flow);
  if (!workspace) {
    return NextResponse.json({ error: "Plan nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ workspace: toWorkspaceDto(workspace) });
}

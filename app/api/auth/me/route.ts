import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { getStore, toUserDto, toWorkspaceDto } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  const store = getStore();
  let workspaces = await store.listWorkspaces(user.id);
  if (!workspaces.length) {
    workspaces = [await store.createWorkspace(user.id, "Mein erster Plan")];
  }

  return NextResponse.json({
    user: toUserDto(user),
    workspaces: workspaces.map(toWorkspaceDto),
    activeWorkspaceId: workspaces[0].id,
  });
}

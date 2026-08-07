import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { getStore, toUserDto, toWorkspaceDto } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    const store = getStore();
    await store.init();

    const user = await store.findUserByEmail(email);
    // Gleiche Meldung für unbekannte Mail und falsches Passwort — kein Konto-Leak.
    const ok = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!user || !ok) {
      return NextResponse.json(
        { error: "E-Mail oder Passwort stimmt nicht." },
        { status: 401 }
      );
    }

    let workspaces = await store.listWorkspaces(user.id);
    if (!workspaces.length) {
      workspaces = [await store.createWorkspace(user.id, "Mein erster Plan")];
    }

    await startSession(user.id);

    return NextResponse.json({
      user: toUserDto(user),
      workspaces: workspaces.map(toWorkspaceDto),
      activeWorkspaceId: workspaces[0].id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Login fehlgeschlagen" },
      { status: 500 }
    );
  }
}

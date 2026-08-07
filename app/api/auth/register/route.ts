import { NextResponse } from "next/server";
import {
  hashPassword,
  isValidEmail,
  passwordProblems,
} from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { getStore, toUserDto, toWorkspaceDto } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() || email.split("@")[0] || "Creator";

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Bitte eine gültige E-Mail-Adresse angeben." },
        { status: 400 }
      );
    }
    const problems = passwordProblems(password);
    if (problems.length) {
      return NextResponse.json(
        { error: `Passwort braucht ${problems.join(", ")}.` },
        { status: 400 }
      );
    }

    const store = getStore();
    await store.init();

    if (await store.findUserByEmail(email)) {
      return NextResponse.json(
        { error: "Für diese E-Mail existiert schon ein Konto. Bitte einloggen." },
        { status: 409 }
      );
    }

    const user = await store.createUser({
      email,
      name,
      passwordHash: await hashPassword(password),
    });

    // Erster Workspace, damit der Nutzer direkt starten kann.
    const workspace = await store.createWorkspace(user.id, "Mein erster Plan");
    await startSession(user.id);

    return NextResponse.json({
      user: toUserDto(user),
      workspaces: [toWorkspaceDto(workspace)],
      activeWorkspaceId: workspace.id,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Registrierung fehlgeschlagen",
      },
      { status: 500 }
    );
  }
}

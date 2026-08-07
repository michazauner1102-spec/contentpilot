import { cache } from "react";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { getStore } from "@/lib/db";
import type { UserRecord } from "@/lib/db/types";

/** Session prüfen und User laden. Pro Request memoisiert. */
export const getCurrentUser = cache(async (): Promise<UserRecord | null> => {
  const session = await readSession();
  if (!session) return null;
  return getStore().findUserById(session.userId);
});

export const UNAUTHORIZED = NextResponse.json(
  { error: "Nicht eingeloggt" },
  { status: 401 }
);

/**
 * Für Route Handler: entweder der User oder eine fertige 401-Antwort.
 * Damit kann keine Route das Prüfen versehentlich vergessen.
 */
export async function requireUser(): Promise<
  { user: UserRecord; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { response: UNAUTHORIZED };
  return { user };
}

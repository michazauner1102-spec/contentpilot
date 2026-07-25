import { NextResponse } from "next/server";
import { importExternalSchedule } from "@/lib/plan/importExternalSchedule";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      content?: string;
      refMonth?: string;
      fileName?: string;
    };

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "content fehlt" }, { status: 400 });
    }

    const result = importExternalSchedule(body.content, {
      refMonth: body.refMonth,
      fileName: body.fileName,
    });

    if (result.importedCount === 0) {
      return NextResponse.json(
        {
          error:
            result.warnings[0] ??
            "Import leer — Format prüfen (CSV oder JSON).",
          warnings: result.warnings,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

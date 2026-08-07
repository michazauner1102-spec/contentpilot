import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { callClaudeJSON } from "@/lib/claude";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import type {
  ContentBriefing,
  ResearchResult,
  VideoDetails,
} from "@/lib/types";

export const maxDuration = 60;

export type ChatAction =
  | "refine_hook"
  | "refine_script"
  | "new_angle"
  | "grafik"
  | "answer";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: ChatMessage[];
      video?: VideoDetails;
      briefing?: ContentBriefing;
      research?: ResearchResult;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Nachricht fehlt" }, { status: 400 });
    }

    try {
      const result = await callClaudeJSON<{
        reply: string;
        action: ChatAction;
        patch?: {
          title?: string;
          hook?: string;
          begruendung?: string;
          skript?: { hook?: string; body?: string; cta?: string };
          grafikVorschlag?: string;
        };
        applySuggested?: boolean;
      }>(
        `Du bist ContentPilot Assist — ein knapper Social-Media-Berater im Chat.
Sprache: Deutsch, klar, ohne Marketing-Floskeln.
Du hilfst dem Nutzer, Posts, Hooks, Skripte und Grafik-Ideen anzupassen.
Wenn der Nutzer eine konkrete Änderung will, liefere patch-Felder ausgefüllt und setze applySuggested=true.
Wenn nur eine Frage/Beratung: action=answer, applySuggested=false, patch weglassen.
action-Werte: refine_hook | refine_script | new_angle | grafik | answer`,
        `Briefing: ${body.briefing ? JSON.stringify(body.briefing) : "—"}
Research: ${body.research ? JSON.stringify({
          zielgruppe: body.research.zielgruppe,
          painPoints: body.research.painPoints,
          hookMuster: body.research.hookMuster,
        }) : "—"}
Aktuelles Video: ${body.video ? JSON.stringify({
          id: body.video.id,
          postingDay: body.video.postingDay,
          title: body.video.title,
          hook: body.video.hook,
          begruendung: body.video.begruendung,
          bereich: body.video.bereich,
          format: body.video.format,
          skript: body.video.skript,
          grafikVorschlag: body.video.grafikVorschlag,
        }) : "kein Video ausgewählt"}
Chat-Verlauf:
${(body.history ?? [])
  .slice(-8)
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}
Nutzer jetzt: ${message}`,
        `{
  "reply": "kurze Antwort an den Nutzer",
  "action": "refine_hook|refine_script|new_angle|grafik|answer",
  "applySuggested": false,
  "patch": {
    "title": "optional",
    "hook": "optional",
    "begruendung": "optional",
    "skript": { "hook": "", "body": "", "cta": "" },
    "grafikVorschlag": "optional"
  }
}`
      );

      return NextResponse.json(result);
    } catch (err) {
      return aiRouteFailure(err, "Chat fehlgeschlagen", {
        reply:
          "Ich konnte gerade nicht antworten (Mock/Offline). Formuliere deine Anpassung trotzdem — du kannst Hook und Titel auch manuell im Panel ändern.",
        action: "answer",
        applySuggested: false,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat fehlgeschlagen" },
      { status: 500 }
    );
  }
}

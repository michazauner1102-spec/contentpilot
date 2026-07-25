# ContentPilot

**30-Tage-Content-Plan mit geschlossenem Loop** — von Nische und Briefing über Kalender und Dreh-To-dos bis zu Mock-Performance, Learnings und Plan v2.

Hackathon-MVP (Social Media Stuttgart): Next.js-App mit Human-in-the-Loop, Demo-Daten und klarem UI-Flow.

## Features

| Bereich | Inhalt |
|--------|--------|
| **Plan-Setup** | Nische, 5 Wizard-Fragen, Briefing, Trend-Vorschläge |
| **Human in the Loop** | Brainstorm, Research, Plan-Freigabe, Export |
| **Kalender** | 30-Tage-Grid, Tag-Detail mit Skript & Vorschlägen |
| **Aufnahme-To-dos** | Dreh-Wochen, Checkliste, Aufnahme-Status |
| **Dashboard** | KPI-Leiste, Plattform-Karussell, Plattform-Report, Loop → Plan v2 |

Ohne API-Keys laufen viele Schritte über **Mocks** (Performance-Import, Detail-Skripte, Learnings-Demo).

## Tech-Stack

- [Next.js 16](https://nextjs.org/) (App Router), React 19, TypeScript
- Tailwind CSS 4
- Anthropic Claude (optional, für LLM-Routen)

## Lokale Entwicklung

```bash
npm install
cp .env.local.example .env.local   # Keys eintragen (siehe unten)
npm run dev
```

App: **http://127.0.0.1:3000** (Dev-Server bindet bewusst an `127.0.0.1`).

```bash
npm run build   # Production-Build
npm start       # Production-Server (z. B. Render)
```

## Umgebungsvariablen

Siehe [`.env.local.example`](.env.local.example):

| Variable | Zweck |
|----------|--------|
| `ANTHROPIC_API_KEY` | LLM (Plan, Skript, Research, …) |
| `TAVILY_API_KEY` / `PERPLEXITY_API_KEY` | Web-Research |
| `YOUTUBE_API_KEY` | Referenzvideos (sonst Fallback-URLs) |
| `FIRECRAWL_API_KEY` | Trend-Research im Wizard |
| `NOTION_TOKEN` + `NOTION_DATABASE_ID` | Optional: Plan nach Notion syncen |

**Niemals** `.env.local` committen.

## Deployment (Render)

Im Repo liegt [`render.yaml`](render.yaml) (Blueprint). Nach Verbindung mit GitHub:

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Repository wählen → Env-Variablen setzen (mindestens `ANTHROPIC_API_KEY` für volle LLM-Funktion)
3. Deploy; URL z. B. `https://contentpilot.onrender.com`

Free Tier: Cold Start nach Inaktivität möglich.

## Projektstruktur (kurz)

```
app/              # Routes & API (onboarding, plan, performance, loop, …)
components/       # UI (Kalender, Dashboard, HITL, Setup)
lib/              # Typen, Plan-Generator, Insights, Demo-Daten
insights-module/  # Performance-/Insights-Kern (integriert unter lib/insights/)
```

## Content-Flow (Überblick)

1. Nische + Referent Creator  
2. 5 Fragen → Creator-Vorschläge & Briefing  
3. Brainstorm & Research (HITL)  
4. 30-Tage-Plan + Produktions-Guide  
5. Kalender & Aufnahme-To-dos  
6. Dashboard: Mock-Performance → Learnings → **Plan v2** im Kalender  

## Export

Markdown, TXT, JSON, Zwischenablage für Notion/Notizen; optional Notion-Sync.

## Lizenz

Private Hackathon-Projekt — Nutzung nach Absprache im Team.

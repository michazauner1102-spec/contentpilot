<p align="center">
  <img src="docs/logo.png" alt="ContentPilot — 30-Tage Content, Plan, Dreh, Loop" width="640" />
</p>

<p align="center">
  <strong>ContentPilot</strong> — vom Briefing zum 30-Tage-Videoplan, mit Dreh-To-dos, Mock-Performance und geschlossenem Loop zu Plan v2.
</p>

<p align="center">
  <a href="https://contentpilot-is89.onrender.com"><strong>Live-Demo öffnen</strong></a>
  · Mock-Daten · ohne Anmeldung
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Hackathon-Social%20Media%20Stuttgart-8b9aab?style=flat-square" alt="Hackathon" />
</p>

---

## Was ist ContentPilot?

ContentPilot ist ein **MVP für Creator und Marketing-Teams**, die Social-Video **planbar** machen wollen: Nische schärfen, Research mit Human-in-the-Loop, **30 Tage** im Kalender, Aufnahme strukturieren, Ergebnisse simulieren und daraus den **nächsten Monatsplan** ableiten.

> Demo-fähig auch **ohne API-Keys** — Performance, einzelne Skripte und Learnings nutzen Mock-Daten.

---

## USPs — warum ContentPilot?

| | Unique Selling Point |
|---|---------------------|
| **Plan statt Chaos** | Validierter **60 / 25 / 15**-Mix (Reichweite · Vertrauen · Conversion) über 30 Tage |
| **Human in the Loop** | Brainstorm, Research und Freigabe — KI schlägt vor, **du entscheidest** |
| **Ein Kalender, ein Truth** | Tag anklicken → Inhaltsvorschlag links, **Skript-Panel rechts**; Bildvorschläge & Dreh im Drawer |
| **Produktion mitdenken** | Aufnahme-To-dos nach Dreh-Wochen, Checkliste, Fortschritt |
| **Geschlossener Loop** | Dashboard → Metriken → Learnings → **Plan v2** + **Monats-Feedback** (Trends, Kommentare) |
| **Skript aus Inhalt** | Pro Kalender-Tag: Inhaltsvorschlag → **Skript generieren** (Hook, Inhalt, CTA, Bildideen) |
| **Scheduling-Import** | **Buffer / Hootsuite** CSV/JSON im **Kalender** oder HITL — ersetzt den Plan, danach Skript & Loop |
| **Monatsvorschläge (HITL)** | Eigene Ideen für Plan v2 einreichen → **KI bewertet** → in den Kalender übernehmen |
| **Export-ready** | Markdown, TXT, JSON, Notion (optional) |

---

## Für wen?

| Persona | Nutzen |
|---------|--------|
| **Solo-Creator / Handwerker** | Wenig Zeit, klare Tagesplanung und konkrete Dreh-Impulse |
| **Social-Media-Manager** | Briefing, Research-Nachweise und Planversionen für Stakeholder |
| **Agentur / Hackathon-Team** | End-to-end Story: Setup → Plan → KPI → Iteration in einer App |
| **Product Demo** | Mock-Badges, Testdaten-Import, Plattform-Reports ohne Live-APIs |

---

## So funktioniert der Flow

```mermaid
flowchart LR
  A[Plan-Setup] --> B[Human in the Loop]
  B --> C[30-Tage-Kalender]
  C --> D[Aufnahme-To-dos]
  D --> E[Dashboard]
  E --> F[Learnings & Feedback]
  F --> G[Plan v2]
  G --> C
```

1. **Plan-Setup** — Nische, 5 Fragen, Briefing, optional Trend-Research  
2. **Human in the Loop** — Brainstorm-Board, Research, Plan freigeben  
3. **Kalender** — 30 Tage; **Posts hochladen** (Buffer/Hootsuite CSV/JSON); Tag öffnen → Inhaltsvorschlag → Button → **Skript rechts**  
4. **Aufnahme-To-dos** — Wochen fürs Drehen, abhaken was fertig ist  
5. **Dashboard** — KPIs, einklappbare Plattformen, Report pro Kanal  
6. **Loop** — Learnings je Bereich, **Monats-Feedback-Dokument** (Markdown), Plan v2 im Kalender  

**Pitch & Demo-Script:** [`docs/plattform-erklaeren.md`](docs/plattform-erklaeren.md)

### Import aus Buffer / Hootsuite

| Ort | Aktion |
|-----|--------|
| **Kalender** | Leiste **Posts hochladen** → CSV/JSON wählen (Import ersetzt Kalender-Einträge) |
| **Human in the Loop** | Voller Import-Dialog inkl. Vorschau & Vorlagen |

Erkannte CSV-Spalten u. a.: Buffer (`Text`, `Scheduled At`, `Channel`), Hootsuite (`Date`, `Time`, `Message`, `Social Network Profiles`). ContentPilot-JSON-Backups (`zyklus.plan`) werden ebenfalls unterstützt.

---

## Screenshots

### 30-Tage-Kalender

Tag anklicken → **Inhaltsvorschlag**, Skript-Button, Hook/Inhalt/CTA im **rechten Skript-Panel** und Bildvorschläge im Drawer.

<p align="center">
  <img src="docs/screenshots/01-kalender.png" alt="Kalender mit 30-Tage-Plan" width="920" />
</p>

### Dashboard & Loop

KPI-Leiste, **Feedback & Loop** (Learnings, Plan v2, Monats-Feedback). Plattformen einklappbar.

<p align="center">
  <img src="docs/screenshots/02-dashboard.png" alt="Dashboard mit KPIs und Plattform-Karussell" width="920" />
</p>

### Human in the Loop

Research, Brainstorm und Freigabe — Setup jederzeit beenden, Menü bleibt nutzbar.

<p align="center">
  <img src="docs/screenshots/03-human-in-the-loop.png" alt="Human in the Loop Ansicht" width="920" />
</p>

### Aufnahme-To-dos

Dreh-Wochen und Checkliste, Sprung zurück in den Kalender.

<p align="center">
  <img src="docs/screenshots/04-aufnahme-todos.png" alt="Aufnahme-To-dos nach Wochen" width="920" />
</p>

### Plan-Setup

Wizard mit Schnellauswahl und Trend-Research — Vollbild-Overlay, nicht abgeschnitten.

<p align="center">
  <img src="docs/screenshots/05-plan-setup.png" alt="Plan-Setup Wizard" width="920" />
</p>

*Screenshots neu erzeugen:* `npm run dev` starten, dann `npm run screenshots`.

---

## Schnellstart

```bash
git clone https://github.com/michazauner1102-spec/contentpilot.git
cd contentpilot
npm install
cp .env.local.example .env.local   # Keys eintragen (optional für Mocks)
npm run dev
```

Öffnen: **http://127.0.0.1:3000** (lokal) · **https://contentpilot-is89.onrender.com** (Live-Demo)

| Befehl | Beschreibung |
|--------|----------------|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Production-Build |
| `npm start` | Production (z. B. Render) |
| `npm run screenshots` | README-Screenshots unter `docs/screenshots/` |
| `npm run pitch-screenshots-hd` | HiDPI-Pitch-Mockups (2×) unter `mockups/` |
| `npm run demo:video` | 2-Min-Plattform-Demo (Playwright, lokal `demo/video/`) |

### Demo-Video (lokal)

Nach `npm run dev` in einem zweiten Terminal:

```bash
PLAYWRIGHT_BROWSERS_PATH=0 npm run demo:video
```

Ausgabe: `demo/video/contentpilot-demo-2min.webm` und `.mp4` (mit ffmpeg). Voiceover-Vorlage: [`demo/VOICEOVER.md`](demo/VOICEOVER.md).  
Optional: `DEMO_VIDEO_MAX_SEC=130` · `DEMO_VIDEO_SCALE=2` für Länge und Schärfe.

---

## Umgebungsvariablen

Siehe [`.env.local.example`](.env.local.example). **`.env.local` niemals committen.**

### LLM (einer reicht — per `LLM_PROVIDER` wählen)

| Provider | `LLM_PROVIDER` | API-Key |
|----------|----------------|---------|
| **Anthropic Claude** (Default) | `anthropic` | `ANTHROPIC_API_KEY` |
| **Google Gemini** | `gemini` | `GOOGLE_GENERATIVE_AI_API_KEY` oder `GEMINI_API_KEY` |
| **OpenAI** | `openai` | `OPENAI_API_KEY` |

Optional: `LLM_MODEL` setzen (sonst sinnvoller Default pro Provider).

### Referenz-Videos & Metriken (Plattformen)

| Plattform | Referenzen | Metriken (Live-Vorbereitung) |
|-----------|------------|------------------------------|
| **YouTube** | `YOUTUBE_API_KEY` (Search) | `YOUTUBE_OAUTH_REFRESH_TOKEN` + `INSIGHTS_MODE=live` |
| **Instagram / Meta** | `META_ACCESS_TOKEN` oder `INSTAGRAM_ACCESS_TOKEN` | `INSTAGRAM_BUSINESS_ACCOUNT_ID` |
| **TikTok** | `TIKTOK_CLIENT_KEY` + `TIKTOK_CLIENT_SECRET` | `TIKTOK_ACCESS_TOKEN` |
| **LinkedIn** | `LINKEDIN_ACCESS_TOKEN` | `LINKEDIN_ORGANIZATION_URN` |

- `REFERENCE_PLATFORMS=youtube,instagram,tiktok,linkedin` — welche Quellen für Referenz-Recherche  
- `INSIGHTS_MODE=mock` (Default) — plattformspezifische **Demo-Metriken** im Dashboard  
- `INSIGHTS_MODE=live` — nutzt konfigurierte API-Keys, sonst Mock-Fallback  

### Research & Export

| Variable | Zweck |
|----------|--------|
| `TAVILY_API_KEY` / `PERPLEXITY_API_KEY` | Web-Research |
| `FIRECRAWL_API_KEY` | Trend-Research im Wizard |
| `NOTION_TOKEN` + `NOTION_DATABASE_ID` | Optional: Notion-Sync |

---

## Live-Demo (öffentlich, Mock-Daten)

**Jetzt testen:** [https://contentpilot-is89.onrender.com](https://contentpilot-is89.onrender.com)

Deploy auf **Render** (Free Tier, Frankfurt) — ohne API-Keys lauffähig (`INSIGHTS_MODE=mock`, Demo-Banner).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/michazauner1102-spec/contentpilot)

1. Button klicken → Render-Account verbinden → **Apply** (eigene Instanz)  
2. Optional: LLM-/Research-Keys später in Environment setzen  
3. Free Tier: nach Inaktivität Cold Start (~30–60 s beim ersten Aufruf)

Lokal wie die Live-Demo: `INSIGHTS_MODE=mock` und `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`.

---

## Deployment (Render)

[`render.yaml`](render.yaml) liegt als Blueprint bereit:

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**  
2. Repo verbinden → Environment-Variablen setzen  
3. Deploy → öffentliche URL (Free Tier: Cold Start möglich)

---

## Projektstruktur

```
app/                 API Routes & App Router
components/          Kalender, Dashboard, HITL, Shell
lib/                 Typen, Plan-Generator, Insights, Feedback, LLM, Demo
mockups/             HiDPI-Pitch-Screenshots (Gamma)
demo/                Voiceover-Skript für Demo-Video (Video-Dateien lokal, gitignored)
insights-module/     Performance-Kern (→ lib/insights/)
docs/                Banner, Screenshots für README
```

---

## Insights, Feedback & Export

- Performance-Demo: `InsightsService` / Mock-Import über `/api/performance/import`  
- **Plan-Import:** `POST /api/plan/import` — Buffer/Hootsuite CSV oder JSON → Kalender  
- **HITL Monatsvorschlag:** `POST /api/hitl/month-suggestion` — KI-Bewertung für Plan v2  
- **Monats-Feedback:** `POST /api/loop/feedback-document` — Trends, Gut/Schwach, Vorschläge, Kommentar-Analyse  
- Loop-Learnings: `/api/loop/analyze` → Plan v2 über `/api/plan/generate`  
- Export: Markdown, Notizen, JSON, Zwischenablage; optional Notion  

---

## Lizenz & Kontext

Hackathon-Projekt **Social Media Stuttgart** — MVP zur Demonstration des Content-Loops.  
Repository: [github.com/michazauner1102-spec/contentpilot](https://github.com/michazauner1102-spec/contentpilot) · Live-Demo: [contentpilot-is89.onrender.com](https://contentpilot-is89.onrender.com)

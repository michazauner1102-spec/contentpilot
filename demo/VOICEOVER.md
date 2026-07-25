# ContentPilot — Demo (Voiceover)

Synchron zu `demo/video/contentpilot-demo-2min.webm` / `.mp4` — **Schritt für Schritt**, langsame Eingaben.

| ca. | Szene | Text (Deutsch) |
|-----|--------|----------------|
| 0:00 | Start | **ContentPilot** — der 30-Tage-Content-Loop mit Human in the Loop. |
| 0:08 | Plan-Setup | Nische und Referenz-Creator eingeben, dann **fünf Fragen**. |
| 0:35 | Wizard | Zielgruppe, Ziel, Formate, No-Gos, Zeit — nacheinander. |
| 0:55 | Human in the Loop | **Brainstorm** und **Research**. |
| 1:15 | Kalender | Tag wählen, **Inhaltsvorschlag**, **Skript erstellen**. |
| 1:35 | To-dos | **Aufnahme-To-dos**. |
| 1:45 | Dashboard | **Metriken** und Plattform-Report. |
| 2:05 | Loop | **Learnings**, **Plan v2**, **Monats-Feedback**. |
| 2:20 | Kalender v2 | **Monat 2** im Kalender. |
| 2:30 | Outro | Planen → Drehen → Messen → Verbessern. |

## Neu aufnehmen

```bash
npm run dev
PLAYWRIGHT_BROWSERS_PATH=0 npm run demo:video
```

Länger / langsamer (Ziel ~180 s):

```bash
DEMO_VIDEO_MAX_SEC=180 PLAYWRIGHT_BROWSERS_PATH=0 npm run demo:video
```

Ausgabe: `demo/video/contentpilot-demo-2min.webm` und `.mp4` (ffmpeg).

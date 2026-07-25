# ContentPilot kurz erklären

Leitfaden für Pitch, Demo (~2–5 Min.) und Q&A. Live-Demo: [contentpilot-is89.onrender.com](https://contentpilot-is89.onrender.com)

**Pitch Deck (10 Slides, Gamma):** [`docs/pitchdeck.md`](pitchdeck.md) — inkl. Zuordnung zu [`mockups/`](../mockups/) und [Claude-Artifact](https://claude.ai/code/artifact/d294f9a7-abf0-43ae-a6d3-5c976ca51c6b).

---

## Elevator Pitch (30 Sekunden)

**ContentPilot** verwandelt „Ich müsste mal wieder posten“ in einen **planbaren 30-Tage-Videoplan** für Social Media.

Du startest mit **Briefing und Research**, die KI schlägt **30 Videos** im Mix **Reichweite / Vertrauen / Conversion** vor — du behältst die Kontrolle (**Human in the Loop**). Im **Kalender** siehst du pro Tag Hook, Skript und Drehliste. Nach dem Monat wertest du **Performance und Kommentare** aus, bekommst **Monats-Feedback** und erzeugst **Plan v2** — inklusive **eigener Vorschläge**, die die KI prüft und einbaut.

**Kernbotschaft:** Plan → Produzieren → Messen → Lernen → nächster Monat. Alles in einer App, Demo auch ohne API-Keys.

---

## Problem → Lösung (45 Sekunden)

| Problem | Was ContentPilot tut |
|--------|----------------------|
| Keine Ideen, kein Rhythmus | 30-Tage-Plan mit validiertem Content-Mix |
| KI-Output ohne Kontrolle | Brainstorm, Research, Freigabe, Vorschläge für nächsten Monat |
| Plan und Dreh getrennt | Kalender + Aufnahme-To-dos nach Wochen |
| Posten ohne Lernen | Dashboard, Learnings, Monats-Feedback, Plan v2 |

---

## Demo-Ablauf (2–3 Minuten, empfohlen)

1. **Ein Satz Kontext:** „Solo-Creator oder Team — ein Monat Social Video, strukturiert.“
2. **Plan-Setup** (Account): Nische, kurzer Wizard → Briefing. Optional: „Trend-Research“ erwähnen.
3. **Human in the Loop:** Brainstorm kurz zeigen → Research → **Plan freigeben** oder **CSV/JSON importieren** (Buffer/Hootsuite).  
   **Monatsvorschläge:** Text → KI bewertet → **In Plan einbauen**.  
4. **Kalender:** Optional **Datei hochladen** statt KI-Plan. Tag öffnen → Inhaltsvorschlag → Button → **Skript-Panel rechts** (Hook, Inhalt, CTA).  
5. **Aufnahme-To-dos:** Dreh-Wochen, Haken setzen — „Produktion ist mitgedacht.“  
6. **Dashboard:** KPIs, Plattformen einklappen → **Feedback & Loop** → Testdaten → **Learnings** → **Monats-Feedback** → **Plan v2**.

**Tipp:** In der öffentlichen Demo läuft vieles mit **Mock-Daten** (Badge im UI) — das ist Absicht: Story ohne Live-APIs.

---

## Die fünf Bereiche im Menü (Merksatz)

| Menü | Ein Satz |
|------|----------|
| **Kalender** | Monatsplan, **Import**, Tag-Detail + **Skript-Panel** |
| **Aufnahme-To-dos** | Wann drehen, was abhaken |
| **Human in the Loop** | KI + Mensch: Research, Freigabe, Monatsvorschläge |
| **Dashboard** | Zahlen, Reports, Loop, Plan v2 |
| **Account / Plan-Setup** | Briefing und Einstieg |

Merksatz: **„Setup → HITL → Kalender → Drehen → Dashboard → Loop.“**

---

## USPs (wenn jemand „Warum nicht ChatGPT?“ fragt)

- **Struktur:** Fester 30-Tage-Plan mit **60/25/15-Mix**, nicht lose Ideenliste.
- **Human in the Loop:** Freigabe, Research-Feedback, **eigene Vorschläge** mit KI-Check.
- **Produktion:** Skript, Shotlist, Grafikvorschläge, Wochenplan fürs Drehen.
- **Geschlossener Loop:** Metriken + Kommentar-Analyse → **Monats-Feedback** → **Plan v2**.
- **Demo-tauglich:** Mock-Performance, optional echte LLMs per API-Key.
- **Buffer/Hootsuite:** Geplanten Content **importieren**, in ContentPilot **Skript & Loop** — posten weiterhin im Scheduling-Tool.

---

## Typische Fragen & kurze Antworten

**Ist das nur für Instagram?**  
Nein — Plattformen (Instagram, YouTube, TikTok, LinkedIn) sind pro Video wählbar; Dashboard kann pro Kanal berichten.

**Brauche ich API-Keys?**  
Für die **Live-Demo auf Render: nein.** Lokal können LLM-Keys Research, Skripte und Bewertungen verbessern.

**Ersetzt das eine Agentur?**  
Nein — es **strukturiert** Planung und Iteration; Strategie und Qualität bleiben beim Menschen (HITL).

**Was ist Plan v2?**  
Nach dem Monat: Learnings aus Performance → neuer 30-Tage-Plan, inkl. Diff zum alten Plan.

**Was machen die Monatsvorschläge in HITL?**  
Du beschreibst eine Idee für den **nächsten Monat**; die KI bewertet Passung zum Briefing/Mix und kann den Slot im Kalender **ersetzen**.

**Import aus Buffer/Hootsuite?**  
CSV/JSON im **Kalender** (schnell) oder **HITL** (mit Vorschau) — ersetzt die Kalender-Slots; danach Skripte und Loop wie gewohnt.

**Notion / Export?**  
Markdown, TXT, JSON; Notion optional wenn konfiguriert.

---

## Zielgruppen (1 Zeile pro Persona)

- **Handwerker / Solo-Creator:** „Jeden Tag ein Thema — ohne stundenlang zu überlegen.“
- **Social-Media-Manager:** „Briefing, Plan und Loop-Nachweis für das Team.“
- **Jury / Hackathon:** „End-to-end MVP: Plan, Produktion, KPI, Iteration.“

---

## Abschluss-Satz

„ContentPilot ist der **Copilot für den Content-Monat**: KI liefert Tempo und Vorschläge, **du** gibst Research, Freigabe und eigene Ideen frei — und der **Loop** macht aus Views und Kommentaren den **nächsten Plan**.“

---

## Links

- **Live-Demo:** https://contentpilot-is89.onrender.com  
- **Repository:** https://github.com/michazauner1102-spec/contentpilot  
- **Lokal:** `npm run dev` → http://localhost:3000  

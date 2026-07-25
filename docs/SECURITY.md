# Sicherheit & API-Keys

## Enthält dieses Repository Secrets?

**Nein.** Im Git-History-Check sind **keine** echten API-Keys, Tokens oder `.env.local`-Dateien mit Werten enthalten.

- `.env`, `.env.local` und Varianten stehen in [`.gitignore`](.gitignore).
- [`.env.local.example`](.env.local.example) listet nur **leere** Platzhalter für lokale Entwicklung.

Wenn du jemals aus Versehen einen Key committed hast: Key beim Anbieter **sofort rotieren**, dann Support kontaktieren (History-Rewrite).

## Öffentliche Live-Demo (Render)

Die Demo unter [contentpilot-is89.onrender.com](https://contentpilot-is89.onrender.com) nutzt:

- `NEXT_PUBLIC_DEMO_MODE=true` — UI-Hinweis „Demo“ (blockiert **keine** Server-APIs)
- `FORCE_MOCK_ONLY=true` — **blockiert** LLM, Research, Notion, Plattform-APIs (öffentliche Demo)
- `INSIGHTS_MODE=mock`

Damit ruft der Server **keine** LLM-, Research-, Notion- oder Plattform-APIs auf — auch wenn jemand Keys im Hosting setzen würde. Es laufen Mock-Daten und Heuristiken.

## Private Instanz mit echten APIs

Nur auf **eigener** Infrastruktur (lokal oder privates Render):

1. `.env.local` anlegen (nie committen).
2. `FORCE_MOCK_ONLY` **nicht** setzen (oder `false`).
3. Keys nur in der Hosting-Umgebung hinterlegen — **nie** in GitHub.

## Meldung

Sicherheitshinweise: Issues im [GitHub-Repository](https://github.com/michazauner1102-spec/contentpilot) (ohne Keys im Text).

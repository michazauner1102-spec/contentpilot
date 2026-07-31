# Social-Media-Accounts anbinden

> Die App liest **Kennzahlen (Insights)** und Referenz-Videos je Plattform über offizielle APIs.
> Es gibt **kein Posting/Publishing** — nur lesenden Zugriff.
> Tokens gehören in `.env.local` (lokal) bzw. ins **Render-Dashboard** (nie ins Repo committen!).
> Zum Aktivieren echter Daten außerdem setzen: `INSIGHTS_MODE=live` und `FORCE_MOCK_ONLY=false`.

Reihenfolge empfohlen: **YouTube → Instagram → TikTok → LinkedIn** (aufsteigende Komplexität / Review-Aufwand).

Genau diese Variablen erwartet der Code (`lib/platforms/config.ts`):

| Plattform | Referenz-Videos | Insights (Kennzahlen) |
|-----------|-----------------|------------------------|
| YouTube   | `YOUTUBE_API_KEY` | `YOUTUBE_API_KEY` + `YOUTUBE_OAUTH_REFRESH_TOKEN` |
| Instagram | `META_ACCESS_TOKEN` (o. `INSTAGRAM_ACCESS_TOKEN`) | `META_ACCESS_TOKEN` + `INSTAGRAM_BUSINESS_ACCOUNT_ID` |
| TikTok    | `TIKTOK_CLIENT_KEY` + `TIKTOK_CLIENT_SECRET` | `TIKTOK_ACCESS_TOKEN` |
| LinkedIn  | `LINKEDIN_ACCESS_TOKEN` | `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_ORGANIZATION_URN` |

Optional Auswahl einschränken: `REFERENCE_PLATFORMS=youtube,instagram` (Default: alle vier).

---

## 1) YouTube (am einfachsten)
1. Google Cloud Console → neues Projekt → **YouTube Data API v3** aktivieren.
2. „Anmeldedaten" → **API-Schlüssel** erstellen → als `YOUTUBE_API_KEY`.
3. Für Insights zusätzlich OAuth: OAuth-Client (Desktop) anlegen, Scope `youtube.readonly`, einmalig Consent durchlaufen → **Refresh Token** → als `YOUTUBE_OAUTH_REFRESH_TOKEN`.

## 2) Instagram (über Meta / Facebook)
Voraussetzung: **Instagram-Business/Creator-Account**, verknüpft mit einer Facebook-Seite.
1. developers.facebook.com → App (Typ „Business") → Produkt **Instagram Graph API**.
2. Graph API Explorer: Scopes `instagram_basic`, `pages_read_engagement` → **Access Token** → als `META_ACCESS_TOKEN` (besser: Long-Lived Token, 60 Tage).
3. Business-Account-ID abfragen (`/me/accounts` → verknüpftes IG-Konto) → als `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

## 3) TikTok (mit App-Review)
1. developers.tiktok.com → App erstellen → **Client Key/Secret** → `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`.
2. Login-Kit/Display-API-Scopes beantragen (Review nötig), OAuth durchlaufen → **Access Token** → `TIKTOK_ACCESS_TOKEN`.

## 4) LinkedIn (Organisation)
1. linkedin.com/developers → App an eine **Unternehmensseite** binden.
2. Produkte „Sign In" + „Community Management API"; Scope u. a. `r_organization_social`.
3. OAuth → **Access Token** → `LINKEDIN_ACCESS_TOKEN`.
4. Organisations-URN (`urn:li:organization:XXXX`) → `LINKEDIN_ORGANIZATION_URN`.

---

## Danach
- **Lokal:** Werte in `.env.local`, dazu `INSIGHTS_MODE=live`, `FORCE_MOCK_ONLY=false` → `npm run dev` neu starten.
- **Live (Render):** dieselben Keys unter Service `contentpilot` → *Environment* eintragen, `INSIGHTS_MODE=live`, `FORCE_MOCK_ONLY=false` → *Save* löst Redeploy aus.
- Prüfen: `GET /api/health/ai` und die Dashboard-Kennzahlen zeigen echte statt Mock-Werte.

> Tipp: Erst **eine** Plattform komplett durchziehen und testen, dann die nächste — spart Fehlersuche.

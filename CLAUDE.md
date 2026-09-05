# Mesob Financial Portal — Project Memory

This file is auto-loaded by Claude Code at the start of every session in this
repo. Keep it updated as work progresses so context survives across sessions
and context-window compactions.

## What this project is

**Meksova / Mesob Financial Portal** — a React web app (CRA, `react-scripts`)
for rideshare/trucking drivers and small businesses to track finances:
receipts, transactions, mileage, financial reports, subscriptions.

- Package name: `Meksova-store` (`package.json`)
- Stack: React, Bootstrap/reactstrap, Redux Toolkit, i18next (EN/ES etc.),
  axios, Chart.js/ApexCharts, Stripe + PayPal billing, AWS Amplify/Cognito auth.
- Backend: AWS API Gateway + Lambda.
  `API_BASE_URL` = `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/{ENV}/MesobFinancialSystem`
  (`src/config/api.js`). `{ENV}` is `staging` or `production`, resolved from
  hostname (`app.meksova.com` / `staging.meksova.com`) or `REACT_APP_ENV`.
- Two layouts/role sets in `src/routes.js`: `adminRoutes` (role 1) and
  `customerRoutes` (role 2+), under `/admin/*` and `/customer/*`.

## Working branch

`claude/mesob-financial-portal-features-yuv3i8` — all Claude Code work for
this repo happens here per the task's git instructions. Push here, never to
a different branch without explicit permission. If its PR is ever merged,
restart the branch fresh from the default branch for follow-up work (don't
stack on merged history).

## Features shipped so far (chronological, newest first)

1. **Financial Report redesign** — migrated `mesobfinancial2.js` /
   `Financial_Dashboard.js` to match the dashboard's glass-panel design
   system: preset-pill date filters, standard fonts + monospace numbers,
   toolbar buttons and card glow aligned to the system.
2. **Logo asset optimization** — 9.4MB → 226KB.
3. **Dashboard polish** — glass panes with edge glow/sheen, colour-coded KPI
   cards + chips, chart endpoint callouts, expenses donut, mobile action
   button fixes, recent-activity/top-expenses reading real transaction
   fields, cash chart colour fix (teal not green).
4. **Mileage Tracker feature** (rideshare/trucking use case) — this is the
   main feature built across this session:
   - `src/views/MileageTracker.js` — one-tap **Start Trip** / **Stop** UI
     with a live GPS-based distance + elapsed-time counter, and a **Save
     Trip** bottom sheet (choose business/personal, purpose, note) on stop.
   - `src/views/TripHistory.js` — trip history screen: 4 stat tiles
     (business miles YTD, IRS estimated deduction at $0.67/mi, this-month
     total, all-time trip count), a 7-day horizontal day picker, and a list
     of trips for the selected day (business vs personal colour-coded).
   - `src/utils/tripStorage.js` — `fetchTrips()` / `saveTrip()` (talk to the
     `MileageTrip` backend route, scoped by `userId` from localStorage),
     plus pure helpers `getTripsForDay`, `getMonthSummary`,
     `getYearBusinessMiles`.
   - Routes: `/customer/mileage-tracker` and `/customer/trip-history` in
     `src/routes.js`, with sidebar entries ("Mileage Tracker", location-pin
     icon; "Trip History", map icon).
   - i18n strings added for both screens (`mileageTracker.*`,
     `tripHistory.*`).
   - Build order: manual-start GPS logging → moved to customer sidebar →
     rebuilt as the current one-tap + Save-sheet UI → added Trip History
     screen.
   - **Verified working** (this session, via headless Playwright + mocked
     API): Mileage Tracker renders its Start Trip button and 0.00mi/00:00:00
     counters correctly; Trip History renders stat tiles, day picker, and
     per-trip cards correctly once given trip data. No bugs found, no code
     changes were needed — the feature is complete and working as built.
5. Design-system foundation, two-panel premium login, modernized dashboard,
   navbar/sidebar/download-modal fixes — ported from a `staging`-only
   branch onto this feature branch (commits `2e22daa`..`8306927`).
6. Google OAuth login fix (invalid_scope, env-aware OAuth scopes) on staging.
7. Docker support for the frontend (multi-stage build + Nginx) —
   `DOCKER.md`.
8. Fixed GitHub push access for this repo (task #1, completed earlier).

## Roadmap — not started yet

- **Email/SMS receipt-to-transaction ingestion** — design pending. Idea:
  let users forward a receipt email or text a photo, auto-parse it into a
  transaction (vendor, amount, date, category) instead of manual entry.
- **IFTA quarterly fuel tax reporting** — design pending. For trucking
  users: aggregate mileage by jurisdiction/state per quarter for IFTA
  filing. Will likely build on the mileage tracker's trip data, so needs
  per-state mileage capture (trips don't currently record state/jurisdiction
  boundaries — that's a gap to design around).
- **Wrap mileage tracker in Capacitor for Android** — package the web app
  (specifically the mileage tracker) as a native Android app via Capacitor,
  primarily to get **background GPS tracking** (the current implementation
  is foreground-only, tied to the browser tab being open/active).

## User's own machine (separate from this sandbox)

The user (mesobinternational@gmail.com) is working from a personal Windows
machine (Git Bash / MINGW64 terminal) to eventually push commits and set up
the native Android build, since this sandbox currently has no GitHub write
access (see below). Track their setup progress here as it happens:

- **Android Studio: already downloaded/installed.** Needed for the
  Capacitor Android wrap (task #6). Don't ask them to install it again —
  ask what screen/state it's in if relevant.
- Local project folder: `~/projects/meksova` (their choice of name; matches
  the app/domain branding, not the repo name — that's fine, it's just a
  local folder label).
- They are new to git/terminal workflows — walk them through git commands
  one step at a time, plainly, and confirm each step actually completed
  before giving the next one. Don't bundle multiple steps into one message.
- Goal in progress: clone `Mesob-Finacial-Portal` into that folder so they
  can (a) push the pending `CLAUDE.md` commit themselves since this
  sandbox's GitHub access is blocked, and (b) continue on to setting up
  Capacitor + Android Studio for the native mileage-tracker app.

## Environment / testing notes (this sandbox)

- Dev server: `npm start` (CRA on port 3000). Auth is bypassed for local
  testing by setting `localStorage`: `authToken`, `role` (2 = customer),
  `user_email`, `userId`.
- **This sandbox's headless browser cannot reach the real AWS API** without
  extra proxy config (the environment's HTTPS proxy only accepts CONNECT
  tunnels; plain-HTTP `localhost:3000` navigation breaks if the whole
  browser is pointed at the proxy). When verifying pages that fetch backend
  data in this sandbox, prefer mocking the endpoint with Playwright's
  `page.route()` rather than fighting proxy config — this is fast and
  sufficient to validate UI/data-flow correctness.
- Playwright's pre-installed Chromium binary here is at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — launch with that
  `executablePath` (don't run `playwright install`).

## Conventions

- No comments unless explaining non-obvious "why".
- Don't add abstractions/error-handling beyond what's asked.
- Only commit/push when explicitly asked; never force-push or rewrite
  history without explicit permission.


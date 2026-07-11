# BOOKS AND NOTES CG BOARD — Work Log

This file tracks work done by the orchestrator and all subagents.

Project: A PDF book downloading & reading app ("BOOKS AND NOTES CG BOARD") built as a
Next.js 16 web app. Single `/` route renders a mobile-style User App + an Admin Panel
(CMS). Admin controls all content, sidebar, splash, ads, notifications.

Shared infrastructure already built (by orchestrator):
- Prisma schema: `prisma/schema.prisma` (Medium, Class, Subject, Book, SidebarItem,
  SplashSlide, BottomNavItem, AdConfig, NotificationConfig, AppSetting)
- Seed: `prisma/seed.ts` (2 mediums, 10 classes each, 6 subjects each, 3 books per
  subject = 360 books; sidebar, bottom nav, splash, ads, notifications, settings)
- Admin auth: `src/lib/auth.ts` (cookie session, password in AppSetting, default
  `admin123`)
- Admin guard: `src/lib/admin-guard.ts`
- Types: `src/lib/types.ts`
- API client: `src/lib/api.ts` (fetchAppConfig, fetchContent, registerDownload,
  adminLogin, adminLogout, adminCheck, adminRequest, BOOK_TYPES)
- Icon system: `src/lib/icons.tsx` (ICONS map, getIcon, ICON_NAMES for pickers)
- Stores:
  - `src/stores/library-store.ts` (downloads, download tasks w/ progress simulation,
    bookmarks, notes, reading progress, reader settings; persisted to localStorage)
  - `src/stores/app-store.ts` (mode app/admin, splashDone, online, screen nav,
    selectedMediumId/ClassId/Tab/SubjectId, sidebarOpen, readerBook, actionCounter)
- Data hook: `src/hooks/use-app-data.ts` (loads config + content tree)
- API routes:
  - `GET /api/app/config` (settings, splash, sidebar, bottomNav, adConfig, notifConfig)
  - `GET /api/app/content` (mediums->classes->subjects->books)
  - `POST /api/app/books/[id]/download` (increment downloads)
  - `POST/GET/DELETE /api/admin/auth`
  - `GET/POST/PUT/DELETE /api/admin/mediums`, `/classes`, `/subjects`, `/books`,
    `/sidebar`, `/splash`, `/bottomnav`
  - `GET/PUT /api/admin/ads`, `/notifications`, `/settings`
  - `GET /api/admin/stats`

DB is already pushed and seeded. `pdfjs-dist@6.1.200` is installed.

Design notes:
- Primary color emerald (#059669) with amber accents. AVOID indigo/blue.
- App name: "BOOKS AND NOTES CG BOARD".
- Hindi + English UI labels mixed.
- Mobile-first phone-frame UI for the User App; full-width dashboard for Admin.
- All components use shadcn/ui (New York) already installed in `src/components/ui/`.
- Lucide icons via `src/lib/icons.tsx`.

---

## Task ID: 11 — Admin Panel (CMS)

**Agent:** admin-builder
**Task:** Build the complete Admin Panel (CMS) at `src/components/admin/`
talking to the existing admin API routes. Entry component
`src/components/admin/admin-panel.tsx` exporting named `AdminPanel`,
lazy-loaded by `src/app/page.tsx`.

### Work Log

Created 15 files under `src/components/admin/`:

| File | Purpose |
|------|---------|
| `_shared.tsx` | SectionHeader, ConfirmDialog, IconPicker (lucide via ICON_NAMES), EmojiInput, ColorField, EmptyState, RowSkeleton, Field, formatNumber, truncate |
| `admin-panel.tsx` | Entry. On mount calls `adminCheck()`. Shows `AdminLogin` or `AdminShell`. Exports `AdminPanel`. |
| `admin-login.tsx` | Centered card, emerald gradient header, password input, calls `adminLogin`, toast "गलत पासवर्ड" on failure |
| `admin-shell.tsx` | Desktop sidebar nav (11 sections) + mobile top Select dropdown, Logout button, "User App देखें" link (`setMode("app")`) |
| `dashboard.tsx` | Fetches `/api/admin/stats`. 8 clickable stat cards, Top-5 downloaded books list, Books-by-type bar chart (recharts) |
| `mediums-manager.tsx` | Table CRUD with dialog (name, code, emoji, color picker, order, active) + confirm deletes |
| `classes-manager.tsx` | Medium filter select + table CRUD |
| `subjects-manager.tsx` | Cascade filter (medium → class) + table CRUD |
| `books-manager.tsx` | Cascade filter (medium→class→subject) + type filter. 3-tab dialog (मूल जानकारी / मीडिया / वर्गीकरण) with internal medium→class→subject cascade for subject selection, ALL book fields covered |
| `sidebar-manager.tsx` | List with icon preview (getIcon), inline active switch, edit/delete. Dialog with IconPicker, linkType (screen/external), linkValue select or URL |
| `bottomnav-manager.tsx` | Same pattern with screen select, icon preview |
| `splash-manager.tsx` | Grid of cards with image preview, duration/order badges, dialog with live image preview |
| `ads-manager.tsx` | Full AdConfig form: network select, master toggle, testMode toggle, App ID, 5 ad-type blocks, interstitialInterval. Live "active ad types" badges |
| `notifications-manager.tsx` | enabled toggle + OneSignal App ID input, info note linking onesignal.com |
| `settings-manager.tsx` | General settings card (app_name, app_tagline, primary_color picker, version, contact_email, privacy_url, about_text, require_internet) + separate "Change Admin Password" card |

**Patterns:** `"use client"` everywhere; `toast` from `sonner` for feedback
(Hindi labels); all deletes via `ConfirmDialog` (alert-dialog); loading
skeletons; empty states with Add button; tables in `overflow-x-auto`; refetch
after every mutation; inline active-toggles for sidebar/bottomnav.

**Linten:** `bun run lint` exits 0 — no errors/warnings in admin files.
IconPicker uses `React.createElement(getIcon(name), ...)` to satisfy the
`react-hooks/static-components` rule.

**Caveats:**
- The only remaining dev.log error is `Module not found:
  '@/components/app/user-app'` from `page.tsx` — that's the User App (separate
  task); I was instructed not to modify `page.tsx` or create files outside
  `src/components/admin/`.
- `books-manager` BookDialog casts `editing.subject.class.medium` through
  `unknown` to access `.id` (the BookRow TS type only declares `name`, but
  Prisma's include returns the full row).
- `IconPicker` uses sentinel value `"__none__"` internally because shadcn
  Select doesn't allow empty-string values; converted back to `""` on change.

### Stage Summary

Admin CMS fully built and lint-clean. All 11 sections (Dashboard, Mediums,
Classes, Subjects, Books, Sidebar, Bottom Nav, Splash, Ads, Notifications,
Settings) are implemented with consistent UX (confirm dialogs, toasts,
skeletons, empty states, responsive layouts). The Books manager is the
centerpiece: 3-tab dialog with internal cascade and live cover preview. The
admin panel mounts via `adminCheck()` and shows a polished login screen
(`admin123` default). Once the User App (`src/components/app/user-app.tsx`)
ships, the full `/` route will render both modes side-by-side via the existing
top switcher in `page.tsx`.

---
Task ID: ORCHESTRATOR (all + 13)
Agent: Z.ai Code (orchestrator)
Task: Build the complete "BOOKS AND NOTES CG BOARD" app — user app + admin panel CMS

Work Log:
- Built Prisma schema (Medium/Class/Subject/Book/SidebarItem/SplashSlide/BottomNavItem/AdConfig/NotificationConfig/AppSetting) + seed (2 mediums, 20 classes, 120 subjects, 360 books, sidebar, bottom nav, 4 splash slides, ad + notification config, settings)
- Built all API routes: /api/app/config, /api/app/content, /api/app/books/[id]/download, /api/admin/auth + full CRUD for mediums/classes/subjects/books/sidebar/splash/bottomnav, GET/PUT for ads/notifications/settings, GET /api/admin/stats
- Built admin auth (cookie session, password in AppSetting, default admin123) + admin guard
- Built shared infra: types.ts, api.ts, icons.tsx, library-store (downloads/bookmarks/notes/progress/reader settings, persisted), app-store (mode/screen/nav/reader)
- Built User App: splash screen (animated multi-slide), no-internet popup, sidebar (admin-controlled), bottom nav (admin-controlled), home flow (mediums→classes→tabs[Books/Notes/Other]→subjects→books), book card with download progress + read button, My Library (grouped by medium/class/subject), bookmarks, downloads, settings (reader settings, storage, ads, notifications, about), exit dialog, PDF reader integration
- Dispatched subagent for PDF reader (pdfjs-dist, zoom, scroll modes, page-turn animation, bookmarks, notes, night mode, reading progress) — created src/components/app/pdf-reader.tsx
- Dispatched subagent for Admin Panel (login, shell, dashboard, mediums/classes/subjects/books/sidebar/bottomnav/splash/ads/notifications/settings managers) — 15 files under src/components/admin/
- Created PDF proxy route /api/pdf to bypass CORS for remote PDFs
- Generated app icon via image-generation skill, wired into layout/splash/sidebar/top bar
- Verified end-to-end with Agent Browser: splash → home → medium → class → tabs → subject → download (progress) → read book (PDF canvas rendered, zoom works) → My Library (grouped correctly) → admin login (admin123) → dashboard (stats) → books manager → ads editor
- Fixed: missing /api/app/config route file, broken sample PDF URL, PDF CORS via proxy, lint errors (set-state-in-effect → derived exit dialog), unused eslint-disable warnings

Stage Summary:
- App fully functional and browser-verified. Lint clean (0 errors, 0 warnings). Dev server running on port 3000.
- User App (mobile-style, phone-frame on desktop): splash, no-internet gate, home navigation, download+read, My Library, bookmarks, downloads, settings, exit — all working.
- PDF Reader: renders real PDFs via pdfjs-dist through a server-side proxy; zoom, scroll modes, page-turn animation, bookmarks, notes, night mode, progress restore.
- Admin Panel (web CMS): password-protected; dashboard with stats + top books chart; full CRUD for mediums/classes/subjects/books + sidebar/bottomnav/splash management; ad config (AdMob/Facebook, all ad types); OneSignal notification config; app settings + password change.
- Admin default password: admin123
- Single / route renders both parts; top switcher toggles "User App" / "Admin Panel".

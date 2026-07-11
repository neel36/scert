# Task 11 — Admin Panel (CMS)

**Agent:** admin-builder
**Task:** Build the complete admin CMS at `src/components/admin/` that talks to
the existing admin API routes. Entry: `admin-panel.tsx` exporting named
`AdminPanel`, lazy-loaded by `src/app/page.tsx`.

## Files created (all under `src/components/admin/`)

| File | Purpose |
|------|---------|
| `_shared.tsx` | SectionHeader, ConfirmDialog (alert-dialog), IconPicker (lucide), EmojiInput, ColorField, EmptyState, RowSkeleton, Field, formatNumber, truncate |
| `admin-panel.tsx` | Entry. On mount calls `adminCheck()`. Shows AdminLogin or AdminShell. Exports `AdminPanel`. |
| `admin-login.tsx` | Centered card, emerald gradient header, password input, calls `adminLogin`, toast on failure ("गलत पासवर्ड") |
| `admin-shell.tsx` | Desktop sidebar nav + mobile top dropdown, Logout button, "User App देखें" link (`setMode("app")`). 11 sections. |
| `dashboard.tsx` | Fetches `/api/admin/stats`. 8 stat cards (clickable to navigate), Top-5 downloaded books list, Books-by-type bar chart (recharts). |
| `mediums-manager.tsx` | Table CRUD with dialog (name, code, emoji, color picker, order, active). Confirms deletes. |
| `classes-manager.tsx` | Medium filter select + table CRUD (name, code, emoji, order, active, mediumId). |
| `subjects-manager.tsx` | Cascade filter (medium → class) + table CRUD (name, emoji, order, active, classId). |
| `books-manager.tsx` | Cascade filter (medium→class→subject) + type filter. Table with title/type badge/path/downloads/active. Dialog has 3 tabs (मूल जानकारी / मीडिया / वर्गीकरण) covering ALL fields incl. internal medium→class→subject cascade for subject selection. |
| `sidebar-manager.tsx` | List with icon preview (getIcon), inline active switch, edit/delete. Dialog with IconPicker, linkType (screen/external), linkValue select or URL, order. |
| `bottomnav-manager.tsx` | Same pattern with screen select, icon preview, active toggle. |
| `splash-manager.tsx` | Grid of cards with image preview, duration badge, order badge. Dialog with image URL + live preview. |
| `ads-manager.tsx` | Form for full AdConfig: network select, master enabled toggle, testMode toggle, App ID, 5 ad-type blocks (banner/interstitial/native/rewarded/appOpen) each with enable + ad-unit-id, interstitialInterval. Live "active ad types" badges preview. |
| `notifications-manager.tsx` | enabled toggle + OneSignal App ID input. Info note linking onesignal.com. |
| `settings-manager.tsx` | Two cards: (1) General settings — app_name, app_tagline, primary_color (color picker), version, contact_email, privacy_url, about_text (textarea), require_internet (switch). (2) Change Admin Password card with current/new/confirm fields. |

## Patterns used everywhere

- `"use client"` at top of every file.
- `toast` from `sonner` for success/error feedback (Hindi labels).
- All deletes use `ConfirmDialog` (alert-dialog).
- Loading states: `RowSkeleton` for tables, animate-pulse for cards.
- Empty states with helpful message + Add button.
- Tables wrapped in `overflow-x-auto` for mobile.
- After every mutation, refetch the list for that section.
- All list-views show a refresh button.
- Inline active-toggle for sidebar/bottomnav items (PUT active only).

## Key implementation notes

- `IconPicker` uses `React.createElement(getIcon(name), { className })` to avoid
  the `react-hooks/static-components` lint rule (which forbids aliasing a
  looked-up component and using it as a JSX element).
- `books-manager` BookDialog does its own internal cascade fetch
  (medium → classes → subjects) so users can pick the subject inline. When
  editing, the book's `subject.class.medium.id` is used (Prisma returns full
  rows so id is present even though the BookRow TS type only declares `name`).
  Cast through `unknown` for safety.
- `admin-shell` uses `useAppStore` to call `setMode("app")` for the "back to
  user app" button (the parent `page.tsx` already wraps both modes).
- Default password hint shown on login screen: `admin123`.
- Responsive: sidebar collapses to a top Select dropdown on mobile
  (`lg:hidden` / `hidden lg:flex`).
- Emerald accent everywhere; no indigo/blue. Badge active states use
  `bg-emerald-100 text-emerald-700`.

## Lint status

`bun run lint` exits 0 — no errors, no warnings in admin files.

The only remaining dev.log error is `Module not found: '@/components/app/user-app'`
which is from `src/app/page.tsx` line 4 (the User App, a separate task — not in
my scope, and I was instructed not to modify `page.tsx`).

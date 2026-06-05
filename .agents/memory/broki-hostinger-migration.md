---
name: Broki Hostinger Migration
description: Architecture and key gotchas for the Hostinger Business Hosting migration of broki-inmobiliaria
---

## Architecture

- React SPA in `artifacts/broki-inmobiliaria` — fully static after build
- PHP 8 API in `hostinger-deploy/api/` (7 files, no Node/Express at runtime)
- MySQL via PDO; tables auto-created on first PHP request
- `VITE_STORAGE_MODE=localStorage` (Replit dev) | `api` (Hostinger prod)
- `VITE_API_BASE=/api` (production)

## Build command for Hostinger

```bash
pnpm --filter @workspace/broki-inmobiliaria run build:hostinger
# Output → artifacts/broki-inmobiliaria/dist-hostinger/
```

Uses `vite.config.hostinger.ts` (no Replit plugins, base=`/`, defines env vars at compile time).

## localStorage key mapping (critical!)

The storage adapter (`src/lib/storage-adapter.ts`) maps API keys to OLD localStorage keys:

| Adapter key      | localStorage key           |
|-----------------|---------------------------|
| site_content    | broki_content              |
| pricing         | broki_prices               |
| gallery         | broki_gallery              |
| whatsapp        | broki_whatsapp             |
| audiovisual_svc | broki_audiovisual_svc      |
| brokerage_svc   | broki_brokerage_svc        |
| hero_bg         | broki_hero_bg (RAW string) |
| active_track    | broki_active_track (RAW)   |

**Why:** Old local-db.ts used inconsistent keys (broki_content not broki_site_content). Adapter maintains backward compat so existing user data isn't lost.

**Raw string keys:** hero_bg and active_track are stored as raw strings (not JSON.stringify'd) in localStorage. The adapter handles this via `LS_RAW_KEYS` Set.

## Async queries — null guard requirement

Switching from sync `getDB()` to async `getData()` means React Query's `data` is `undefined` during the loading state (not the fallback). Any component that renders based on query data MUST guard against undefined, e.g.:

```tsx
// BAD — crashes on first render
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' '); // crashes when text=undefined
}

// GOOD
function AnimatedTitle({ text }: { text: string | undefined }) {
  const words = (text ?? '').split(' ');
}
```

**Why:** Old hooks used sync queryFn that returned immediately. New async queryFn triggers a loading state. Fixed in home.tsx AnimatedTitle.

## Auth flow

- **localStorage mode (dev):** SHA-256 hash comparison via security.ts; sets `broki_auth` in localStorage
- **API mode (prod):** POST to `/api/auth.php` → bcrypt verify → PHP session cookie; also sets `broki_auth` in localStorage for layout auth check compatibility
- `apiLogout()` destroys both PHP session and localStorage flag
- Admin credentials default: `broki` / `1111`

## File uploads

- In localStorage mode: base64 data URLs stored directly
- In API mode: files uploaded to `/uploads/images/` or `/uploads/audio/`; URL stored in MySQL
- `setData('hero_bg', base64)` automatically detects base64 and converts to file upload in API mode
- `AudioPlayer` uses `track.data` as `<audio src>` — works with both base64 and URL

# Backend API Request Schema

> **Purpose**: Reference document for the backend meeting. Defines the exact endpoints and JSON shapes the frontend needs.
>
> **Frontend type contract**: [`src/app/types/index.ts`](src/app/types/index.ts)
> **Mock data (valid response example)**: [`src/app/mockData.ts`](src/app/mockData.ts)
> **Source brief**: `Acquisition-Brief_ Streamer Leaderboard Landing Page.pdf`

---

## Architecture Overview

A **cron job on the frontend side** runs every 15 minutes:
2. Calls `GET /campaigns/{slug}` for each active campaign to get fresh data.
3. Caches the results locally — **the end-user's browser never hits the backend directly**.
4. `lastUpdated` and `nextUpdate` timestamps are computed frontend-side (cron fetch timestamps), **not returned by the backend**.

```
┌──────────┐  every 15 min   ┌─────────┐––
│ Frontend │ ──────────────► │ Backend │
│ Cron Job │ ◄────────────── │   API   │
└────┬─────┘   JSON response └─────────┘
     │
     │ writes to local cache
     ▼
┌──────────┐
│  Static  │  ◄── End-user browsers read from here
│  Cache   │
└──────────┘
```

### Scope

**The backend provides everything.** The frontend calls two endpoints and gets all the data it needs — campaign config, streamer info, prizes, and leaderboard players — in a single unified response. How the backend sources or stores this data internally is not a frontend concern.

---

## Endpoints

| Method | Path                  | Purpose                                      | Auth     |
| ------ | --------------------- | -------------------------------------------- | -------- |
| GET    | `/campaigns`          | List all active campaigns (cron discovery)   | Basic Auth |
| GET    | `/campaigns/{slug}`   | Full campaign + leaderboard for one streamer | Basic Auth |

---

## 1. `GET /campaigns` — Campaign List

Minimal payload so the cron job knows which streamer pages to build/rebuild.

### Request

```
GET /campaigns HTTP/1.1
Authorization: Basic base64({username}:{password})
```

### Response `200 OK`

```jsonc
{
  "campaigns": [
    {
      "slug": "garret-star",
      "status": "active/ended",
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-02-28T23:59:59Z"
    },
    {
      "slug": "lucky-dreams",
      "status": "active",
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-03-15T23:59:59Z"
    }
  ]
}
```

### Field Reference

| Field          | Type     | Required | Notes                                                              |
| -------------- | -------- | -------- | ------------------------------------------------------------------ |
| `slug`         | `string` | Yes      | URL-safe. Used in `GET /campaigns/{slug}` and as the page route.   |
| `status`       | `string` | Yes      | `"active"` or `"ended"`. Cron uses this to tear down ended pages.  |
| `startDate`    | `string` | Yes      | ISO 8601 UTC.                                                      |
| `endDate`      | `string` | Yes      | ISO 8601 UTC.                                                      |

### Notes

- **Auth**: Basic Auth (cron → backend).
- **Include `"ended"` campaigns** for at least 3 hours after they end, so the cron can remove/archive those pages gracefully.

---

## 2. `GET /campaigns/{slug}` — Campaign Detail

Returns everything the frontend needs to render a single streamer's leaderboard page. Maps directly to the `CampaignResponse` TypeScript interface the frontend already consumes.

### Request

```
GET /campaigns/{slug} HTTP/1.1
Authorization: Basic base64({username}:{password})
```

### Response `200 OK`

```jsonc
{
  "streamer": {
    "name": "Garret Star",
    "avatarUrl": "https://cdn.example.com/streamers/garret-star/avatar.jpeg",
    "bannerUrl": "https://cdn.example.com/streamers/garret-star/banner.png",
    "customHeadline": "Win an iPhone 17, iPad, or Apple Watch!",
    "stag": "149542"
  },
  "campaign": {
    "endDate": "2026-02-28T23:59:59Z",
    "usePointsTerminology": false,
    "firstPrizeUnlockThreshold": 15000,  // Optional. Omit if no lock mechanism.
    "prizes": {
      "1": "iPhone 17",
      "2": "iPad",
      "3": "Apple Watch"
    }
  },
  "leaderboard": {
    "players": [
      {
"rank": 1,
        "username": "str***er1",
        "score": 10996.40
      },
      {
"rank": 2,
        "username": "gam***99",
        "score": 8845.40
      }
      // ... up to 10 players total
    ]
  }
}
```

> **Note**: `lastUpdated` and `nextUpdate` are **NOT** in this response. The frontend cron job computes these from its own fetch timestamps (see Architecture Overview).

---

### Field Reference — `streamer`

| Field            | Type     | Required | Notes                                                                                      |
| ---------------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| `name`           | `string` | Yes      | Streamer display name. Shown in header and hero.                                           |
| `avatarUrl`      | `string` | Yes      | **Full CDN URL**. If empty string `""`, the frontend renders a text-fallback logo.         |
| `bannerUrl`      | `string` | Yes      | **Full CDN URL** for the streamer image (transparent bg) displayed on top of the hero banner. |
| `customHeadline` | `string` | No       | Optional custom headline (e.g., prize callout). If omitted, frontend uses default copy.    |
| `stag`           | `string` | Yes      | Streamer-specific tracking parameter. Appended to all CTAs as `?stag={value}`.             |

### Field Reference — `campaign`

| Field                       | Type      | Required | Notes                                                                                                  |
| --------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `endDate`                   | `string`  | Yes      | ISO 8601 UTC. Frontend converts to user's local timezone for countdown display.                        |
| `usePointsTerminology`      | `boolean` | No       | `true` = display "Points" column header. Defaults to `false` (display "Wagered Amount").               |
| `firstPrizeUnlockThreshold` | `number`  | No       | Wagered amount the #1 player must reach to unlock the 1st prize. If omitted, no lock mechanism.        |
| `prizes`                    | `object`  | Yes      | Keys are `"1"`, `"2"`, `"3"`. Values are prize display names. Every campaign is a giveaway per the brief. |

### Field Reference — `leaderboard`

| Field     | Type      | Required | Notes                          |
| --------- | --------- | -------- | ------------------------------ |
| `players` | `Player[]`| Yes      | Top 10, sorted by score desc. Can be empty `[]` if no data yet. |

### Field Reference — `Player`

| Field      | Type     | Required | Notes                                                                                          |
| ---------- | -------- | -------- | ---------------------------------------------------------------------------------------------- |
| `rank`     | `number` | Yes      | 1-indexed position. Backend must assign this (1–10).                                           |
| `username` | `string` | Yes      | Raw username or Player ID. The cron job handles masking before caching (e.g., `"streamer1"` → `"str***er1"`). |
| `score`    | `number` | Yes      | Raw numeric value (e.g., `10996.40`). Frontend labels this as "Wagered Amount" or "Points" based on `usePointsTerminology`. |

---

## 3. Error Responses

Use a consistent error shape for all endpoints.

### `404 Not Found` — No active campaign for this slug

```json
{
  "error": {
    "code": "CAMPAIGN_NOT_FOUND",
    "message": "No active campaign found for slug 'nonexistent-streamer'."
  }
}
```

### `500 Internal Server Error` — Upstream data source failure

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to fetch leaderboard data from upstream provider."
  }
}
```

### `401 Unauthorized` — (if auth is required)

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication credentials."
  }
}
```

---

## 4. Key Decisions & Constraints for the Backend Team

### Username Masking
- Backend returns **raw** usernames/Player IDs.
- The **cron job** handles masking before writing to cache (e.g., `streamer1` → `str***er1`).
- End-users never see raw identifiers — masking happens at the cron layer, not the backend.

### Sorting & Limiting
- Backend sorts players by `score` descending.
- Backend returns **top 10 only** — the frontend does not paginate or request more.

### Timestamps
- All date/time values must be **ISO 8601 UTC** (e.g., `"2026-02-28T23:59:59Z"`).
- The frontend handles local timezone conversion for display.

### `lastUpdated` / `nextUpdate`
- These fields are **NOT returned by the backend**.
- They are computed by the frontend cron job based on its own fetch timestamps.
- If a fetch fails, the frontend keeps the previous cached data and does **not** update `lastUpdated` (per the brief: *"The 'Last Updated' timestamp should only change when the API successfully returns new data."*).

### Image URLs
- All image fields (`avatarUrl`, `bannerUrl`) must be **full CDN URLs** (e.g., `https://cdn.example.com/...`), not relative paths.
- The frontend currently uses local paths in mock data (`/assets/garret-avatar.jpeg`) — production must use absolute URLs.

### `usePointsTerminology` Flag
- When `true`, the frontend displays "Points" instead of "Wagered Amount" as the column header and formats values without currency symbols.
- The backend always sends raw numeric `score` values regardless of this flag.
- This is a **display-only** concern — the flag simply tells the frontend how to label the numbers.

### `firstPrizeUnlockThreshold`
- When present (e.g., `15000`), the frontend shows an "unlock" indicator: *"X points left to unlock 1st prize"*.
- When omitted, no lock mechanism is displayed (used for the home page / global campaigns).
- The backend determines the threshold per campaign. Claudio & Alessandro define this before each tournament.

### Prizes
- The `prizes` object is required — every campaign is a giveaway per the brief.
- Keys must be the strings `"1"`, `"2"`, `"3"` — corresponding to 1st, 2nd, 3rd place.
- Values are display strings (e.g., `"iPhone 17"`, `"iPad"`).

---

## 5. Open Questions for the Meeting

| #  | Question                                                                                                           | Recommendation                                                                 |
| -- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1  | **Display logic**: Does the backend return raw wagered amounts + the `usePointsTerminology` flag, or handle display formatting itself? | Backend sends raw numbers + the flag. Frontend formats. Keeps the backend simple. |
| 2  | **STAG**: Is the STAG always the same per streamer, or can it change per campaign?                                 | If it can change, it must be part of the campaign response (already is). If static per streamer, it could move to streamer config. |
| 3  | **Rate limiting**: Any rate limits on the backend endpoints? The cron calls once per campaign every 15 minutes.     | Should be well within limits, but good to confirm.                             |
| 4  | **Cache headers**: Will the backend set `Cache-Control` headers, or is caching entirely frontend-managed?           | Frontend manages its own cache. Backend can set short cache headers as a safety net. |
| 5  | **Ended campaigns**: How long should ended campaigns remain in the `GET /campaigns` list?                           | At least 24 hours, so the cron can clean up gracefully.                        |

---

## Appendix: Type ↔ Schema Cross-Reference

Verification that every field in `src/app/types/index.ts` is accounted for:

| TypeScript Field                          | In Backend Response? | Notes                                          |
| ----------------------------------------- | -------------------- | ---------------------------------------------- |
| `Player.rank`                             | Yes                  | `leaderboard.players[].rank`                   |
| `Player.username`                         | Yes                  | `leaderboard.players[].username` (raw; cron masks before caching) |
| `Player.wagered` → `Player.score`         | Yes                  | `leaderboard.players[].score` (renamed to neutral term) |
| `streamer.name`                           | Yes                  | `streamer.name`                                |
| `streamer.avatarUrl`                      | Yes                  | `streamer.avatarUrl` (full CDN URL)            |
| `streamer.bannerUrl`                      | Yes                  | `streamer.bannerUrl` (full CDN URL)            |
| `streamer.customHeadline`                 | Yes                  | `streamer.customHeadline` (optional)           |
| `streamer.stag`                           | Yes                  | `streamer.stag`                                |
| `campaign.endDate`                        | Yes                  | `campaign.endDate`                             |
| `campaign.usePointsTerminology`           | Yes                  | `campaign.usePointsTerminology`                |
| `campaign.firstPrizeUnlockThreshold`      | Yes                  | `campaign.firstPrizeUnlockThreshold`           |
| `campaign.prizes`                         | Yes                  | `campaign.prizes` (optional)                   |
| `leaderboard.lastUpdated`                 | **No**               | Computed frontend-side by cron job             |
| `leaderboard.nextUpdate`                  | **No**               | Computed frontend-side by cron job             |
| `leaderboard.players`                     | Yes                  | `leaderboard.players`                          |

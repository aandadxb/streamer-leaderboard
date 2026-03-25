# Streamer Leaderboard — API Contract v2

> **Version**: 2.0 Draft
> **Date**: March 2026
> **Auth**: Basic Auth on all endpoints

---

## What Changed from v1

In v1, campaign metadata (streamer info, prizes, dates, thresholds, etc.) was fetched from the backend alongside leaderboard data. In v2, **all campaign configuration is static** — provided to us as a JSON config file that we store and update on our end. The backend now **only serves leaderboard data**, identified by a `streamer-slug`.

| Concern                | v1                        | v2                                  |
| ---------------------- | ------------------------- | ----------------------------------- |
| Campaign list          | `GET /campaigns`          | **Static config** (provided to us)  |
| Streamer info & prizes | `GET /campaigns/{slug}`   | **Static config** (provided to us)  |
| Leaderboard data       | `GET /campaigns/{slug}`   | `GET /leaderboard/{streamer-slug}`  |

---

## Static Campaign Configuration

> **This is NOT an API endpoint.** This is a JSON configuration file that the partner team provides to us periodically (e.g., when a new campaign launches or an existing one changes). We store this config in our backend and use it to drive the frontend.

Whenever a campaign is created, updated, or ended, the partner team sends us an updated config. We update our backend accordingly.

### Example Config

```json
{
  "campaigns": [
    {
      "slug": "garret-star",
      "status": "active",
      "streamer": {
        "name": "Garret Star",
        "avatarUrl": "https://{cdn_url}/streamers/garret-star/avatar.jpeg",
        "bannerUrl": "https://{cdn_url}/streamers/garret-star/banner.png",
        "customHeadline": "Win an iPhone 17, iPad, or Apple Watch!",
        "stag": "149542"
      },
      "campaign": {
        "startDate": "2026-02-01T00:00:00Z",
        "endDate": "2026-02-28T23:59:59Z",
        "usePointsTerminology": false,
        "firstPrizeUnlockThreshold": 15000,
        "prizes": {
          "1": "iPhone 17",
          "2": "iPad",
          "3": "Apple Watch"
        }
      }
    },
    {
      "slug": "vegas-mike",
      "status": "active",
      "streamer": {
        "name": "Vegas Mike",
        "avatarUrl": "",
        "bannerUrl": "https://{cdn_url}/streamers/vegas-mike/banner.png",
        "stag": "288103"
      },
      "campaign": {
        "startDate": "2026-03-01T00:00:00Z",
        "endDate": "2026-03-31T23:59:59Z",
        "prizes": {
          "1": "$500 Cash",
          "2": "$200 Cash",
          "3": "$100 Cash"
        }
      }
    }
  ]
}
```

### Config JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["campaigns"],
  "properties": {
    "campaigns": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["slug", "status", "streamer", "campaign"],
        "properties": {
          "slug": {
            "type": "string",
            "description": "URL-safe campaign identifier. Must match the streamer-slug used to fetch leaderboard data from the partner backend. Also used as the page route.",
            "examples": ["garret-star", "vegas-mike"]
          },
          "status": {
            "type": "string",
            "enum": ["active", "ended"],
            "description": "Campaign lifecycle status. 'ended' campaigns remain visible on the frontend until removed from the config."
          },
          "streamer": {
            "type": "object",
            "required": ["name", "avatarUrl", "bannerUrl", "stag"],
            "properties": {
              "name": {
                "type": "string",
                "description": "Streamer display name.",
                "examples": ["Garret Star"]
              },
              "avatarUrl": {
                "type": "string",
                "description": "Full CDN URL for streamer avatar. Empty string triggers a text-fallback logo on the frontend.",
                "examples": ["https://{cdn_url}/streamers/garret-star/avatar.jpeg", ""]
              },
              "bannerUrl": {
                "type": "string",
                "description": "Full CDN URL for the streamer image displayed on top of the hero banner.",
                "examples": ["https://{cdn_url}/streamers/garret-star/banner.png"]
              },
              "customHeadline": {
                "type": "string",
                "description": "Optional headline text displayed in the hero. If omitted, the frontend uses default copy.",
                "examples": ["Win an iPhone 17, iPad, or Apple Watch!"]
              },
              "stag": {
                "type": "string",
                "description": "Streamer-specific tracking parameter. Appended to all CTA links as ?stag={value}.",
                "examples": ["149542"]
              }
            }
          },
          "campaign": {
            "type": "object",
            "required": ["startDate", "endDate", "prizes"],
            "properties": {
              "startDate": {
                "type": "string",
                "format": "date-time",
                "description": "Campaign start date in ISO 8601 UTC.",
                "examples": ["2026-02-01T00:00:00Z"]
              },
              "endDate": {
                "type": "string",
                "format": "date-time",
                "description": "Campaign end date in ISO 8601 UTC. Frontend converts to user's local timezone for countdown display.",
                "examples": ["2026-02-28T23:59:59Z"]
              },
              "usePointsTerminology": {
                "type": "boolean",
                "default": false,
                "description": "When true, the frontend displays 'Points' instead of 'Wagered Amount' as the column header."
              },
              "firstPrizeUnlockThreshold": {
                "type": "number",
                "description": "Score the #1 player must reach to unlock the 1st prize. If omitted, no lock mechanism is applied.",
                "examples": [15000]
              },
              "prizes": {
                "type": "object",
                "required": ["1", "2", "3"],
                "description": "Prize display names for the top 3 positions.",
                "properties": {
                  "1": { "type": "string", "examples": ["iPhone 17"] },
                  "2": { "type": "string", "examples": ["iPad"] },
                  "3": { "type": "string", "examples": ["Apple Watch"] }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Config Update Process

> **Important:** The partner team will provide us updated JSON configs from time to time (e.g., via email, Slack, or a shared channel). When we receive a new config, we update our backend to reflect the changes. This is a manual/semi-automated handoff — **there is no API for config delivery**. The config drives which campaigns exist, their metadata, and their display settings. The only dynamic data we fetch from the partner backend is the leaderboard itself.

- New campaign launches: partner sends updated config with the new entry
- Campaign ends: partner sends config with `status` changed to `"ended"` (or entry removed)
- Prize/copy changes: partner sends config with updated fields
- We ingest the config into our backend and the frontend picks it up

---

## Authentication

All requests to the leaderboard endpoint require **HTTP Basic Auth**.

```
Authorization: Basic base64({username}:{password})
```

**Example** (credentials: `api_user` / `s3cretP@ss`):

```bash
curl -u api_user:s3cretP@ss https://{base_url}/leaderboard/garret-star
```

---

## Endpoint

| Method | Path                            | Description                                     |
| ------ | ------------------------------- | ----------------------------------------------- |
| `GET`  | `/leaderboard/{stag}`  | Fetch leaderboard data for a specific streamer   |

> **Only one endpoint.** All campaign metadata (streamer info, prizes, dates, etc.) comes from the static config we maintain on our side.

---

## `GET /leaderboard/{streamer-slug}`

Returns **only the leaderboard data** for a given streamer. The `streamer-slug` is the same identifier used in our static config (`slug` field) to correlate leaderboard data with the correct campaign.

### Path Parameters

| Parameter        | Type     | Description                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------------- |
| `streamer-slug`  | `string` | URL-safe streamer identifier. Must match a `slug` in our static config.     |

### curl

```bash
curl -u api_user:s3cretP@ss \
  https://{base_url}/leaderboard/garret-star
```

### Response `200 OK`

```json
{
  "stag": "<stag here>",
  "players": [
    { "rank": 1, "username": "streamer1", "score": 10996.40 },
    { "rank": 2, "username": "gambler99", "score": 8845.40 },
    { "rank": 3, "username": "luckystrike", "score": 6396.38 },
    { "rank": 4, "username": "betmax", "score": 5200.00 },
    { "rank": 5, "username": "highroller", "score": 4100.50 },
    { "rank": 6, "username": "xqcfan", "score": 3500.00 },
    { "rank": 7, "username": "ninjastar", "score": 2800.75 },
    { "rank": 8, "username": "progamer", "score": 2100.00 },
    { "rank": 9, "username": "noob69", "score": 1500.25 },
    { "rank": 10, "username": "winner", "score": 950.00 }
  ]
}
```

### Response `200 OK` — Empty Leaderboard

```json
{
  "streamerSlug": "vegas-mike",
  "players": []
}
```

### JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["streamerSlug", "players"],
  "properties": {
    "streamerSlug": {
      "type": "string",
      "description": "Echo of the streamer-slug path parameter. Used to confirm which streamer's leaderboard was returned.",
      "examples": ["garret-star", "vegas-mike"]
    },
    "players": {
      "type": "array",
      "maxItems": 10,
      "description": "Top 10 players sorted by score descending. Can be empty if no data yet.",
      "items": {
        "type": "object",
        "required": ["rank", "username", "score"],
        "properties": {
          "rank": {
            "type": "integer",
            "minimum": 1,
            "maximum": 10,
            "description": "1-indexed leaderboard position.",
            "examples": [1]
          },
          "username": {
            "type": "string",
            "description": "Raw username or Player ID. The frontend cron job handles masking before serving to end-users.",
            "examples": ["streamer1", "gambler99"]
          },
          "score": {
            "type": "number",
            "description": "Raw numeric score. The frontend labels this as 'Wagered Amount' or 'Points' based on the static campaign config.",
            "examples": [10996.40]
          }
        }
      }
    }
  }
}
```

---

## Error Responses

All errors follow a consistent shape.

### `401 Unauthorized`

```bash
curl -u wrong_user:wrong_pass \
  https://{base_url}/leaderboard/garret-star
```

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication credentials."
  }
}
```

### `404 Not Found`

```bash
curl -u api_user:s3cretP@ss \
  https://{base_url}/leaderboard/nonexistent-streamer
```

```json
{
  "error": {
    "code": "STREAMER_NOT_FOUND",
    "message": "No leaderboard data found for streamer-slug 'nonexistent-streamer'."
  }
}
```

### `500 Internal Server Error`

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to fetch leaderboard data."
  }
}
```

### Error JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["error"],
  "properties": {
    "error": {
      "type": "object",
      "required": ["code", "message"],
      "properties": {
        "code": {
          "type": "string",
          "enum": ["UNAUTHORIZED", "STREAMER_NOT_FOUND", "INTERNAL_ERROR"],
          "description": "Machine-readable error code."
        },
        "message": {
          "type": "string",
          "description": "Human-readable error description."
        }
      }
    }
  }
}
```

---

## How It All Fits Together

```
Partner Team                       Our Backend                     Our Frontend
─────────────                      ───────────                     ────────────

 Provides JSON config ──────────►  Stores campaign config  ──────► Renders streamer pages,
 (streamer info, prizes,           (static data: names,            prizes, countdowns, etc.
  dates, thresholds)                images, prizes, dates)          from static config
  from time to time
                                          │
                                          │ Cron job uses streamer-slug
                                          │ from config to call:
                                          ▼
                                   GET /leaderboard/{streamer-slug}
                                   (partner's backend)
                                          │
                                          ▼
                                   Stores leaderboard ────────────► Renders leaderboard
                                   data (players, scores)           table with live rankings
```

1. **Partner provides config** — A JSON file with all campaign metadata (streamer details, prizes, dates, thresholds). Delivered to us periodically via an agreed channel (not an API call).
2. **We store the config** — Our backend ingests the config. This is the source of truth for everything *except* leaderboard rankings.
3. **We fetch leaderboard data** — Our cron job iterates over active campaigns in the config, uses each `slug` as the `streamer-slug` to call `GET /leaderboard/{streamer-slug}` on the partner's backend.
4. **Frontend renders** — Campaign metadata from static config + live leaderboard data from the API.

---

## Notes

- **All timestamps** in the config are ISO 8601 UTC (e.g., `2026-02-28T23:59:59Z`). The frontend handles timezone conversion.
- **Image URLs** (`avatarUrl`, `bannerUrl`) must be full absolute URLs, not relative paths.
- **Usernames** can be returned raw or masked already (e.g., `streamer1` -> `str***er1`).
- **Sorting & limiting**: Partner backend returns top 10 players sorted by score descending.
- **The `streamer-slug`** is the single key that ties our static config to the partner's leaderboard endpoint. It must match exactly on both sides.

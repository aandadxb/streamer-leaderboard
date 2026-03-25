# Streamer Leaderboard — API Contract

> **Version**: 1.0 Draft
> **Date**: March 2026
> **Auth**: Basic Auth on all endpoints

---

## Authentication

All requests require **HTTP Basic Auth**.

```
Authorization: Basic base64({username}:{password})
```

**Example** (credentials: `api_user` / `s3cretP@ss`):

```bash
# The -u flag handles Base64 encoding automatically
curl -u api_user:s3cretP@ss https://{base_url}/campaigns
```

Which sends the header:

```
Authorization: Basic YXBpX3VzZXI6czNjcmV0UEBzcw==
```

---

## Endpoints

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| `GET`  | `/campaigns`        | List all active/ended campaigns      |
| `GET`  | `/campaigns/{slug}` | Full campaign detail + leaderboard   |

---

## 1. `GET /campaigns`

Returns the list of campaigns so the cron job knows which streamer pages to fetch.

### curl

```bash
curl -u api_user:s3cretP@ss \
  https://{base_url}/campaigns
```

### Response `200 OK`

```json
{
  "campaigns": [
    {
      "slug": "garret-star",
      "status": "active",
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-02-28T23:59:59Z"
    },
    {
      "slug": "vegas-mike",
      "status": "ended",
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-01-31T23:59:59Z"
    }
  ]
}
```

### JSON Schema

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
        "required": ["slug", "status", "startDate", "endDate"],
        "properties": {
          "slug": {
            "type": "string",
            "description": "URL-safe campaign identifier. Used as the path param in GET /campaigns/{slug} and as the page route.",
            "examples": ["garret-star", "vegas-mike"]
          },
          "status": {
            "type": "string",
            "enum": ["active", "ended"],
            "description": "Campaign status. 'ended' campaigns should remain in the list for at least 3 hours so the frontend can clean up."
          },
          "startDate": {
            "type": "string",
            "format": "date-time",
            "description": "Campaign start date in ISO 8601 UTC.",
            "examples": ["2026-02-01T00:00:00Z"]
          },
          "endDate": {
            "type": "string",
            "format": "date-time",
            "description": "Campaign end date in ISO 8601 UTC.",
            "examples": ["2026-02-28T23:59:59Z"]
          }
        }
      }
    }
  }
}
```

---

## 2. `GET /campaigns/{slug}`

Returns everything needed to render a single streamer's leaderboard page.

### curl

```bash
curl -u api_user:s3cretP@ss \
  https://{base_url}/campaigns/garret-star
```

### Response `200 OK` — Full Example

```json
{
  "streamer": {
    "name": "Garret Star",
    "avatarUrl": "https://{cdn_url}/streamers/garret-star/avatar.jpeg",
    "bannerUrl": "https://{cdn_url}/streamers/garret-star/banner.png",
    "customHeadline": "Win an iPhone 17, iPad, or Apple Watch!",
    "stag": "149542"
  },
  "campaign": {
    "endDate": "2026-02-28T23:59:59Z",
    "usePointsTerminology": false,
    "firstPrizeUnlockThreshold": 15000,
    "prizes": {
      "1": "iPhone 17",
      "2": "iPad",
      "3": "Apple Watch"
    }
  },
  "leaderboard": {
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
}
```

### Response `200 OK` — Minimal Example (no optional fields)

```json
{
  "streamer": {
    "name": "Vegas Mike",
    "avatarUrl": "",
    "bannerUrl": "https://{cdn_url}/streamers/vegas-mike/banner.png",
    "stag": "288103"
  },
  "campaign": {
    "endDate": "2026-03-31T23:59:59Z",
    "prizes": {
      "1": "$500 Cash",
      "2": "$200 Cash",
      "3": "$100 Cash"
    }
  },
  "leaderboard": {
    "players": []
  }
}
```

### JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["streamer", "campaign", "leaderboard"],
  "properties": {
    "streamer": {
      "type": "object",
      "required": ["name", "avatarUrl", "bannerUrl", "stag"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Streamer display name. Shown in the page header and hero section.",
          "examples": ["Garret Star"]
        },
        "avatarUrl": {
          "type": "string",
          "description": "Full CDN URL for streamer avatar. Empty string triggers a text-fallback logo on the frontend.",
          "examples": ["https://{cdn_url}/streamers/garret-star/avatar.jpeg", ""]
        },
        "bannerUrl": {
          "type": "string",
          "description": "Full CDN URL for the streamer image (transparent background) displayed on top of the hero banner.",
          "examples": ["https://{cdn_url}/streamers/garret-star/banner.png"]
        },
        "customHeadline": {
          "type": "string",
          "description": "Optional headline text displayed in the hero (e.g., prize callout). If omitted, the frontend uses default copy.",
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
      "required": ["endDate", "prizes"],
      "properties": {
        "endDate": {
          "type": "string",
          "format": "date-time",
          "description": "Campaign end date in ISO 8601 UTC. Frontend converts to user's local timezone for countdown display.",
          "examples": ["2026-02-28T23:59:59Z"]
        },
        "usePointsTerminology": {
          "type": "boolean",
          "default": false,
          "description": "When true, the frontend displays 'Points' instead of 'Wagered Amount' as the column header. Defaults to false."
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
            "1": {
              "type": "string",
              "description": "1st place prize.",
              "examples": ["iPhone 17"]
            },
            "2": {
              "type": "string",
              "description": "2nd place prize.",
              "examples": ["iPad"]
            },
            "3": {
              "type": "string",
              "description": "3rd place prize.",
              "examples": ["Apple Watch"]
            }
          }
        }
      }
    },
    "leaderboard": {
      "type": "object",
      "required": ["players"],
      "properties": {
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
                "description": "Raw numeric score. The frontend labels this as 'Wagered Amount' or 'Points' based on usePointsTerminology.",
                "examples": [10996.40]
              }
            }
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
  https://{base_url}/campaigns
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
  https://{base_url}/campaigns/nonexistent-streamer
```

```json
{
  "error": {
    "code": "CAMPAIGN_NOT_FOUND",
    "message": "No active campaign found for slug 'nonexistent-streamer'."
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
          "enum": ["UNAUTHORIZED", "CAMPAIGN_NOT_FOUND", "INTERNAL_ERROR"],
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

## Notes

- **All timestamps** are ISO 8601 UTC (e.g., `2026-02-28T23:59:59Z`). The frontend handles timezone conversion.
- **Image URLs** (`avatarUrl`, `bannerUrl`) must be full absolute URLs, not relative paths.
- **Usernames** can be returned raw or masked already (e.g., `streamer1` → `str***er1`).
- **Sorting & limiting**: Backend returns top 10 players sorted by score descending.

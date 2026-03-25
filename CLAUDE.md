# Project Guidelines

## Read-Only Database Tables
The `leaderboard_campaign` and `leaderboard_influencer` tables are **read-only** — populated by an external system. Never write to, update, or delete from these tables via Prisma or application code. The `leaderboard_influencer` model is marked `@@ignore` in the Prisma schema and queried via raw SQL.

## Database Schema
This project uses `prisma db push` (not migrations). There is no `prisma/migrations` directory.

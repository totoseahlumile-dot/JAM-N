# JAM'N Backend

Node.js, Express, and MySQL REST API.

## Local setup

1. Install dependencies with `npm install` inside `Backend`.
2. Copy `.env.example` to `.env` and enter your MySQL credentials.
3. Run the root `database.sql` file in MySQL to create the schema and seed data.
4. Start the API with `npm run dev`.

For an existing database, run `npm run migrate` before starting the API. Each
numbered file in `database/migrations` runs once and is checksum-protected.

## Testing

- `npm test` runs fast API tests without requiring database records.
- `npm run test:integration` recreates an isolated `jam_n_test` database, runs
  authentication, ownership, catalog, and social flows, then deletes it.
- `npm run test:all` runs both suites.

The integration command intentionally refuses to use a database name without
the `_test` suffix. It uses the MySQL server credentials from `.env` but never
reads from or writes to the configured development database.

The basic health endpoint is `GET http://localhost:3000/api/health`.
Use `GET /api/health/database` to verify the configured MySQL connection.

Interactive OpenAPI documentation is available at `GET /api/docs`. The raw
OpenAPI 3.1 document is available at `GET /api/docs/openapi.json`.

## Authentication endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh` rotates the HttpOnly refresh-token cookie
- `POST /api/auth/logout` revokes the current refresh token
- `POST /api/auth/logout-all` revokes every session for the authenticated user
- `GET /api/auth/me` with an `Authorization: Bearer <token>` header

Access tokens expire after 15 minutes by default. Refresh tokens expire after
30 days, are stored as SHA-256 hashes, and rotate on every refresh. Reusing an
old rotated token revokes all refresh sessions for that account.

## Catalog endpoints

Public reads are available at `/api/artists`, `/api/genres`, `/api/events`,
`/api/albums`, and `/api/tracks`. Each resource also supports `GET /:id`.
List endpoints accept `limit` and `offset`; artists also accept `search` and
`genre`, while albums and tracks accept `artistId`.

Each catalog resource supports `POST /`, `PUT /:id`, and `DELETE /:id` with an
`Authorization: Bearer <token>` header. Artist accounts and admins can manage
artists, albums, and tracks. Only admins can manage genres and events.

Artist ownership is derived from the JWT subject and `artist_profiles.user_id`.
An artist cannot assign a profile to another user or change another artist's
profile, albums, or tracks. Admin accounts may manage all catalog records.

## Social endpoints

- `GET /api/posts` and `GET /api/posts/:id`
- `POST /api/posts`, `PUT /api/posts/:id`, and `DELETE /api/posts/:id`
- `PUT /api/posts/:postId/like` and `DELETE /api/posts/:postId/like`
- `GET /api/posts/:postId/comments` and `POST /api/posts/:postId/comments`
- `PUT /api/comments/:id` and `DELETE /api/comments/:id`

Reads are public. Creating posts, likes, and comments requires authentication.
Users may update or delete only their own posts and comments; admins may moderate
all records. Likes are idempotent, so repeated like requests do not duplicate data.

## Alert endpoints

- `GET /api/alerts` supports `unread=true`, `type`, `limit`, and `offset`
- `GET /api/alerts/unread-count`
- `PUT /api/alerts/:id/read` and `PUT /api/alerts/read-all`
- `DELETE /api/alerts/:id`
- `GET /api/alert-preferences`
- `PUT /api/alert-preferences/:type` with `{ "inAppEnabled": false }`

Likes and comments create inbox alerts for the post owner. Alerts are suppressed
for self-actions, deduplicated, scoped to their recipient, and removed with their
target post. Supported preference types are `post_like`, `post_comment`,
`new_follower`, `artist_release`, `event_reminder`, and `system`.

## Follow endpoints

- `PUT` or `DELETE /api/users/:userId/follow`
- `GET /api/users/:userId/followers`, `/following`, and `/follow-stats`
- `PUT` or `DELETE /api/artists/:artistId/follow`
- `GET /api/artists/:artistId/followers` and `/follow-stats`
- `GET /api/follows` lists the authenticated user's followed users and artists

Follow writes are authenticated and idempotent. Users cannot follow themselves
or their own artist profile. New follows generate deduplicated alerts when the
recipient has enabled the `new_follower` alert category.

## Playlist endpoints

- `GET /api/playlists` lists public playlists; `GET /api/playlists/:id` includes ordered tracks
- `GET /api/playlists/mine` lists all playlists owned by the authenticated user
- `POST`, `PUT`, and `DELETE /api/playlists[/:id]` provide owner-scoped CRUD
- `POST /api/playlists/:id/tracks` adds `{ "trackId": 1 }` idempotently
- `DELETE /api/playlists/:id/tracks/:trackId` removes a track
- `PUT /api/playlists/:id/tracks/order` accepts the complete ordered `trackIds` array

Private playlists are hidden from anonymous users and non-owners. Admins may
manage any playlist. Track removal and reordering preserve contiguous positions.

## Search endpoint

`GET /api/search?q=moon&types=artists,tracks&limit=10` searches artists,
albums, tracks, events, and active public user profiles. `types` is optional and
results are grouped by type; the per-type limit is 1–25.

## Moderation and admin endpoints

- `POST /api/reports` lets authenticated users report posts, comments, users, or artists
- `GET` and `PUT /api/admin/reports[/:id]` operate the moderation queue
- `PUT /api/admin/artists/:id/verification` changes verified status
- `PUT /api/admin/users/:id/status` suspends or restores an account
- `DELETE /api/admin/content/:type/:id` removes a post or comment
- `GET /api/admin/audit-logs` returns newest-first administrative history

All `/api/admin` routes require the `admin` role. Mutations and audit records
share a transaction. Suspension revokes active refresh sessions immediately;
already-issued access tokens retain their normal short (15-minute) expiry.

# JAM'N Backend

Node.js, Express, and MySQL REST API.

## Local setup

1. Install dependencies with `npm install` inside `Backend`.
2. Copy `.env.example` to `.env` and enter your MySQL credentials.
3. Run the root `database.sql` file in MySQL to create the schema and seed data.
4. Start the API with `npm run dev`.

The basic health endpoint is `GET http://localhost:3000/api/health`.
Use `GET /api/health/database` to verify the configured MySQL connection.

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

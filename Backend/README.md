# JAM'N Backend

Node.js, Express, and MySQL REST API.

## Local setup

1. Install dependencies with `npm install` inside `Backend`.
2. Copy `.env.example` to `.env` and enter your MySQL credentials.
3. Run `database/schema.sql` in MySQL Workbench.
4. Start the API with `npm run dev`.

The basic health endpoint is `GET http://localhost:3000/api/health`.
Use `GET /api/health/database` to verify the configured MySQL connection.

## Authentication endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` with an `Authorization: Bearer <token>` header

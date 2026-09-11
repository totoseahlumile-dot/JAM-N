import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import env from "../src/config/env.js";

const withServer = async (run) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test("GET /api/health reports that the API is running", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "jam-n-api" });
  });
});

test("unknown routes return a structured 404 response", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.error.code, "ROUTE_NOT_FOUND");
  });
});

test("registration rejects invalid input before querying MySQL", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "x", email: "wrong", password: "123" })
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.ok(body.error.details.length >= 1);
  });
});

test("protected endpoints require a Bearer token", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
  });
});

test("catalog endpoints reject invalid artist identifiers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/artists/not-a-number`);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "INVALID_QUERY");
  });
});

test("catalog endpoints enforce the maximum page size", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/artists?limit=101`);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "INVALID_QUERY");
  });
});

test("catalog write endpoints require authentication", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/artists`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stageName: "Test Artist" })
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
  });
});

test("listener tokens cannot access artist write operations", { skip: !env.jwtSecret }, async () => {
  await withServer(async (baseUrl) => {
    const token = jwt.sign({ role: "listener" }, env.jwtSecret, { subject: "1", expiresIn: "1m" });
    const response = await fetch(`${baseUrl}/api/artists`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ stageName: "Forbidden Artist" })
    });
    assert.equal(response.status, 403);
    const body = await response.json();
    assert.equal(body.error.code, "FORBIDDEN");
  });
});

test("refresh requires a refresh-token cookie or body token", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, { method: "POST" });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, "REFRESH_TOKEN_REQUIRED");
  });
});

test("logout is idempotent when no refresh token is present", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
    assert.equal(response.status, 204);
  });
});

test("social write endpoints require authentication", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caption: "Not authenticated" })
    });
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
  });
});

test("social endpoints reject invalid identifiers before querying MySQL", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/posts/not-a-number`);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "INVALID_QUERY");
  });
});

test("OpenAPI documentation exposes the implemented API routes", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/docs/openapi.json`);
    assert.equal(response.status, 200);
    const document = await response.json();
    assert.equal(document.openapi, "3.1.0");
    assert.ok(document.paths["/api/auth/refresh"].post);
    assert.ok(document.paths["/api/artists/{id}"].put);
    assert.ok(document.paths["/api/posts/{postId}/comments"].post);
  });
});

test("Swagger UI is served from the documentation route", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/docs/`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(await response.text(), /swagger-ui/);
  });
});

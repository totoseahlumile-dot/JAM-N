import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

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

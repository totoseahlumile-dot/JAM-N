import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });

const testDatabase = "jam_n_test";
if (!testDatabase.endsWith("_test")) throw new Error("Integration tests require a *_test database");

let adminConnection;
let appPool;
let baseUrl;
let server;

const jsonRequest = async (path, { method = "GET", body, token, cookie } = {}) => {
  const headers = {};
  if (body) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  if (cookie) headers.cookie = cookie;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
    cookie: (response.headers.get("set-cookie") || "").split(";")[0]
  };
};

const expectStatus = async (expected, path, options) => {
  const response = await jsonRequest(path, options);
  assert.equal(response.status, expected, JSON.stringify(response.body));
  return response;
};

const register = async (suffix, role = "listener") => expectStatus(201, "/api/auth/register", {
  method: "POST",
  body: {
    username: `integration_${suffix}`,
    email: `integration_${suffix}@example.test`,
    password: "Integration!2026",
    displayName: `Integration ${suffix}`,
    role
  }
});

before(async () => {
  adminConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true
  });

  // The fixed suffix guard above makes these destructive statements safe: they
  // can never target the development database configured in .env.
  await adminConnection.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
  const schema = (await fs.readFile(new URL("../database/schema.sql", import.meta.url), "utf8"))
    .replaceAll("jam_n", testDatabase);
  const seed = (await fs.readFile(new URL("../database/seed.sql", import.meta.url), "utf8"))
    .replaceAll("jam_n", testDatabase);
  await adminConnection.query(schema);
  await adminConnection.query(seed);

  // env.js reads process.env when dynamically imported, so the application pool
  // is guaranteed to point at the isolated database for the entire test process.
  process.env.DB_NAME = testDatabase;
  process.env.JWT_SECRET ||= "integration-only-jwt-secret-at-least-32-characters";
  const [{ default: app }, database] = await Promise.all([
    import("../src/app.js"),
    import("../src/config/database.js")
  ]);
  appPool = database.pool;
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (appPool) await appPool.end();
  if (adminConnection) {
    await adminConnection.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
    await adminConnection.end();
  }
});

test("schema and seed are installed only in the test database", async () => {
  const [tables] = await appPool.query("SHOW TABLES");
  const [artists] = await appPool.query("SELECT COUNT(*) AS count FROM artist_profiles");
  assert.equal(tables.length, 18);
  assert.equal(artists[0].count, 10);
});

test("authentication rotates refresh tokens and rejects replay", async () => {
  const session = await register("session");
  assert.ok(session.body.accessToken);
  assert.match(session.cookie, /^jamn_refresh=/);

  const rotated = await expectStatus(200, "/api/auth/refresh", { method: "POST", cookie: session.cookie });
  assert.ok(rotated.body.accessToken);
  assert.notEqual(rotated.cookie, session.cookie);

  const replay = await expectStatus(401, "/api/auth/refresh", { method: "POST", cookie: session.cookie });
  assert.equal(replay.body.error.code, "REFRESH_TOKEN_REUSED");
  await expectStatus(401, "/api/auth/refresh", { method: "POST", cookie: rotated.cookie });
});

test("artists can manage only their own catalog", async () => {
  const first = await register("artist_one", "artist");
  const second = await register("artist_two", "artist");
  const firstToken = first.body.accessToken;
  const secondToken = second.body.accessToken;

  const profile = await expectStatus(201, "/api/artists", {
    method: "POST", token: firstToken, body: { stageName: "Integration Artist" }
  });
  await expectStatus(403, `/api/artists/${profile.body.id}`, {
    method: "PUT", token: secondToken, body: { location: "Forbidden" }
  });

  const album = await expectStatus(201, "/api/albums", {
    method: "POST", token: firstToken, body: { artistId: profile.body.id, title: "Integration Album" }
  });
  const track = await expectStatus(201, "/api/tracks", {
    method: "POST", token: firstToken,
    body: { artistId: profile.body.id, albumId: album.body.id, title: "Integration Track" }
  });
  await expectStatus(403, `/api/tracks/${track.body.id}`, { method: "DELETE", token: secondToken });
  await expectStatus(204, `/api/tracks/${track.body.id}`, { method: "DELETE", token: firstToken });
});

test("post ownership, comments, and idempotent likes work together", async () => {
  const author = await register("post_author");
  const reader = await register("post_reader");
  const post = await expectStatus(201, "/api/posts", {
    method: "POST", token: author.body.accessToken, body: { caption: "Integration post" }
  });

  await expectStatus(204, `/api/posts/${post.body.id}/like`, { method: "PUT", token: reader.body.accessToken });
  await expectStatus(204, `/api/posts/${post.body.id}/like`, { method: "PUT", token: reader.body.accessToken });
  const comment = await expectStatus(201, `/api/posts/${post.body.id}/comments`, {
    method: "POST", token: reader.body.accessToken, body: { body: "Integration comment" }
  });
  await expectStatus(403, `/api/comments/${comment.body.id}`, {
    method: "PUT", token: author.body.accessToken, body: { body: "Forbidden" }
  });

  const fetched = await expectStatus(200, `/api/posts/${post.body.id}`);
  assert.equal(Number(fetched.body.post.likeCount), 1);
  assert.equal(Number(fetched.body.post.commentCount), 1);

  const inbox = await expectStatus(200, "/api/alerts", { token: author.body.accessToken });
  assert.equal(inbox.body.alerts.length, 2);
  assert.deepEqual(new Set(inbox.body.alerts.map((alert) => alert.type)), new Set(["post_like", "post_comment"]));
  assert.ok(inbox.body.alerts.every((alert) => alert.message.includes("integration_post_reader")));
  const unread = await expectStatus(200, "/api/alerts/unread-count", { token: author.body.accessToken });
  assert.equal(unread.body.unreadCount, 2);
  await expectStatus(200, `/api/alerts/${inbox.body.alerts[0].id}/read`, {
    method: "PUT", token: author.body.accessToken
  });
  await expectStatus(200, "/api/alerts/read-all", { method: "PUT", token: author.body.accessToken });

  const preferences = await expectStatus(200, "/api/alert-preferences", { token: author.body.accessToken });
  assert.equal(preferences.body.preferences.length, 6);
  await expectStatus(200, "/api/alert-preferences/post_like", {
    method: "PUT", token: author.body.accessToken, body: { inAppEnabled: false }
  });
  const quietPost = await expectStatus(201, "/api/posts", {
    method: "POST", token: author.body.accessToken, body: { caption: "No like alert" }
  });
  await expectStatus(204, `/api/posts/${quietPost.body.id}/like`, { method: "PUT", token: reader.body.accessToken });
  const quietInbox = await expectStatus(200, "/api/alerts?unread=true", { token: author.body.accessToken });
  assert.equal(quietInbox.body.alerts.length, 0);
  await expectStatus(204, `/api/posts/${quietPost.body.id}`, { method: "DELETE", token: author.body.accessToken });

  await expectStatus(204, `/api/posts/${post.body.id}`, { method: "DELETE", token: author.body.accessToken });

  const [children] = await appPool.query(
    "SELECT (SELECT COUNT(*) FROM post_likes) AS likes, (SELECT COUNT(*) FROM comments) AS comments"
  );
  assert.equal(children[0].likes, 0);
  assert.equal(children[0].comments, 0);
});

test("user and artist follows are idempotent, counted, and alerted", async () => {
  const follower = await register("follower");
  const creator = await register("followed_artist", "artist");
  const followerId = follower.body.user.id;
  const creatorId = creator.body.user.id;

  await expectStatus(400, `/api/users/${followerId}/follow`, {
    method: "PUT", token: follower.body.accessToken
  });
  await expectStatus(204, `/api/users/${creatorId}/follow`, {
    method: "PUT", token: follower.body.accessToken
  });
  await expectStatus(204, `/api/users/${creatorId}/follow`, {
    method: "PUT", token: follower.body.accessToken
  });

  const profile = await expectStatus(201, "/api/artists", {
    method: "POST", token: creator.body.accessToken, body: { stageName: "Followed Integration Artist" }
  });
  await expectStatus(400, `/api/artists/${profile.body.id}/follow`, {
    method: "PUT", token: creator.body.accessToken
  });
  await expectStatus(204, `/api/artists/${profile.body.id}/follow`, {
    method: "PUT", token: follower.body.accessToken
  });
  await expectStatus(204, `/api/artists/${profile.body.id}/follow`, {
    method: "PUT", token: follower.body.accessToken
  });

  const userStats = await expectStatus(200, `/api/users/${creatorId}/follow-stats`);
  assert.deepEqual(userStats.body, { followerCount: 1, followingCount: 0 });
  const artistStats = await expectStatus(200, `/api/artists/${profile.body.id}/follow-stats`);
  assert.equal(artistStats.body.followerCount, 1);
  const mine = await expectStatus(200, "/api/follows", { token: follower.body.accessToken });
  assert.equal(mine.body.users.length, 1);
  assert.equal(mine.body.artists.length, 1);

  const alerts = await expectStatus(200, "/api/alerts?type=new_follower", { token: creator.body.accessToken });
  assert.equal(alerts.body.alerts.length, 2);
  assert.ok(alerts.body.alerts.every((alert) => alert.message.includes("integration_follower")));

  await expectStatus(204, `/api/users/${creatorId}/follow`, {
    method: "DELETE", token: follower.body.accessToken
  });
  await expectStatus(204, `/api/artists/${profile.body.id}/follow`, {
    method: "DELETE", token: follower.body.accessToken
  });
  const userStatsAfter = await expectStatus(200, `/api/users/${creatorId}/follow-stats`);
  assert.equal(userStatsAfter.body.followerCount, 0);
});

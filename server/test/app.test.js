import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

test("GET /health returns service health", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, "ok");
});

test("unknown routes return 404", async () => {
  const response = await request(app).get("/does-not-exist");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test("protected routes reject anonymous requests", async () => {
  const response = await request(app).get("/api/meetings");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("registration validates input before database work", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({ name: "A", email: "invalid", password: "123" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("media upload signature endpoint is protected", async () => {
  const response = await request(app)
    .post("/api/media/signature")
    .send({ purpose: "avatar" });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

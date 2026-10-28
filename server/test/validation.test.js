import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";

const app = createApp();

function token() {
  return jwt.sign(
    { sub: "507f1f77bcf86cd799439011", role: "MEMBER", sid: "507f1f77bcf86cd799439012" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "5m" }
  );
}

test("meeting routes reject invalid ObjectIds before database access", async () => {
  const response = await request(app)
    .get("/api/meetings/not-an-object-id")
    .set("Authorization", `Bearer ${token()}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, "Request validation failed");
});

test("task creation rejects unknown fields", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token()}`)
    .send({
      title: "Valid task",
      team: "507f1f77bcf86cd799439011",
      privilege: "ADMIN",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("meeting update rejects invalid status values", async () => {
  const response = await request(app)
    .patch("/api/meetings/507f1f77bcf86cd799439011")
    .set("Authorization", `Bearer ${token()}`)
    .send({ status: "HACKED" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

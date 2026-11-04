import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  newToken,
  tokenHash,
  validToken,
  validPassword,
} from "../lib/auth-tokens";
import { consumeAuthToken } from "../lib/consume-auth-token";

test("tokens and bcrypt password boundaries", () => {
  const token = newToken();
  assert.ok(validToken(token));
  assert.notEqual(token, newToken());
  assert.notEqual(token, tokenHash(token));
  assert.equal(validToken("malformed"), false);
  assert.equal(validPassword("short"), false);
  assert.equal(validPassword("a".repeat(72)), true);
  assert.equal(validPassword("a".repeat(73)), false);
  assert.equal(validPassword("界".repeat(25)), false);
});

test(
  "database: expiry, purpose, single use, concurrent consumption and session revocation",
  { skip: process.env.AUTH_DB_TEST !== "1" },
  async () => {
    const db = new PrismaClient();
    const user = await db.user.create({
      data: {
        email: `auth-test-${newToken()}@example.invalid`,
        name: "Temporary authentication test",
        passwordHash: "original-test-hash",
      },
    });
    async function token(
      purpose: string,
      expiresAt = new Date(Date.now() + 60000),
    ) {
      const raw = newToken();
      await db.authToken.create({
        data: {
          userId: user.id,
          tokenHash: tokenHash(raw),
          purpose,
          expiresAt,
        },
      });
      return raw;
    }
    try {
      const expired = await token("VERIFY", new Date(Date.now() - 1000));
      assert.equal(await consumeAuthToken(db, expired, "VERIFY"), false);
      const verification = await token("VERIFY");
      assert.equal(
        await consumeAuthToken(db, verification, "RESET", "new-test-hash"),
        false,
      );
      assert.equal(await consumeAuthToken(db, verification, "VERIFY"), true);
      assert.equal(await consumeAuthToken(db, verification, "VERIFY"), false);
      assert.ok(
        (await db.user.findUniqueOrThrow({ where: { id: user.id } }))
          .emailVerifiedAt,
      );
      const reset = await token("RESET");
      const results = await Promise.all([
        consumeAuthToken(db, reset, "RESET", "updated-test-hash"),
        consumeAuthToken(db, reset, "RESET", "updated-test-hash"),
      ]);
      assert.equal(results.filter(Boolean).length, 1);
      const updated = await db.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      assert.equal(updated.passwordHash, "updated-test-hash");
      assert.equal(updated.sessionVersion, 1);
      assert.equal(
        await db.authToken.count({
          where: { userId: user.id, purpose: "RESET" },
        }),
        0,
      );
    } finally {
      await db.user.delete({ where: { id: user.id } });
      await db.$disconnect();
    }
  },
);

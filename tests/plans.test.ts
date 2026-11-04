import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { activePlan, monthWindow, plans } from "../lib/plans";
import { checkWrite, ownerPlan, PlanLimitError } from "../lib/plan-access";

test("prices, expired subscriptions, and Philippine calendar boundaries", () => {
  assert.equal(plans.STARTER.annual / 12, 119);
  assert.equal(plans.BUSINESS.annual / 12, 319);
  assert.equal(
    activePlan({
      plan: "BUSINESS",
      status: "INACTIVE",
      currentPeriodEnd: null,
    }),
    "FREE",
  );
  assert.equal(
    activePlan({
      plan: "BUSINESS",
      status: "ACTIVE",
      currentPeriodEnd: new Date(0),
    }),
    "FREE",
  );
  assert.equal(
    activePlan({ plan: "STARTER", status: "ACTIVE", currentPeriodEnd: null }),
    "STARTER",
  );
  assert.equal(
    activePlan({ plan: "UNKNOWN", status: "ACTIVE", currentPeriodEnd: null }),
    "FREE",
  );
  const boundary = monthWindow(new Date("2026-12-31T16:00:00Z"));
  assert.equal(boundary.gte.toISOString(), "2026-12-31T16:00:00.000Z");
  assert.equal(boundary.lt.toISOString(), "2027-01-31T16:00:00.000Z");
});

test(
  "database quotas serialize concurrent requests and preserve history",
  { skip: process.env.PLAN_DB_TEST !== "1" },
  async () => {
    const db = new PrismaClient();
    const user = await db.user.create({
      data: {
        email: `plan-test-${randomUUID()}@example.invalid`,
        name: "Temporary plan test",
        passwordHash: "not-a-login",
      },
    });
    let businessId: string | undefined;
    try {
      const business = await db.business.create({
        data: {
          name: "Temporary plan test",
          members: { create: { userId: user.id, role: "OWNER" } },
          subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        },
      });
      businessId = business.id;
      const data = {
        businessId,
        type: "INCOME",
        category: "Test",
        amount: 100,
        method: "CASH",
      };
      await db.transaction.createMany({
        data: Array.from({ length: 99 }, () => data),
      });
      await db.transaction.create({
        data: {
          ...data,
          createdAt: new Date("2020-01-01"),
          date: new Date("2020-01-01"),
        },
      });
      const create = () =>
        db.$transaction(
          async (tx) => {
            await checkWrite(tx, business.id, "transaction");
            return tx.transaction.create({ data });
          },
          { timeout: 15000 },
        );
      const results = await Promise.allSettled([create(), create()]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      const failure = results.find((r) => r.status === "rejected");
      assert.ok(
        failure?.status === "rejected" &&
          failure.reason instanceof PlanLimitError,
      );
      assert.equal(await db.transaction.count({ where: { businessId } }), 101);
      await db.customer.createMany({
        data: Array.from({ length: 20 }, (_, i) => ({
          businessId: business.id,
          name: `Test ${i}`,
        })),
      });
      await assert.rejects(
        db.$transaction((tx) => checkWrite(tx, business.id, "customer")),
        PlanLimitError,
      );
      await assert.rejects(
        db.$transaction((tx) => checkWrite(tx, business.id, "inventory")),
        PlanLimitError,
      );
      await db.subscription.update({
        where: { businessId },
        data: { plan: "STARTER" },
      });
      await db.$transaction((tx) => checkWrite(tx, business.id, "transaction"));
      await db.$transaction((tx) => checkWrite(tx, business.id, "inventory"));
      await db.subscription.update({
        where: { businessId },
        data: { plan: "BUSINESS" },
      });
      const access = await ownerPlan(db, user.id);
      assert.equal(access.limits.businesses, 3);
      assert.equal(access.limits.staff, 5);
      await db.subscription.update({
        where: { businessId },
        data: { status: "INACTIVE" },
      });
      assert.equal((await ownerPlan(db, user.id)).plan, "FREE");
    } finally {
      if (businessId) await db.business.delete({ where: { id: businessId } });
      await db.user.delete({ where: { id: user.id } });
      await db.$disconnect();
    }
  },
);

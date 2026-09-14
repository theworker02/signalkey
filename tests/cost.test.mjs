import { test } from "node:test";
import assert from "node:assert/strict";
import { model } from "../manufacturing/cost-model.mjs";
test("cost model allocates yield once and reports unprofitable scenario", () => {
  const result = model({
    quantity: 100,
    perStarted: 10,
    yieldFraction: 0.5,
    packaging: 2,
    inbound: 100,
    price: 50,
    fixed: 1000,
  });
  assert.equal(result.landedUnit, 24);
  assert.equal(result.contribution, 26);
  assert.equal(result.breakEvenUnits, 39);
  assert.equal(
    model({
      quantity: 100,
      perStarted: 10,
      yieldFraction: 1,
      packaging: 0,
      inbound: 0,
      price: 5,
      fixed: 1000,
    }).breakEvenUnits,
    null,
  );
  assert.throws(() =>
    model({
      quantity: 100,
      perStarted: 10,
      yieldFraction: 0,
      packaging: 0,
      inbound: 0,
      price: 50,
      fixed: 1000,
    }),
  );
});

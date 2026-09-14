import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculatePower } from "../scripts/power-budget.mjs";
test("conservative power scenario includes resistor tolerance and reserves positive margins", async () => {
  const p = JSON.parse(
    await readFile("hardware/power-assumptions.json", "utf8"),
  );
  const r = calculatePower(p);
  assert.ok(Math.abs(r.ledDynamicMa - 180.705882) < 0.00001);
  assert.ok(r.limiterMinimumMa > r.ledAllowanceMa);
  assert.ok(r.worstLimitedInputMa < p.configuredRequestMa);
  const firmware = await readFile("firmware/usb_descriptors.c", "utf8");
  assert.match(firmware, /0,\s*500\)/);
  assert.throws(() => calculatePower({ ...p, limiterResistorKohm: 0 }));
});

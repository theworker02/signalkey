import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
export function calculatePower(p) {
  for (const key of [
    "ledCount",
    "ledFullWhiteMa",
    "brightnessCeiling",
    "ledQuiescentAllowanceMa",
    "logicInputAllowanceMa",
    "configuredRequestMa",
    "limiterResistorKohm",
    "limiterResistorTolerance",
  ])
    if (!Number.isFinite(p[key]) || p[key] < 0)
      throw new Error("Invalid " + key);
  if (
    p.brightnessCeiling > 255 ||
    p.limiterResistorKohm < 15 ||
    p.limiterResistorKohm > 232 ||
    p.limiterResistorTolerance >= 1
  )
    throw new Error("Outside calculation bounds");
  const ledDynamicMa =
    (p.ledCount * p.ledFullWhiteMa * p.brightnessCeiling) / 255;
  const ledAllowanceMa = ledDynamicMa + p.ledQuiescentAllowanceMa;
  // TI uses resistor values numerically in kilohms and yields milliamps.
  const limiterMinimumMa =
    25230 / (p.limiterResistorKohm * (1 + p.limiterResistorTolerance)) ** 1.016;
  const limiterMaximumMa =
    22980 / (p.limiterResistorKohm * (1 - p.limiterResistorTolerance)) ** 0.94;
  return {
    ledDynamicMa,
    ledAllowanceMa,
    estimatedNormalInputMa: ledAllowanceMa + p.logicInputAllowanceMa,
    limiterMinimumMa,
    limiterMaximumMa,
    worstLimitedInputMa: limiterMaximumMa + p.logicInputAllowanceMa,
    normalLoadMarginMa: limiterMinimumMa - ledAllowanceMa,
    configuredMarginMa:
      p.configuredRequestMa - limiterMaximumMa - p.logicInputAllowanceMa,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const assumptions = JSON.parse(
    await readFile("hardware/power-assumptions.json", "utf8"),
  );
  const result = { ...assumptions, calculated: calculatePower(assumptions) };
  await writeFile(
    "hardware/power-budget.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result.calculated, null, 2));
}

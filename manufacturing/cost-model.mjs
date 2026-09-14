// Illustrative sensitivity only. Not a quote, budget, price recommendation or forecast.
export function model({
  quantity,
  perStarted,
  yieldFraction,
  packaging,
  inbound,
  price,
  discount = 0,
  channel = 0,
  payment = 0,
  paymentFixed = 0,
  outbound = 0,
  warranty = 0,
  fixed,
}) {
  for (const v of [
    quantity,
    perStarted,
    yieldFraction,
    packaging,
    inbound,
    price,
    discount,
    channel,
    payment,
    paymentFixed,
    outbound,
    warranty,
    fixed,
  ])
    if (!Number.isFinite(v) || v < 0)
      throw new Error("All inputs must be finite nonnegative numbers");
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    yieldFraction <= 0 ||
    yieldFraction > 1 ||
    discount >= 1 ||
    channel >= 1 ||
    payment >= 1
  )
    throw new Error("Invalid quantity/yield/fee fraction");
  const good = quantity * yieldFraction;
  const recurringBatch = quantity * perStarted;
  const landed = recurringBatch / good + packaging + inbound / good;
  const net = price * (1 - discount);
  const contribution =
    net * (1 - channel - payment) - paymentFixed - landed - outbound - warranty;
  return {
    expectedGoodUnits: good,
    landedUnit: landed,
    contribution,
    breakEvenUnits: contribution > 0 ? Math.ceil(fixed / contribution) : null,
    upfrontPlusInventory: fixed + recurringBatch + good * packaging + inbound,
  };
}
if (process.argv[1]?.endsWith("cost-model.mjs")) {
  console.log("ILLUSTRATIVE ASSUMPTIONS ONLY — NOT QUOTED");
  console.log("quantity,price,landed_unit,contribution,break_even_units");
  for (const quantity of [10, 50, 100, 500, 1000])
    for (const price of [59, 79, 99]) {
      const r = model({
        quantity,
        perStarted: 28,
        yieldFraction: 0.95,
        packaging: 2,
        inbound: 150,
        price,
        payment: 0.03,
        paymentFixed: 0.3,
        outbound: 5,
        warranty: 2,
        fixed: 15000,
      });
      console.log(
        [
          quantity,
          price,
          r.landedUnit.toFixed(2),
          r.contribution.toFixed(2),
          r.breakEvenUnits ?? "not achievable",
        ].join(","),
      );
    }
}

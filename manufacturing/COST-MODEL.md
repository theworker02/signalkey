# Cost model

`cost-inputs.csv` is the supplier-input template. Unknown is not zero. No supplier quote, stock commitment, tooling quote or retail price is asserted. Prototype modules are separate from custom-PCB recurring costs.

Recurring batch spend = quantity started × (electronics + PCB assembly + enclosure + final assembly + test labor). Accepted units = quantity × measured/assumed accepted yield. Good-device cost = recurring spend / accepted units. Add packaging per good unit and batch inbound freight/duties / accepted units for landed cost. Include any separate rework spend in recurring batch spend; do not apply a second scrap multiplier.

Net selling price = price × (1 − discounts). Contribution = net price − landed cost − channel and payment fees − fixed per-transaction payment fee − outbound subsidy − expected warranty/returns allowance. Break-even = ceiling((engineering + equipment + compliance + tooling) / positive contribution). If contribution is zero/negative, there is no finite break-even. Inventory cash timing and taxes are separate cash-flow work.

Run `node manufacturing/cost-model.mjs` for a clearly labeled sensitivity table at 10/50/100/500/1000 starts and hypothetical $59/$79/$99 prices. Every numeric input in that example is an editable assumption, including $28 recurring cost, 95% yield, $150 inbound shipment and $15,000 fixed costs. These figures are deliberately not inserted into the unknown quote template. They demonstrate volume allocation and price sensitivity, not feasibility. Replace the illustrative lump-sum fixed amount with actual engineering/equipment/compliance/tooling quotes before decision-making.

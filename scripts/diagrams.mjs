import { readFile, writeFile, mkdir } from "node:fs/promises";
const power = JSON.parse(await readFile("hardware/power-budget.json", "utf8"));
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const text = (x, y, s, size = 16, color = "#31445c", weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(s)}</text>`;
const lines = (x, y, list, size = 15, color = "#51647c") =>
  list.map((s, i) => text(x, y + i * (size + 9), s, size, color)).join("");
const box = (x, y, w, h, title, body = [], fill = "#eef3fb") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="#c4d1e3"/>${text(x + 18, y + 30, title, 17, "#172b47", 600)}${lines(x + 18, y + 57, body, 14)}`;
const arrow = (x1, y1, x2, y2, label = "", dashed = false) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#567cb4" fill="none" stroke-width="2" ${dashed ? 'stroke-dasharray="7 5"' : ""} marker-end="url(#arrow)"/><path d="M${x2} ${y2} l${((x1 - x2) / Math.hypot(x2 - x1, y2 - y1)) * 9 + ((y2 - y1) / Math.hypot(x2 - x1, y2 - y1)) * 4} ${((y1 - y2) / Math.hypot(x2 - x1, y2 - y1)) * 9 - ((x2 - x1) / Math.hypot(x2 - x1, y2 - y1)) * 4} L${x2 + ((x1 - x2) / Math.hypot(x2 - x1, y2 - y1)) * 9 - ((y2 - y1) / Math.hypot(x2 - x1, y2 - y1)) * 4} ${y2 + ((y1 - y2) / Math.hypot(x2 - x1, y2 - y1)) * 9 + ((x2 - x1) / Math.hypot(x2 - x1, y2 - y1)) * 4}Z" fill="#567cb4"/>${label ? text(Math.min(x1, x2) + 16, y1 - 11, label, 14) : ""}`;
function svg(title, subtitle, content, height = 760) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-label="${esc(title)}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="#567cb4"/></marker></defs><rect width="1200" height="${height}" fill="#fbfcff"/><g font-family="Arial, sans-serif">${text(40, 48, "SIGNALKEY / MAGNEXIS", 12, "#6580a4", 600)}${text(40, 90, title, 29, "#132841", 600)}${text(40, 121, subtitle, 15)}${content}${text(40, height - 25, "2026-09-12 · Engineering revision E1 / mechanical M1 · Status labels are part of the drawing.", 12, "#637790")}</g></svg>`;
}
await mkdir("docs/diagrams", { recursive: true });
let body =
  box(85, 150, 260, 68, "Device / virtual transport", [
    "Button events and light state",
  ]) +
  box(480, 150, 280, 68, "Trusted companion", ["Bindings, runner, history"]) +
  box(875, 150, 260, 68, "Local process", ["User-approved executable"]);
for (const x of [215, 620, 1005])
  body += `<path d="M${x} 225V690" stroke="#c9d4e4" stroke-dasharray="5 6"/>`;
body += arrow(215, 260, 620, 260, "BUTTON_EVENT: press / double / hold");
body += arrow(
  620,
  330,
  1005,
  330,
  "spawn(executable, args, cwd), shell: false",
);
body += arrow(620, 385, 215, 385, "SET_LIGHT: running (reply omitted)");
body += arrow(
  1005,
  460,
  620,
  460,
  "Observed exit code / launch error / cancellation",
);
body += arrow(620, 525, 215, 525, "SET_LIGHT: observed result (reply omitted)");
body += arrow(620, 575, 215, 575, "GET_STATE");
body += arrow(215, 625, 620, 625, "ACK: firmware-reported state");
body += arrow(620, 680, 215, 680, "HEARTBEAT every 2 seconds", true);
body += text(
  40,
  730,
  "Missing host heartbeat → device status becomes unknown after 6 seconds. No action replay on reconnect.",
  15,
);
body += text(
  40,
  758,
  "Protocol ACK/readback confirms device logic, not measured LED light output. Full USB/physical timing remains untested.",
  14,
);
await writeFile(
  "docs/diagrams/workflow.svg",
  svg(
    "From a gesture to an observed result",
    "Representative run binding · simulator verified; physical HID path still requires a device.",
    body,
    820,
  ),
);
body = box(40, 175, 220, 105, "USB-C receptacle", [
  "USB 2.0 device proposal",
  "No battery or USB PD",
]);
body += box(320, 175, 240, 105, "Input protection", [
  "VBUS / inrush / ESD",
  "Exact circuit not released",
]);
body += arrow(260, 223, 320, 223);
body += box(650, 175, 230, 105, "3.3 V logic supply", [
  "RP2040 + flash + support",
  "75 mA input allowance",
]);
body += arrow(560, 223, 650, 223);
body += box(650, 345, 230, 120, "Switched LED supply", [
  "TPS2553 candidate",
  "RILIM = 100 kΩ ± 1%",
  "Default-off EN control",
]);
body += `<path d="M595 223V400H647" stroke="#567cb4" fill="none" stroke-width="2" marker-end="url(#arrow)"/>`;
body += box(930, 345, 230, 120, "12-pixel RGB ring", [
  "Exact LED lot unresolved",
  "Buffer + series resistor",
  "Common ground",
]);
body += arrow(880, 402, 930, 402);
body += arrow(760, 280, 760, 345, "", true);
body += text(793, 314, "GP4 → EN", 13);
body += box(40, 330, 480, 135, "Type-C standard contact mapping", [
  "A5 / CC1 → its own 5.1 kΩ Rd → GND",
  "B5 / CC2 → its own 5.1 kΩ Rd → GND",
  "A6 + B6 → D+; A7 + B7 → D−; ESD then MCU",
]);
body += text(
  40,
  500,
  "Proposal only: this is a power/data block diagram, not a schematic or fabrication netlist.",
  18,
  "#955f24",
  600,
);
body += lines(40, 540, [
  `Conservative normal-input scenario: ${power.calculated.estimatedNormalInputMa.toFixed(1)} mA. Configured request: ${power.configuredRequestMa} mA.`,
  `Limiter bound from TI equations plus resistor tolerance: ${power.calculated.limiterMinimumMa.toFixed(1)}–${power.calculated.limiterMaximumMa.toFixed(1)} mA.`,
  `Fault-limited input scenario including logic allowance: ${power.calculated.worstLimitedInputMa.toFixed(1)} mA; margin ${power.calculated.configuredMarginMa.toFixed(1)} mA.`,
]);
body += lines(
  40,
  640,
  [
    "Unconfigured: ≤100 mA. USB2 suspend: ≤2.5 mA including bus resistors. Neither is measured here.",
    "Pin labels above are USB standard contacts, not a selected connector footprint. Shielding/anchors still need review.",
    "Sources: USB Type-C 2.5 table 3-4 / table 4-28; USB2 suspend-current ECN; TI TPS2553 §9.5.1.",
  ],
  13,
);
await writeFile(
  "docs/diagrams/power-tree.svg",
  svg(
    "A power budget with explicit margins",
    "E1 electrical proposal · figures are calculated assumptions, not measurements or compliance evidence.",
    body,
    770,
  ),
);
body = "";
const stages = [
  [
    "01",
    "Software proof",
    "No hardware",
    "Observed pass/fail",
    "VERIFIED SOFTWARE",
  ],
  ["02", "Prototype", "1–3 units", "Reviewed safe wiring", "NOT BUILT"],
  ["03", "Engineering", "5–10 units", "PCB bring-up / DFM", "NOT BUILT"],
  [
    "04",
    "Design validation",
    "20–50 units",
    "Fit / pilots / testing",
    "NOT BUILT",
  ],
  [
    "05",
    "Process validation",
    "50–100 units",
    "Fixture / yield / work",
    "NOT BUILT",
  ],
  [
    "06",
    "Production",
    "Demand-dependent",
    "Approved release pack",
    "NOT APPROVED",
  ],
];
stages.forEach((s, i) => {
  const x = 40 + i * 190;
  body +=
    text(x + 4, 181, s[0], 16, "#567cb4", 600) +
    box(x, 200, 175, 145, s[1], [s[2], s[3]], i === 0 ? "#e7f4ed" : "#eef3fb") +
    text(x + 12, 324, s[4], 10, i === 0 ? "#287451" : "#7e5b30", 600);
  if (i < 5) body += arrow(x + 175, 267, x + 188, 267);
});
body += box(
  40,
  395,
  550,
  135,
  "Quote scenarios are separate from stage quantities",
  [
    "RFQ: 10 engineering, 50 validation, 100 / 500 / 1,000 production.",
    "These are comparisons for supplier estimates, not orders or forecasts.",
    "No supplier or lab has been contacted.",
  ],
);
body += box(
  620,
  395,
  540,
  135,
  "Release requires evidence, not a checklist alone",
  [
    "Reviewed CAD + BOM + binaries + fixture + compliance route.",
    "First-article approval and traceable test records before production.",
    "STL mesh checks do not establish electrical or mechanical reliability.",
  ],
);
await writeFile(
  "docs/diagrams/manufacturing-gates.svg",
  svg(
    "Build stages and decision gates",
    "Proposed sequence · quantities can change after review. No manufacturing stage is approved.",
    body,
    595,
  ),
);
const scad = await readFile("mechanical/enclosure.scad", "utf8");
const param = (name) =>
  Number(scad.match(new RegExp("\\b" + name + "=([0-9.]+)"))?.[1]);
const width = param("width"),
  height = param("cap_top");
body = `<rect x="80" y="210" width="330" height="330" rx="48" fill="#edf2fa" stroke="#536b8f" stroke-width="2"/><circle cx="245" cy="375" r="108" fill="#d7e6f8" stroke="#536b8f"/><circle cx="245" cy="375" r="129" fill="none" stroke="#8ba6c9"/>`;
for (const x of [125, 365])
  for (const y of [255, 495])
    body += `<circle cx="${x}" cy="${y}" r="7.2" fill="none" stroke="#536b8f"/>`;
body +=
  arrow(80, 180, 410, 180) +
  text(218, 168, `${width} mm`, 16) +
  text(90, 576, "Top: four lid holes on 40 × 40 mm centers", 14);
body += `<rect x="570" y="370" width="330" height="120" fill="#edf2fa" stroke="#536b8f"/><rect x="570" y="358" width="330" height="12" fill="#d4dfee" stroke="#536b8f"/><rect x="627" y="346" width="216" height="12" fill="#c2d9f0" stroke="#536b8f"/>`;
body += arrow(944, 346, 944, 490) + text(964, 425, `${height} mm`, 16);
body += text(570, 535, "Side: body 20 + lid 2 + cap projection 2 = 24 mm", 14);
body += lines(
  570,
  215,
  [
    "Cap body Ø36 mm; lid opening Ø36.7 mm.",
    "Nominal radial clearance: 0.35 mm.",
    "Carrier stop sets 0.6 mm modeled travel.",
    "Rear cutout: 12 × 6 mm, center Z = 8.8 mm.",
  ],
  15,
);
body += lines(
  40,
  625,
  [
    "Dimensions describe the M1 model only. Units: mm. Not a toleranced production drawing.",
    "Switch return mechanism, fastener engagement, actual PCB and USB connector fit remain unresolved.",
    "STLs are normalized for printing; assembly Z references are retained in enclosure.scad.",
  ],
  14,
);
await writeFile(
  "mechanical/exports/dimensions.svg",
  svg(
    "Enclosure envelope and fit-study dimensions",
    "M1 parametric model · 55 × 55 × 24 mm assembled envelope, excluding optional feet.",
    body,
    750,
  ),
);
console.log("Generated 4 original, labeled engineering SVG diagrams.");

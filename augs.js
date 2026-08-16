/** @param {NS} ns */
export async function main(ns) {
  const p = ns.getPlayer();
  const s = ns.singularity;

  let data = p.factions.map((x) => ({
    name: x,
    ...Object.fromEntries(
      Object.entries(
        s
          .getAugmentationsFromFaction(x)
          .filter((y) => y != 'NeuroFlux Governor')
          .map((y) => s.getAugmentationStats(y))
          .reduce((acc, mult) => {
            for (const stat in mult) {
              acc[stat] = (acc[stat] || 1) * mult[stat];
            }
            return acc;
          }, {}),
      ).map(([key, value]) => [key, ns.format.number(value, 2)]),
    ),
  }));

  let newData = [];

  for (const key of Object.keys(data[0]).filter((x) => x != 'name')) {
    newData.push({
      Stat: key,
      ...Object.fromEntries(data.map((x) => [x.name, x[key]])),
    });
  }

  printTable(ns, 'Total Multipliers', newData);
}

/** @param {NS} ns */
function printTable(ns, title, data) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => String(row[header])));
  const colWidths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length)),
  );

  const formatRow = (row) => row.map((val, i) => val.padEnd(colWidths[i])).join(' | ');

  ns.tprint(title);
  ns.tprint('-'.repeat(colWidths.reduce((sum, w) => sum + w, headers.length * 3 - 1)));
  ns.tprint(formatRow(headers));
  ns.tprint('-'.repeat(colWidths.reduce((sum, w) => sum + w, headers.length * 3 - 1)));
  rows.forEach((row) => ns.tprint(formatRow(row)));
  ns.tprint('\n\n');
}

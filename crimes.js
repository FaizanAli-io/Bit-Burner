export async function main(ns) {
  const crimeStats = Object.keys(ns.enums.CrimeType)
    .map((x) => ns.singularity.getCrimeStats(x))
    .map((x) => ({
      name: x.type,
      money: x.money,
      time: x.time / 1e3,
      chance: ns.formulas.work.crimeSuccessChance(ns.getPlayer(), x.type),
    }))
    .map((x) => ({ ...x, mps: (x.chance * x.money) / x.time }))
    .sort((a, b) => b.mps - a.mps);
  crimeStats.forEach((x) =>
    ns.tprint(
      `${x.name.padEnd(20)}| ${ns.format.number(x.money, 0).padStart(10)} | ${ns.format.percent(x.chance).padStart(10)} | ${ns.format.number(x.mps, 2).padStart(10)}`,
    ),
  );
  if (Boolean(ns.args[0])) ns.singularity.commitCrime(crimeStats[0].name, false);
}

export async function main(ns) {
  const factions = getFactionOrder(ns);
  const enriched = enrichFactionData(ns, factions);
  displayFactionData(ns, enriched);
  if (enriched.length) ns.singularity.workForFaction(enriched[0].name, enriched[0].workType, false);
  ns.writePort(ns.pid, false);
}
export function getFactionOrder(ns) {
  const s = ns.singularity;
  const fr = ns.formulas.reputation;
  const owned = new Set(s.getOwnedAugmentations(true));
  const repTillDonation = (f) =>
    fr.calculateFavorToRep(150) - fr.calculateFavorToRep(s.getFactionFavor(f));
  return ns
    .getPlayer()
    .factions.map((f) => {
      const workType = Object.values(ns.enums.FactionWorkType).find((w) =>
        s.getFactionWorkTypes(f).includes(w),
      );
      const neededRep = s
        .getAugmentationsFromFaction(f)
        .filter((a) => !owned.has(a))
        .map(s.getAugmentationRepReq);
      const target = Math.min(Math.max(...neededRep, 0), repTillDonation(f));
      return { name: f, workType, req: target - s.getFactionRep(f), favor: s.getFactionFavor(f) };
    })
    .filter((f) => f.workType && f.req > 0)
    .sort((a, b) => a.req - b.req);
}
function enrichFactionData(ns, factions) {
  return factions.map((f) => {
    const rate = ns.formulas.work.factionGains(ns.getPlayer(), f.workType, f.favor).reputation * 4;
    const timeSec = rate > 0 ? f.req / rate : Infinity;
    return { ...f, rate, timeSec };
  });
}
function displayFactionData(ns, factions) {
  ns.tprint(
    'Faction'.padEnd(30) +
      'Req Rep | '.padStart(12) +
      'Rep/s | '.padStart(12) +
      'Time |'.padStart(42),
  );
  ns.tprint('-'.repeat(96));
  factions.forEach((f) => {
    ns.tprint(
      `${f.name.padEnd(30)}${ns.format.number(f.req).padStart(9)} | ${f.rate.toFixed(3).padStart(9)} | ${ns.format.time(f.timeSec * 1e3).padStart(40)} |`,
    );
  });
}

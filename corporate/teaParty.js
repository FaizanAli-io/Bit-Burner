/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation;

  while (true) {
    for (const division of corp.getCorporation().divisions) {
      for (const city of corp.getDivision(division).cities) {
        corp.throwParty(division, city, 1e6);
        corp.buyTea(division, city);
      }
    }

    await corp.nextUpdate();
  }
}

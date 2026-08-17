import type { NS } from '@ns';
export async function main(ns: NS) {
  let done = true;
  const s = ns.singularity;
  if (!s.purchaseTor()) done = false;
  const programs = s.getDarkwebPrograms();
  for (const p of programs) {
    const cost = s.getDarkwebProgramCost(p);
    if (!cost) continue;
    done = false;
    if (ns.getServerMoneyAvailable('home') >= cost) {
      ns.tprint(`Purchasing ${p} for $${ns.format.number(cost)}`);
      s.purchaseProgram(p);
    }
  }
  ns.writePort(ns.pid, done);
}

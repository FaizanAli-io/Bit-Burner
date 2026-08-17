import type { NS } from '@ns';
export async function main(ns: NS) {
  const s = ns.singularity;
  const ramCost = s.getUpgradeHomeRamCost();
  if (ramCost <= ns.getServerMoneyAvailable('home')) {
    ns.tprint(`Upgrading RAM for $${ns.format.number(ramCost)}`);
    s.upgradeHomeRam();
  }
  const coresCost = s.getUpgradeHomeCoresCost();
  if (coresCost <= ns.getServerMoneyAvailable('home')) {
    ns.tprint(`Upgrading Cores for $${ns.format.number(coresCost)}`);
    s.upgradeHomeCores();
  }
  ns.writePort(ns.pid, false);
}

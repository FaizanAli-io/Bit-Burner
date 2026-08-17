import type { NS } from '@ns';
export async function main(ns: NS) {
  const baseRam = 16;
  const maxLimit = ns.cloud.getServerLimit();
  while (ns.cloud.getServerNames().length < maxLimit) {
    const cost = ns.cloud.getServerCost(baseRam);
    if (ns.getServerMoneyAvailable('home') < cost) break;
    const idx = ns.cloud.getServerNames().length + 1;
    const name = `myserver-${idx.toString().padStart(2, '0')}`;
    ns.cloud.purchaseServer(name, baseRam);
    await ns.sleep(50);
  }
  let done = false;
  while (true) {
    const owned = ns.cloud.getServerNames();
    if (owned.length === 0) break;
    const smallest = owned.reduce((min, cur) =>
      ns.getServerMaxRam(cur) < ns.getServerMaxRam(min) ? cur : min,
    );
    const curRam = ns.getServerMaxRam(smallest);
    const maxRam = ns.cloud.getRamLimit();
    if (curRam >= maxRam) {
      done = true;
      break;
    }
    const target = Math.min(curRam * 2, maxRam);
    const upgradeCost = ns.cloud.getServerUpgradeCost(smallest, target);
    const money = ns.getServerMoneyAvailable('home');
    if (money < upgradeCost) break;
    ns.cloud.upgradeServer(smallest, target);
    await ns.sleep(100);
  }
  ns.writePort(ns.pid, done);
}

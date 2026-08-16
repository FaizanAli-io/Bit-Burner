export async function main(ns) {
  ns.atExit(() => ns.ui.closeTail());
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(370, 0);
  ns.ui.resizeTail(420, 450);
  while (true) {
    const servers = ['home', ...ns.cloud.getServerNames()];
    const serverLimit = ns.cloud.getServerLimit();
    let pRam, pCost;
    const lastServer = servers.length === serverLimit + 1 ? servers[servers.length - 1] : null;
    if (lastServer) {
      pRam = ns.getServerMaxRam(lastServer);
      pCost = ns.cloud.getServerUpgradeCost(lastServer, pRam * 2);
    } else {
      pRam = 16;
      pCost = ns.cloud.getServerCost(pRam);
    }
    ns.print(`Currently purchasing ${ns.format.ram(pRam)} @ ${ns.format.number(pCost)}`);
    for (const server of servers) {
      const ram = ns.getServerMaxRam(server);
      const usedRam = ns.getServerUsedRam(server);
      const percentUsed = ram > 0 ? usedRam / ram : 0;
      const dotCount = Math.round(percentUsed * 20);
      const dotString = '.'.repeat(dotCount) + ' '.repeat(20 - dotCount);
      ns.print(
        `${server.padEnd(11)} [${dotString}] ${ns.format.percent(percentUsed)} of ${ns.format.ram(
          ram,
        )}`,
      );
    }
    await ns.sleep(1e3);
    ns.clearLog();
  }
}

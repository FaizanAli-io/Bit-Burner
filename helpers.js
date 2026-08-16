function getStatus(ns, target) {
  const maxMoney = ns.getServerMaxMoney(target);
  const currentMoney = ns.getServerMoneyAvailable(target);
  const minSecurity = ns.getServerMinSecurityLevel(target);
  const currentSecurity = ns.getServerSecurityLevel(target);
  return [maxMoney - currentMoney, currentSecurity - minSecurity];
}
export function getThreads(ns, target) {
  const status = getStatus(ns, target);
  const weakenEffect = ns.weakenAnalyze(1);
  const growFactor = 1 + status[0] / (ns.getServerMoneyAvailable(target) || 1);
  const weakenThreadBefore = Math.ceil(status[1] / weakenEffect);
  const growThread = Math.ceil(ns.growthAnalyze(target, growFactor));
  const weakenThreadAfter = Math.ceil(ns.growthAnalyzeSecurity(growThread) / weakenEffect);
  return {
    weakenThreadBefore,
    growThread,
    weakenThreadAfter,
    totalThreads: weakenThreadBefore + growThread + weakenThreadAfter,
  };
}
export function getItersNeeded(ns, nodes, cost, threads) {
  let threadsPerIter = nodes.reduce((total, node) => total + ns.getServerMaxRam(node), 0) / cost;
  return {
    iters: Math.ceil(threads / threadsPerIter),
    threadsPerIter: ns.format.number(threadsPerIter),
  };
}

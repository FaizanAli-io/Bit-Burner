const FILES = [
  'workers/infiltrate.js',
  'workers/buyRamAndCores.js',
  'workers/buyTorAndPrograms.js',
  'workers/buyAndUpgradeServers.js',
  'factions/city-factions.js',
  'factions/hack-factions.js',
  'factions/faction-work.js',
];
function freeRamHome(ns) {
  return ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
}
async function checkBatchStatus(ns, pid) {
  await ns.nextPortWrite(pid);
  return ns.readPort(pid);
}
export async function main(ns) {
  ns.clear('./lists/broken.txt');
  let pids = { karma: NaN, display: NaN, controller: NaN };
  const workers = FILES.map((x) => ({ file: x, done: false }));
  const arg = ns.args.join('');
  if (arg.includes('d')) pids.display = ns.run('display.js');
  if (arg.includes('k')) pids.karma = ns.run('misc/karma.js');
  if (arg.includes('c')) {
    const args = arg.includes('t') ? ['t'] : [];
    pids.controller = ns.run('controller.js', 1, ...args);
  }
  await runWorkers(ns, workers);
  ns.writePort(pids.controller, true);
  while (pids.controller && !isNaN(pids.controller)) {
    const result = await checkBatchStatus(ns, pids.controller);
    ns.tprint(`Signal received: ${result}.`);
    await runWorkers(ns, workers);
    ns.writePort(pids.controller, true);
  }
}
async function runWorkers(ns, workers) {
  for (const worker of workers) {
    if (worker.done) continue;
    const reqRam = ns.getScriptRam(worker.file, 'home') || 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    while (freeRamHome(ns) <= reqRam && attempts++ < MAX_ATTEMPTS) {
      await ns.sleep(1e3);
    }
    if (attempts >= MAX_ATTEMPTS) {
      ns.tprint(`Skipping ${worker.file}`);
      continue;
    }
    ns.tprint(`Starting ${worker.file}`);
    if (!ns.isRunning(worker.file)) {
      const pid = ns.run(worker.file);
      await ns.nextPortWrite(pid);
      const s = ns.readPort(pid);
      worker.done = Boolean(s);
    }
  }
}

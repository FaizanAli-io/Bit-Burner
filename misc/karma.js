export async function main(ns) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(800, 270);
  ns.ui.resizeTail(320, 120);
  let start_time = performance.now();
  let start_karma = ns.getPlayer().karma;
  await ns.sleep(1e3);
  while (true) {
    ns.clearLog();
    let player = ns.getPlayer();
    let karma = player.karma;
    let kills = player.numPeopleKilled;
    let duration = Math.min(3e5, performance.now() - start_time);
    let rate = (karma - start_karma) / duration;
    let eta = (-54e3 - karma) / rate;
    ns.print(
      `Kills: ${ns.format.number(kills)}
`,
      `Karma: ${ns.format.number(karma)}
`,
      `Rate: ${ns.format.number(rate * 1e3)} / s
`,
      `ETA: ${ns.format.time(eta)}

`,
    );
    await ns.sleep(1e3);
  }
}

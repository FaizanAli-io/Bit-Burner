import type { NS } from '@ns';
export async function main(ns: NS) {
  ns.atExit(() => ns.ui.closeTail());
  const duration = Number(ns.args[0]);
  const start = performance.now();
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(800, 380);
  ns.ui.resizeTail(320, 70);
  const size = 40;
  let elapsed, space;
  do {
    ns.clearLog();
    elapsed = performance.now() - start;
    space = Math.min(Math.round(size * (elapsed / duration)), size);
    try {
      ns.print(`[${'-'.repeat(space)}${' '.repeat(size - space)}]`);
      ns.print(`${ns.format.time(elapsed)} / ${ns.format.time(duration)}`);
    } catch (error) {
      ns.tprint(error, ' ', space);
      break;
    }
    await ns.sleep(512);
  } while (elapsed < duration);
  ns.ui.closeTail();
}

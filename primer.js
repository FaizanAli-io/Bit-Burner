import { getThreads, getItersNeeded } from '/helpers.js';
const SCRIPT_COST = 1.75;
export async function main(ns) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(800, 190);
  ns.ui.resizeTail(320, 180);
  ns.atExit(() => ns.ui.closeTail());
  const primer = new ServerPrimer(ns);
  await primer.primeServer(String(ns.args[0]));
}
export class ServerPrimer {
  ns;
  nodeList = [];
  scriptFiles;
  constructor(ns) {
    this.ns = ns;
    this.scriptFiles = ['batching/hacker.js', 'batching/grower.js', 'batching/weakener.js'];
    this.updateNodeList();
  }
  updateNodeList() {
    const file = './lists/broken.txt';
    let broken = this.ns
      .read(file)
      .split('\n')
      .filter((x) => x);
    this.nodeList = [...broken, ...this.ns.cloud.getServerNames(), 'home'];
    this.nodeList.forEach((node) => this.ns.scp(this.scriptFiles, node));
  }
  async primeServer(target) {
    let { totalThreads } = getThreads(this.ns, target);
    if (totalThreads <= 0) return;
    while (true) {
      let {
        weakenThreadBefore,
        weakenThreadAfter,
        growThread,
        totalThreads: totalThreads2,
      } = getThreads(this.ns, target);
      const GAP = 1e3;
      let growDone = false;
      let weakenDone = false;
      let { weakenTime, growWait } = this.getTimes(target);
      let { iters, threadsPerIter } = getItersNeeded(
        this.ns,
        this.nodeList,
        SCRIPT_COST,
        totalThreads2,
      );
      this.ns.print(
        `Priming Server: ${target}
`,
        `Iterations Needed: ${iters}
`,
        `Time: ${this.ns.format.time(weakenTime)}
`,
        `Threads: ${weakenThreadBefore} + ${growThread} + ${weakenThreadAfter} = ${totalThreads2}
`,
        `Threads Per Iteration: ${threadsPerIter}

`,
      );
      for (const node of this.nodeList) {
        let nodeRam = this.ns.getServerMaxRam(node) - this.ns.getServerUsedRam(node);
        let nodeThreads = Math.floor(nodeRam / SCRIPT_COST);
        if (weakenThreadBefore > 0 && nodeThreads > 0) {
          let taskThreads = Math.min(weakenThreadBefore, nodeThreads);
          this.ns.exec('batching/weakener.js', node, taskThreads, target);
          this.ns.print(`  -> ${taskThreads} / ${weakenThreadBefore} WTB @ ${node}`);
          weakenThreadBefore -= taskThreads;
          nodeThreads -= taskThreads;
        }
        if (growThread > 0 && nodeThreads > 0) {
          if (!weakenDone) {
            await this.ns.sleep(GAP);
            weakenDone = true;
          }
          let taskThreads = Math.min(growThread, nodeThreads);
          this.ns.exec('batching/grower.js', node, taskThreads, target, growWait);
          this.ns.print(`  -> ${taskThreads} / ${growThread} GT @ ${node}`);
          growThread -= taskThreads;
          nodeThreads -= taskThreads;
        }
        if (weakenThreadAfter > 0 && nodeThreads > 0) {
          if (!growDone) {
            await this.ns.sleep(GAP);
            growDone = true;
          }
          let taskThreads = Math.min(weakenThreadAfter, nodeThreads);
          this.ns.exec('batching/weakener.js', node, taskThreads, target);
          this.ns.print(`  -> ${taskThreads} / ${weakenThreadAfter} WTA @ ${node}`);
          weakenThreadAfter -= taskThreads;
          nodeThreads -= taskThreads;
        }
      }
      this.ns.run('misc/timer.js', 1, weakenTime);
      await this.ns.sleep(weakenTime + 99);
      this.updateNodeList();
      if (weakenThreadBefore <= 0 && weakenThreadAfter <= 0 && growThread <= 0) break;
    }
    this.ns.ui.closeTail();
  }
  getTimes(target) {
    const weakenTime = this.ns.getWeakenTime(target);
    const growTime = this.ns.getGrowTime(target);
    const growWait = weakenTime - growTime;
    return { weakenTime, growWait };
  }
}

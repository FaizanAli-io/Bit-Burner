import { calculateRamCost } from '/common.js';
export async function main(ns) {
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(800, 0);
  ns.ui.resizeTail(320, 180);
  ns.atExit(() => ns.ui.closeTail());
  const manager = new BatchManager(ns);
  await manager.runBatches();
}
class BatchManager {
  ns;
  scriptFiles;
  nodeList = [];
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
  async getOptimalTarget() {
    const pid = this.ns.exec('analyze.js', 'home', 1, false);
    if (!pid) {
      this.ns.tprint('Failed to run Analyzer script.');
      this.ns.writePort(this.ns.pid, false);
      return null;
    }
    await this.ns.nextPortWrite(pid);
    return this.ns.readPort(pid);
  }
  async runBatches() {
    let iter = 0;
    let start = performance.now();
    this.ns.tprint('Awaiting signal...');
    await this.ns.nextPortWrite(this.ns.pid);
    let optimal = await this.getOptimalTarget();
    let attempts = 0;
    while (!optimal) {
      await this.ns.sleep(1e4);
      optimal = await this.getOptimalTarget();
      this.ns.print(`[${++attempts}] No optimal target found, retrying in 10 seconds...`);
    }
    while (optimal) {
      const { hacks, target } = optimal;
      if (!this.isPrimed(target)) {
        const pid = this.ns.exec('primer.js', 'home', 1, target);
        while (this.ns.isRunning(pid)) await this.ns.sleep(100);
        optimal = await this.getOptimalTarget();
      } else {
        const { weakenTime, hackWait, growWait } = this.getTimingsAndWaits(target);
        const threads = this.calculateThreads(hacks, target);
        const ramCost = calculateRamCost(threads);
        const { hackThread, weakenThreadHack, growThread, weakenThreadGrow } = threads;
        this.ns.print(`
Iteration: ${++iter}`);
        this.ns.print(`Target Server: ${target}`);
        this.ns.print(`Running with ${hackThread} Hack Threads`);
        this.ns.print(`Batch Time: ${this.ns.format.time(weakenTime)}`);
        let batchCount = 0;
        let launchStart = performance.now();
        for (const host of this.nodeList) {
          let limit = Math.floor(this.getAvailableRam(host) / ramCost);
          for (let i = 0; i < limit; i++) {
            this.ns.exec('batching/hacker.js', host, hackThread, target, hackWait);
            this.ns.exec('batching/weakener.js', host, weakenThreadHack, target);
            this.ns.exec('batching/grower.js', host, growThread, target, growWait);
            this.ns.exec('batching/weakener.js', host, weakenThreadGrow, target);
            if (++batchCount >= 9e4) break;
            if (performance.now() > start + 200) {
              start = performance.now();
              await this.ns.sleep(0);
            }
          }
          if (batchCount >= 9e4) break;
          await 0;
          await 0;
        }
        let launchTime = performance.now() - launchStart;
        const [profit, income] = this.calculateProfitAndIncome(
          target,
          hackThread * batchCount,
          weakenTime + launchTime,
        );
        this.ns.print(`Launched ${batchCount} batches in ${this.ns.format.time(launchTime)}`);
        this.ns.print(`Expected Profit: ${this.ns.format.number(profit, 2)} / round`);
        this.ns.print(`Expected Income: ${this.ns.format.number(income, 2)} / sec`);
        this.ns.print(`Sleeping for ${this.ns.format.time(weakenTime)}
`);
        if (this.ns.args[0] === 't') this.ns.exec('misc/timer.js', 'home', 1, weakenTime);
        await this.ns.sleep(weakenTime);
        this.ns.writePort(this.ns.pid, true);
        this.ns.tprint('Awaiting signal...');
        await this.ns.nextPortWrite(this.ns.pid);
        this.updateNodeList();
        optimal = await this.getOptimalTarget();
      }
    }
  }
  calculateProfitAndIncome(target, threads, time) {
    const profit = this.ns.getServerMoneyAvailable(target) * this.ns.hackAnalyze(target) * threads;
    return [profit, profit / (time / 1e3)];
  }
  getTimingsAndWaits(target) {
    const weakenTime = this.ns.getWeakenTime(target);
    return {
      weakenTime,
      hackWait: weakenTime - this.ns.getHackTime(target),
      growWait: weakenTime - this.ns.getGrowTime(target),
    };
  }
  calculateThreads(hackThread, target) {
    const weakenEffect = this.ns.weakenAnalyze(1);
    const hackEffect = this.ns.hackAnalyze(target);
    const growThread = Math.ceil(this.ns.growthAnalyze(target, 1 / (1 - hackEffect * hackThread)));
    const weakenThreadHack = Math.ceil(this.ns.hackAnalyzeSecurity(hackThread) / weakenEffect);
    const weakenThreadGrow = Math.ceil(this.ns.growthAnalyzeSecurity(growThread) / weakenEffect);
    return { hackThread, growThread, weakenThreadHack, weakenThreadGrow };
  }
  isPrimed(target) {
    const maxMoney = this.ns.getServerMaxMoney(target);
    const currentMoney = this.ns.getServerMoneyAvailable(target);
    const minSecurity = this.ns.getServerMinSecurityLevel(target);
    const currentSecurity = this.ns.getServerSecurityLevel(target);
    return maxMoney === currentMoney && currentSecurity === minSecurity;
  }
  getAvailableRam = (node) =>
    this.ns.getServerMaxRam(node) * (node == 'home' ? 0.9 : 1) - this.ns.getServerUsedRam(node);
}

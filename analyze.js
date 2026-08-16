import { colors } from '/misc/colors.js';
import { getThreads, getItersNeeded } from '/helpers.js';
import { calculateRamCost, isPrimed, getPrimeString } from '/common.js';
const SCRIPT_COST = 1.75;
export async function main(ns) {
  const mode = ns.args[0];
  let analyzer = new HackAnalyzer(ns);
  analyzer.runHackThreadAnalysis(Boolean(mode ?? true));
}
export class HackAnalyzer {
  ns;
  player;
  timeLimit;
  hacked = [];
  nodeList = [];
  constructor(ns) {
    this.ns = ns;
    this.timeLimit = 10 * 60 * 1e3;
  }
  getNodeList() {
    const file = './lists/broken.txt';
    let broken = this.ns
      .read(file)
      .split('\n')
      .filter((x) => x);
    return [...broken, ...this.ns.cloud.getServerNames(), 'home'];
  }
  update() {
    let skill = this.ns.getHackingLevel();
    let broken = this.ns
      .read('./lists/broken.txt')
      .split('\n')
      .filter((x) => x);
    this.player = this.ns.getPlayer();
    this.nodeList = this.getNodeList();
    this.hacked = broken
      .map((x) => this.ns.getServer(x))
      .map((x) => this.getPrimed(x))
      .filter((x) => x.moneyMax != 0)
      .filter((x) => x.requiredHackingSkill <= skill);
  }
  runHackThreadAnalysis(mode) {
    this.update();
    let allMetrics = [];
    const h = this.ns.formulas.hacking;
    for (const server of this.hacked) {
      const times = this.getTimingsAndWaits(server);
      const chance = h.hackChance(server, this.player);
      const effect = h.hackPercent(server, this.player);
      let bestMetric = {
        hacks: NaN,
        profit: NaN,
        income: NaN,
        batchCount: NaN,
        chance: chance * 100,
        target: server.hostname,
        primeTime: server.primeTime,
        primeIter: server.primeIter,
        weakenTime: times.weakenTime,
        primeTotal: server.primeTotal,
        limit: Math.floor(1 / effect),
        skill: server.requiredHackingSkill,
      };
      for (let hacks = 1; hacks <= Math.min(bestMetric.limit, 100); hacks++) {
        server.moneyAvailable = server.moneyMax;
        let threads = this.calculateThreads(server, hacks, hacks * effect);
        let ramCost = calculateRamCost(threads);
        let batchCount = Math.min(this.calculateBatchCount(ramCost), 9e4);
        let [profit, income] = this.calculateProfitAndIncome(
          server,
          effect * hacks * batchCount * chance,
          times.weakenTime,
        );
        if (!bestMetric.income || income > bestMetric.income)
          bestMetric = { ...bestMetric, hacks, profit, income, batchCount };
      }
      allMetrics.push(bestMetric);
    }
    if (mode) {
      this.ns.clearLog();
      this.ns.ui.openTail();
      this.ns.ui.moveTail(250, 0);
      this.ns.ui.resizeTail(900, 600);
      this.displayPrimeTimeAnalysis(allMetrics);
      this.displayHackThreadAnalysis(allMetrics);
    }
    allMetrics = allMetrics
      .filter((x) => x.primeTotal < this.timeLimit)
      .sort((a, b) => b.income - a.income);
    const best = allMetrics[0];
    this.ns.writePort(this.ns.pid, best);
    return best;
  }
  displayPrimeTimeAnalysis(allMetrics) {
    let output = 'Prime Time Analysis\n';
    output +=
      '|       Server       | Iterations |        Prime Time        |        Total Time              |\n';
    output +=
      '|--------------------|------------|--------------------------|--------------------------------|\n';
    allMetrics
      .sort((a, b) => b.primeTotal - a.primeTotal)
      .forEach(({ target, primeTime, primeIter, primeTotal }) => {
        const color = this.getColorByPrimeStatus(primeTotal);
        output +=
          color +
          `| ${target.padEnd(18)} | ${primeIter.toString().padStart(10)} | ${getPrimeString(this.ns, primeTime).padStart(24)} | ${this.ns.format.time(primeTotal).padStart(30)} |
` +
          colors.reset;
      });
    this.ns.print(output + '\n\n');
  }
  displayHackThreadAnalysis(allMetrics) {
    let output = 'Hack Thread Analysis\n';
    output +=
      '|       Server       |  Hack / Limit  | Skill  | Chance  |        Weaken Time       | Revenue  |  Income  | Batches  |\n';
    output +=
      '|--------------------|----------------|--------|---------|--------------------------|----------|----------|----------|\n';
    allMetrics
      .sort((a, b) => b.income - a.income)
      .forEach(
        ({
          target,
          hacks,
          limit,
          skill,
          chance,
          weakenTime,
          profit,
          income,
          batchCount,
          primeTotal,
        }) => {
          const color = this.getColorByPrimeStatus(primeTotal);
          output +=
            color +
            `| ${target.padEnd(18)} | ${`${hacks} / ${limit}`.padStart(14)} | ${skill.toString().padStart(6)} | ${chance.toPrecision(4).padStart(6)}% | ${this.ns.format.time(weakenTime).padStart(24)} | ${this.ns.format.number(profit, 2).padStart(8)} | ${this.ns.format.number(income, 2).padStart(8)} | ${batchCount.toString().padStart(8)} |
` +
            colors.reset;
        },
      );
    this.ns.print(output + '\n\n');
  }
  getColorByPrimeStatus(totalTime) {
    const { green, yellow, red } = colors;
    return totalTime === 0 ? green : totalTime < this.timeLimit ? yellow : red;
  }
  calculateBatchCount(ramCost) {
    let batchCount = 0;
    for (const host of this.nodeList) {
      batchCount += Math.floor(this.ns.getServerMaxRam(host) / ramCost);
    }
    return batchCount;
  }
  calculateProfitAndIncome(server, effect, time) {
    let profit = server.moneyMax * effect;
    return [profit, profit / (time / 1e3)];
  }
  calculateThreads(server, hackThread, hackEffect) {
    const h = this.ns.formulas.hacking;
    server.moneyAvailable *= 1 - hackEffect;
    const weakenEffect = this.ns.weakenAnalyze(1);
    const growThread = h.growThreads(server, this.player, server.moneyMax);
    const weakenThreadHack = Math.ceil(this.ns.hackAnalyzeSecurity(hackThread) / weakenEffect);
    const weakenThreadGrow = Math.ceil(this.ns.growthAnalyzeSecurity(growThread) / weakenEffect);
    return { hackThread, growThread, weakenThreadHack, weakenThreadGrow };
  }
  getTimingsAndWaits(server) {
    const h = this.ns.formulas.hacking;
    const weakenTime = h.weakenTime(server, this.player);
    return {
      weakenTime,
      hackWait: weakenTime - h.weakenTime(server, this.player),
      growWait: weakenTime - h.weakenTime(server, this.player),
    };
  }
  getPrimed(server) {
    if (!isPrimed(server)) {
      server.primeTime = this.getTimingsAndWaits(server).weakenTime;
      let threads = getThreads(this.ns, server.hostname).totalThreads;
      server.primeIter = getItersNeeded(this.ns, this.nodeList, SCRIPT_COST, threads).iters;
      server.hackDifficulty = server.minDifficulty;
    } else {
      server.primeTime = 0;
      server.primeIter = 0;
    }
    server.primeTotal = server.primeTime * server.primeIter;
    return server;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuYWx5emUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5pbXBvcnQgeyBjb2xvcnMgfSBmcm9tICcuL21pc2MvY29sb3JzJztcbmltcG9ydCB7IGdldFRocmVhZHMsIGdldEl0ZXJzTmVlZGVkIH0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7IGNhbGN1bGF0ZVJhbUNvc3QsIGlzUHJpbWVkLCBnZXRQcmltZVN0cmluZyB9IGZyb20gJy4vY29tbW9uJztcblxuY29uc3QgU0NSSVBUX0NPU1QgPSAxLjc1O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihuczogTlMpIHtcbiAgY29uc3QgbW9kZSA9IG5zLmFyZ3NbMF07XG4gIGxldCBhbmFseXplciA9IG5ldyBIYWNrQW5hbHl6ZXIobnMpO1xuICBhbmFseXplci5ydW5IYWNrVGhyZWFkQW5hbHlzaXMoQm9vbGVhbihtb2RlID8/IHRydWUpKTtcbn1cblxuZXhwb3J0IGNsYXNzIEhhY2tBbmFseXplciB7XG4gIG5zOiBOUztcbiAgcGxheWVyOiBhbnk7XG4gIHRpbWVMaW1pdDogbnVtYmVyO1xuICBoYWNrZWQ6IGFueVtdID0gW107XG4gIG5vZGVMaXN0OiBzdHJpbmdbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKG5zOiBOUykge1xuICAgIHRoaXMubnMgPSBucztcbiAgICB0aGlzLnRpbWVMaW1pdCA9IDEwICogNjAgKiAxMDAwO1xuICB9XG5cbiAgZ2V0Tm9kZUxpc3QoKSB7XG4gICAgY29uc3QgZmlsZSA9ICcuL2xpc3RzL2Jyb2tlbi50eHQnO1xuICAgIGxldCBicm9rZW4gPSB0aGlzLm5zXG4gICAgICAucmVhZChmaWxlKVxuICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgLmZpbHRlcigoeCkgPT4geCk7XG5cbiAgICByZXR1cm4gWy4uLmJyb2tlbiwgLi4udGhpcy5ucy5nZXRQdXJjaGFzZWRTZXJ2ZXJzKCksICdob21lJ107XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgbGV0IHNraWxsID0gdGhpcy5ucy5nZXRIYWNraW5nTGV2ZWwoKTtcblxuICAgIGxldCBicm9rZW4gPSB0aGlzLm5zXG4gICAgICAucmVhZCgnLi9saXN0cy9icm9rZW4udHh0JylcbiAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgIC5maWx0ZXIoKHgpID0+IHgpO1xuXG4gICAgdGhpcy5wbGF5ZXIgPSB0aGlzLm5zLmdldFBsYXllcigpO1xuICAgIHRoaXMubm9kZUxpc3QgPSB0aGlzLmdldE5vZGVMaXN0KCk7XG5cbiAgICB0aGlzLmhhY2tlZCA9IGJyb2tlblxuICAgICAgLm1hcCgoeCkgPT4gdGhpcy5ucy5nZXRTZXJ2ZXIoeCkpXG4gICAgICAubWFwKCh4KSA9PiB0aGlzLmdldFByaW1lZCh4KSlcbiAgICAgIC5maWx0ZXIoKHgpID0+IHgubW9uZXlNYXggIT0gMClcbiAgICAgIC5maWx0ZXIoKHgpID0+IHgucmVxdWlyZWRIYWNraW5nU2tpbGwgPD0gc2tpbGwpO1xuICB9XG5cbiAgcnVuSGFja1RocmVhZEFuYWx5c2lzKG1vZGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIGxldCBhbGxNZXRyaWNzID0gW107XG4gICAgY29uc3QgaCA9IHRoaXMubnMuZm9ybXVsYXMuaGFja2luZztcblxuICAgIGZvciAoY29uc3Qgc2VydmVyIG9mIHRoaXMuaGFja2VkKSB7XG4gICAgICBjb25zdCB0aW1lcyA9IHRoaXMuZ2V0VGltaW5nc0FuZFdhaXRzKHNlcnZlcik7XG4gICAgICBjb25zdCBjaGFuY2UgPSBoLmhhY2tDaGFuY2Uoc2VydmVyLCB0aGlzLnBsYXllcik7XG4gICAgICBjb25zdCBlZmZlY3QgPSBoLmhhY2tQZXJjZW50KHNlcnZlciwgdGhpcy5wbGF5ZXIpO1xuXG4gICAgICBsZXQgYmVzdE1ldHJpYyA9IHtcbiAgICAgICAgaGFja3M6IE5hTixcbiAgICAgICAgcHJvZml0OiBOYU4sXG4gICAgICAgIGluY29tZTogTmFOLFxuICAgICAgICBiYXRjaENvdW50OiBOYU4sXG4gICAgICAgIGNoYW5jZTogY2hhbmNlICogMTAwLFxuICAgICAgICB0YXJnZXQ6IHNlcnZlci5ob3N0bmFtZSxcbiAgICAgICAgcHJpbWVUaW1lOiBzZXJ2ZXIucHJpbWVUaW1lLFxuICAgICAgICBwcmltZUl0ZXI6IHNlcnZlci5wcmltZUl0ZXIsXG4gICAgICAgIHdlYWtlblRpbWU6IHRpbWVzLndlYWtlblRpbWUsXG4gICAgICAgIHByaW1lVG90YWw6IHNlcnZlci5wcmltZVRvdGFsLFxuICAgICAgICBsaW1pdDogTWF0aC5mbG9vcigxIC8gZWZmZWN0KSxcbiAgICAgICAgc2tpbGw6IHNlcnZlci5yZXF1aXJlZEhhY2tpbmdTa2lsbCxcbiAgICAgIH07XG5cbiAgICAgIGZvciAobGV0IGhhY2tzID0gMTsgaGFja3MgPD0gTWF0aC5taW4oYmVzdE1ldHJpYy5saW1pdCwgMTAwKTsgaGFja3MrKykge1xuICAgICAgICBzZXJ2ZXIubW9uZXlBdmFpbGFibGUgPSBzZXJ2ZXIubW9uZXlNYXg7XG5cbiAgICAgICAgbGV0IHRocmVhZHMgPSB0aGlzLmNhbGN1bGF0ZVRocmVhZHMoc2VydmVyLCBoYWNrcywgaGFja3MgKiBlZmZlY3QpO1xuICAgICAgICBsZXQgcmFtQ29zdCA9IGNhbGN1bGF0ZVJhbUNvc3QodGhyZWFkcyk7XG5cbiAgICAgICAgbGV0IGJhdGNoQ291bnQgPSBNYXRoLm1pbih0aGlzLmNhbGN1bGF0ZUJhdGNoQ291bnQocmFtQ29zdCksIDkwMDAwKTtcblxuICAgICAgICBsZXQgW3Byb2ZpdCwgaW5jb21lXSA9IHRoaXMuY2FsY3VsYXRlUHJvZml0QW5kSW5jb21lKFxuICAgICAgICAgIHNlcnZlcixcbiAgICAgICAgICBlZmZlY3QgKiBoYWNrcyAqIGJhdGNoQ291bnQgKiBjaGFuY2UsXG4gICAgICAgICAgdGltZXMud2Vha2VuVGltZSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWJlc3RNZXRyaWMuaW5jb21lIHx8IGluY29tZSA+IGJlc3RNZXRyaWMuaW5jb21lKVxuICAgICAgICAgIGJlc3RNZXRyaWMgPSB7IC4uLmJlc3RNZXRyaWMsIGhhY2tzLCBwcm9maXQsIGluY29tZSwgYmF0Y2hDb3VudCB9O1xuICAgICAgfVxuICAgICAgYWxsTWV0cmljcy5wdXNoKGJlc3RNZXRyaWMpO1xuICAgIH1cblxuICAgIGlmIChtb2RlKSB7XG4gICAgICB0aGlzLm5zLmNsZWFyTG9nKCk7XG4gICAgICB0aGlzLm5zLnVpLm9wZW5UYWlsKCk7XG4gICAgICB0aGlzLm5zLnVpLm1vdmVUYWlsKDI1MCwgMCk7XG4gICAgICB0aGlzLm5zLnVpLnJlc2l6ZVRhaWwoOTAwLCA2MDApO1xuICAgICAgdGhpcy5kaXNwbGF5UHJpbWVUaW1lQW5hbHlzaXMoYWxsTWV0cmljcyk7XG4gICAgICB0aGlzLmRpc3BsYXlIYWNrVGhyZWFkQW5hbHlzaXMoYWxsTWV0cmljcyk7XG4gICAgfVxuXG4gICAgYWxsTWV0cmljcyA9IGFsbE1ldHJpY3NcbiAgICAgIC5maWx0ZXIoKHgpID0+IHgucHJpbWVUb3RhbCA8IHRoaXMudGltZUxpbWl0KVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuaW5jb21lIC0gYS5pbmNvbWUpO1xuXG4gICAgY29uc3QgYmVzdCA9IGFsbE1ldHJpY3NbMF07XG4gICAgdGhpcy5ucy53cml0ZVBvcnQodGhpcy5ucy5waWQsIGJlc3QpO1xuXG4gICAgcmV0dXJuIGJlc3Q7XG4gIH1cblxuICBkaXNwbGF5UHJpbWVUaW1lQW5hbHlzaXMoYWxsTWV0cmljczogYW55W10pIHtcbiAgICBsZXQgb3V0cHV0ID0gJ1ByaW1lIFRpbWUgQW5hbHlzaXNcXG4nO1xuICAgIG91dHB1dCArPVxuICAgICAgJ3wgICAgICAgU2VydmVyICAgICAgIHwgSXRlcmF0aW9ucyB8ICAgICAgICBQcmltZSBUaW1lICAgICAgICB8ICAgICAgICBUb3RhbCBUaW1lICAgICAgICAgICAgICB8XFxuJztcbiAgICBvdXRwdXQgKz1cbiAgICAgICd8LS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxcbic7XG5cbiAgICBhbGxNZXRyaWNzXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5wcmltZVRvdGFsIC0gYS5wcmltZVRvdGFsKVxuICAgICAgLmZvckVhY2goKHsgdGFyZ2V0LCBwcmltZVRpbWUsIHByaW1lSXRlciwgcHJpbWVUb3RhbCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gdGhpcy5nZXRDb2xvckJ5UHJpbWVTdGF0dXMocHJpbWVUb3RhbCk7XG4gICAgICAgIG91dHB1dCArPVxuICAgICAgICAgIGNvbG9yICtcbiAgICAgICAgICBgfCAke3RhcmdldC5wYWRFbmQoMTgpfSB8IGAgK1xuICAgICAgICAgIGAke3ByaW1lSXRlci50b1N0cmluZygpLnBhZFN0YXJ0KDEwKX0gfCBgICtcbiAgICAgICAgICBgJHtnZXRQcmltZVN0cmluZyh0aGlzLm5zLCBwcmltZVRpbWUpLnBhZFN0YXJ0KDI0KX0gfCBgICtcbiAgICAgICAgICBgJHt0aGlzLm5zLnRGb3JtYXQocHJpbWVUb3RhbCkucGFkU3RhcnQoMzApfSB8XFxuYCArXG4gICAgICAgICAgY29sb3JzLnJlc2V0O1xuICAgICAgfSk7XG5cbiAgICB0aGlzLm5zLnByaW50KG91dHB1dCArICdcXG5cXG4nKTtcbiAgfVxuXG4gIGRpc3BsYXlIYWNrVGhyZWFkQW5hbHlzaXMoYWxsTWV0cmljczogYW55W10pIHtcbiAgICBsZXQgb3V0cHV0ID0gJ0hhY2sgVGhyZWFkIEFuYWx5c2lzXFxuJztcbiAgICBvdXRwdXQgKz1cbiAgICAgICd8ICAgICAgIFNlcnZlciAgICAgICB8ICBIYWNrIC8gTGltaXQgIHwgU2tpbGwgIHwgQ2hhbmNlICB8ICAgICAgICBXZWFrZW4gVGltZSAgICAgICB8IFJldmVudWUgIHwgIEluY29tZSAgfCBCYXRjaGVzICB8XFxuJztcbiAgICBvdXRwdXQgKz1cbiAgICAgICd8LS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLXwtLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLXwtLS0tLS0tLS0tfC0tLS0tLS0tLS18XFxuJztcblxuICAgIGFsbE1ldHJpY3NcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmluY29tZSAtIGEuaW5jb21lKVxuICAgICAgLmZvckVhY2goXG4gICAgICAgICh7XG4gICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgIGhhY2tzLFxuICAgICAgICAgIGxpbWl0LFxuICAgICAgICAgIHNraWxsLFxuICAgICAgICAgIGNoYW5jZSxcbiAgICAgICAgICB3ZWFrZW5UaW1lLFxuICAgICAgICAgIHByb2ZpdCxcbiAgICAgICAgICBpbmNvbWUsXG4gICAgICAgICAgYmF0Y2hDb3VudCxcbiAgICAgICAgICBwcmltZVRvdGFsLFxuICAgICAgICB9KSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sb3IgPSB0aGlzLmdldENvbG9yQnlQcmltZVN0YXR1cyhwcmltZVRvdGFsKTtcbiAgICAgICAgICBvdXRwdXQgKz1cbiAgICAgICAgICAgIGNvbG9yICtcbiAgICAgICAgICAgIGB8ICR7dGFyZ2V0LnBhZEVuZCgxOCl9IHwgYCArXG4gICAgICAgICAgICBgJHtgJHtoYWNrc30gLyAke2xpbWl0fWAucGFkU3RhcnQoMTQpfSB8IGAgK1xuICAgICAgICAgICAgYCR7c2tpbGwudG9TdHJpbmcoKS5wYWRTdGFydCg2KX0gfCBgICtcbiAgICAgICAgICAgIGAke2NoYW5jZS50b1ByZWNpc2lvbig0KS5wYWRTdGFydCg2KX0lIHwgYCArXG4gICAgICAgICAgICBgJHt0aGlzLm5zLnRGb3JtYXQod2Vha2VuVGltZSkucGFkU3RhcnQoMjQpfSB8IGAgK1xuICAgICAgICAgICAgYCR7dGhpcy5ucy5mb3JtYXROdW1iZXIocHJvZml0LCAyKS5wYWRTdGFydCg4KX0gfCBgICtcbiAgICAgICAgICAgIGAke3RoaXMubnMuZm9ybWF0TnVtYmVyKGluY29tZSwgMikucGFkU3RhcnQoOCl9IHwgYCArXG4gICAgICAgICAgICBgJHtiYXRjaENvdW50LnRvU3RyaW5nKCkucGFkU3RhcnQoOCl9IHxcXG5gICtcbiAgICAgICAgICAgIGNvbG9ycy5yZXNldDtcbiAgICAgICAgfSxcbiAgICAgICk7XG5cbiAgICB0aGlzLm5zLnByaW50KG91dHB1dCArICdcXG5cXG4nKTtcbiAgfVxuXG4gIGdldENvbG9yQnlQcmltZVN0YXR1cyh0b3RhbFRpbWU6IG51bWJlcikge1xuICAgIGNvbnN0IHsgZ3JlZW4sIHllbGxvdywgcmVkIH0gPSBjb2xvcnM7XG4gICAgcmV0dXJuIHRvdGFsVGltZSA9PT0gMCA/IGdyZWVuIDogdG90YWxUaW1lIDwgdGhpcy50aW1lTGltaXQgPyB5ZWxsb3cgOiByZWQ7XG4gIH1cblxuICBjYWxjdWxhdGVCYXRjaENvdW50KHJhbUNvc3Q6IG51bWJlcikge1xuICAgIGxldCBiYXRjaENvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGhvc3Qgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgYmF0Y2hDb3VudCArPSBNYXRoLmZsb29yKHRoaXMubnMuZ2V0U2VydmVyTWF4UmFtKGhvc3QpIC8gcmFtQ29zdCk7XG4gICAgfVxuICAgIHJldHVybiBiYXRjaENvdW50O1xuICB9XG5cbiAgY2FsY3VsYXRlUHJvZml0QW5kSW5jb21lKHNlcnZlcjogYW55LCBlZmZlY3Q6IG51bWJlciwgdGltZTogbnVtYmVyKSB7XG4gICAgbGV0IHByb2ZpdCA9IHNlcnZlci5tb25leU1heCAqIGVmZmVjdDtcbiAgICByZXR1cm4gW3Byb2ZpdCwgcHJvZml0IC8gKHRpbWUgLyAxMDAwKV07XG4gIH1cblxuICBjYWxjdWxhdGVUaHJlYWRzKHNlcnZlcjogYW55LCBoYWNrVGhyZWFkOiBudW1iZXIsIGhhY2tFZmZlY3Q6IG51bWJlcikge1xuICAgIGNvbnN0IGggPSB0aGlzLm5zLmZvcm11bGFzLmhhY2tpbmc7XG4gICAgc2VydmVyLm1vbmV5QXZhaWxhYmxlICo9IDEgLSBoYWNrRWZmZWN0O1xuICAgIGNvbnN0IHdlYWtlbkVmZmVjdCA9IHRoaXMubnMud2Vha2VuQW5hbHl6ZSgxKTtcbiAgICBjb25zdCBncm93VGhyZWFkID0gaC5ncm93VGhyZWFkcyhzZXJ2ZXIsIHRoaXMucGxheWVyLCBzZXJ2ZXIubW9uZXlNYXgpO1xuICAgIGNvbnN0IHdlYWtlblRocmVhZEhhY2sgPSBNYXRoLmNlaWwodGhpcy5ucy5oYWNrQW5hbHl6ZVNlY3VyaXR5KGhhY2tUaHJlYWQpIC8gd2Vha2VuRWZmZWN0KTtcbiAgICBjb25zdCB3ZWFrZW5UaHJlYWRHcm93ID0gTWF0aC5jZWlsKHRoaXMubnMuZ3Jvd3RoQW5hbHl6ZVNlY3VyaXR5KGdyb3dUaHJlYWQpIC8gd2Vha2VuRWZmZWN0KTtcbiAgICByZXR1cm4geyBoYWNrVGhyZWFkLCBncm93VGhyZWFkLCB3ZWFrZW5UaHJlYWRIYWNrLCB3ZWFrZW5UaHJlYWRHcm93IH07XG4gIH1cblxuICBnZXRUaW1pbmdzQW5kV2FpdHMoc2VydmVyOiBhbnkpIHtcbiAgICBjb25zdCBoID0gdGhpcy5ucy5mb3JtdWxhcy5oYWNraW5nO1xuICAgIGNvbnN0IHdlYWtlblRpbWUgPSBoLndlYWtlblRpbWUoc2VydmVyLCB0aGlzLnBsYXllcik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgd2Vha2VuVGltZSxcbiAgICAgIGhhY2tXYWl0OiB3ZWFrZW5UaW1lIC0gaC53ZWFrZW5UaW1lKHNlcnZlciwgdGhpcy5wbGF5ZXIpLFxuICAgICAgZ3Jvd1dhaXQ6IHdlYWtlblRpbWUgLSBoLndlYWtlblRpbWUoc2VydmVyLCB0aGlzLnBsYXllciksXG4gICAgfTtcbiAgfVxuXG4gIGdldFByaW1lZChzZXJ2ZXI6IGFueSkge1xuICAgIGlmICghaXNQcmltZWQoc2VydmVyKSkge1xuICAgICAgc2VydmVyLnByaW1lVGltZSA9IHRoaXMuZ2V0VGltaW5nc0FuZFdhaXRzKHNlcnZlcikud2Vha2VuVGltZTtcbiAgICAgIGxldCB0aHJlYWRzID0gZ2V0VGhyZWFkcyh0aGlzLm5zLCBzZXJ2ZXIuaG9zdG5hbWUpLnRvdGFsVGhyZWFkcztcbiAgICAgIHNlcnZlci5wcmltZUl0ZXIgPSBnZXRJdGVyc05lZWRlZCh0aGlzLm5zLCB0aGlzLm5vZGVMaXN0LCBTQ1JJUFRfQ09TVCwgdGhyZWFkcykuaXRlcnM7XG4gICAgICBzZXJ2ZXIuaGFja0RpZmZpY3VsdHkgPSBzZXJ2ZXIubWluRGlmZmljdWx0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VydmVyLnByaW1lVGltZSA9IDA7XG4gICAgICBzZXJ2ZXIucHJpbWVJdGVyID0gMDtcbiAgICB9XG5cbiAgICBzZXJ2ZXIucHJpbWVUb3RhbCA9IHNlcnZlci5wcmltZVRpbWUgKiBzZXJ2ZXIucHJpbWVJdGVyO1xuXG4gICAgcmV0dXJuIHNlcnZlcjtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxZQUFZLHNCQUFzQjtBQUMzQyxTQUFTLGtCQUFrQixVQUFVLHNCQUFzQjtBQUUzRCxNQUFNLGNBQWM7QUFFcEIsc0JBQXNCLEtBQUssSUFBUTtBQUNqQyxRQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDdEIsTUFBSSxXQUFXLElBQUksYUFBYSxFQUFFO0FBQ2xDLFdBQVMsc0JBQXNCLFFBQVEsUUFBUSxJQUFJLENBQUM7QUFDdEQ7QUFFTyxhQUFNLGFBQWE7QUFBQSxFQUN4QjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxTQUFnQixDQUFDO0FBQUEsRUFDakIsV0FBcUIsQ0FBQztBQUFBLEVBRXRCLFlBQVksSUFBUTtBQUNsQixTQUFLLEtBQUs7QUFDVixTQUFLLFlBQVksS0FBSyxLQUFLO0FBQUEsRUFDN0I7QUFBQSxFQUVBLGNBQWM7QUFDWixVQUFNLE9BQU87QUFDYixRQUFJLFNBQVMsS0FBSyxHQUNmLEtBQUssSUFBSSxFQUNULE1BQU0sSUFBSSxFQUNWLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFFbEIsV0FBTyxDQUFDLEdBQUcsUUFBUSxH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

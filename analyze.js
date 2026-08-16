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

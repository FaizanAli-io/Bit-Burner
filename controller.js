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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5pbXBvcnQgeyBjYWxjdWxhdGVSYW1Db3N0IH0gZnJvbSAnLi9jb21tb24nO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihuczogTlMpIHtcbiAgbnMudWkub3BlblRhaWwoKTtcbiAgbnMuZGlzYWJsZUxvZygnQUxMJyk7XG4gIG5zLnVpLm1vdmVUYWlsKDgwMCwgMCk7XG4gIG5zLnVpLnJlc2l6ZVRhaWwoMzIwLCAxODApO1xuICBucy5hdEV4aXQoKCkgPT4gbnMudWkuY2xvc2VUYWlsKCkpO1xuXG4gIGNvbnN0IG1hbmFnZXIgPSBuZXcgQmF0Y2hNYW5hZ2VyKG5zKTtcbiAgYXdhaXQgbWFuYWdlci5ydW5CYXRjaGVzKCk7XG59XG5cbmNsYXNzIEJhdGNoTWFuYWdlciB7XG4gIG5zOiBOUztcbiAgc2NyaXB0RmlsZXM6IHN0cmluZ1tdO1xuICBub2RlTGlzdDogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihuczogTlMpIHtcbiAgICB0aGlzLm5zID0gbnM7XG4gICAgdGhpcy5zY3JpcHRGaWxlcyA9IFsnYmF0Y2hpbmcvaGFja2VyLmpzJywgJ2JhdGNoaW5nL2dyb3dlci5qcycsICdiYXRjaGluZy93ZWFrZW5lci5qcyddO1xuXG4gICAgdGhpcy51cGRhdGVOb2RlTGlzdCgpO1xuICB9XG5cbiAgdXBkYXRlTm9kZUxpc3QoKSB7XG4gICAgY29uc3QgZmlsZSA9ICcuL2xpc3RzL2Jyb2tlbi50eHQnO1xuICAgIGxldCBicm9rZW4gPSB0aGlzLm5zXG4gICAgICAucmVhZChmaWxlKVxuICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgLmZpbHRlcigoeCkgPT4geCk7XG5cbiAgICB0aGlzLm5vZGVMaXN0ID0gWy4uLmJyb2tlbiwgLi4udGhpcy5ucy5nZXRQdXJjaGFzZWRTZXJ2ZXJzKCksICdob21lJ107XG4gICAgdGhpcy5ub2RlTGlzdC5mb3JFYWNoKChub2RlKSA9PiB0aGlzLm5zLnNjcCh0aGlzLnNjcmlwdEZpbGVzLCBub2RlKSk7XG4gIH1cblxuICBhc3luYyBnZXRPcHRpbWFsVGFyZ2V0KCkge1xuICAgIGNvbnN0IHBpZCA9IHRoaXMubnMuZXhlYygnYW5hbHl6ZS5qcycsICdob21lJywgMSwgZmFsc2UpO1xuXG4gICAgaWYgKCFwaWQpIHtcbiAgICAgIHRoaXMubnMudHByaW50KCdGYWlsZWQgdG8gcnVuIEFuYWx5emVyIHNjcmlwdC4nKTtcbiAgICAgIHRoaXMubnMud3JpdGVQb3J0KHRoaXMubnMucGlkLCBmYWxzZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLm5zLm5leHRQb3J0V3JpdGUocGlkKTtcbiAgICByZXR1cm4gdGhpcy5ucy5yZWFkUG9ydChwaWQpO1xuICB9XG5cbiAgYXN5bmMgcnVuQmF0Y2hlcygpIHtcbiAgICBsZXQgaXRlciA9IDA7XG4gICAgbGV0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5ucy50cHJpbnQoJ0F3YWl0aW5nIHNpZ25hbC4uLicpO1xuICAgIGF3YWl0IHRoaXMubnMubmV4dFBvcnRXcml0ZSh0aGlzLm5zLnBpZCk7XG4gICAgbGV0IG9wdGltYWwgPSBhd2FpdCB0aGlzLmdldE9wdGltYWxUYXJnZXQoKTtcblxuICAgIGxldCBhdHRlbXB0cyA9IDA7XG4gICAgd2hpbGUgKCFvcHRpbWFsKSB7XG4gICAgICBhd2FpdCB0aGlzLm5zLnNsZWVwKDEwMDAwKTtcbiAgICAgIG9wdGltYWwgPSBhd2FpdCB0aGlzLmdldE9wdGltYWxUYXJnZXQoKTtcbiAgICAgIHRoaXMubnMucHJpbnQoYFskeysrYXR0ZW1wdHN9XSBObyBvcHRpbWFsIHRhcmdldCBmb3VuZCwgcmV0cnlpbmcgaW4gMTAgc2Vjb25kcy4uLmApO1xuICAgIH1cblxuICAgIHdoaWxlIChvcHRpbWFsKSB7XG4gICAgICBjb25zdCB7IGhhY2tzLCB0YXJnZXQgfSA9IG9wdGltYWw7XG5cbiAgICAgIGlmICghdGhpcy5pc1ByaW1lZCh0YXJnZXQpKSB7XG4gICAgICAgIGNvbnN0IHBpZCA9IHRoaXMubnMuZXhlYygncHJpbWVyLmpzJywgJ2hvbWUnLCAxLCB0YXJnZXQpO1xuICAgICAgICB3aGlsZSAodGhpcy5ucy5pc1J1bm5pbmcocGlkKSkgYXdhaXQgdGhpcy5ucy5zbGVlcCgxMDApO1xuICAgICAgICBvcHRpbWFsID0gYXdhaXQgdGhpcy5nZXRPcHRpbWFsVGFyZ2V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IHdlYWtlblRpbWUsIGhhY2tXYWl0LCBncm93V2FpdCB9ID0gdGhpcy5nZXRUaW1pbmdzQW5kV2FpdHModGFyZ2V0KTtcbiAgICAgICAgY29uc3QgdGhyZWFkcyA9IHRoaXMuY2FsY3VsYXRlVGhyZWFkcyhoYWNrcywgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgcmFtQ29zdCA9IGNhbGN1bGF0ZVJhbUNvc3QodGhyZWFkcyk7XG5cbiAgICAgICAgY29uc3QgeyBoYWNrVGhyZWFkLCB3ZWFrZW5UaHJlYWRIYWNrLCBncm93VGhyZWFkLCB3ZWFrZW5UaHJlYWRHcm93IH0gPSB0aHJlYWRzO1xuXG4gICAgICAgIHRoaXMubnMucHJpbnQoYFxcbkl0ZXJhdGlvbjogJHsrK2l0ZXJ9YCk7XG4gICAgICAgIHRoaXMubnMucHJpbnQoYFRhcmdldCBTZXJ2ZXI6ICR7dGFyZ2V0fWApO1xuICAgICAgICB0aGlzLm5zLnByaW50KGBSdW5uaW5nIHdpdGggJHtoYWNrVGhyZWFkfSBIYWNrIFRocmVhZHNgKTtcbiAgICAgICAgdGhpcy5ucy5wcmludChgQmF0Y2ggVGltZTogJHt0aGlzLm5zLnRGb3JtYXQod2Vha2VuVGltZSl9YCk7XG5cbiAgICAgICAgbGV0IGJhdGNoQ291bnQgPSAwO1xuICAgICAgICBsZXQgbGF1bmNoU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGhvc3Qgb2YgdGhpcy5ub2RlTGlzdCkge1xuICAgICAgICAgIGxldCBsaW1pdCA9IE1hdGguZmxvb3IodGhpcy5nZXRBdmFpbGFibGVSYW0oaG9zdCkgLyByYW1Db3N0KTtcblxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGltaXQ7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ucy5leGVjKCdiYXRjaGluZy9oYWNrZXIuanMnLCBob3N0LCBoYWNrVGhyZWFkLCB0YXJnZXQsIGhhY2tXYWl0KTtcbiAgICAgICAgICAgIHRoaXMubnMuZXhlYygnYmF0Y2hpbmcvd2Vha2VuZXIuanMnLCBob3N0LCB3ZWFrZW5UaHJlYWRIYWNrLCB0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5ucy5leGVjKCdiYXRjaGluZy9ncm93ZXIuanMnLCBob3N0LCBncm93VGhyZWFkLCB0YXJnZXQsIGdyb3dXYWl0KTtcbiAgICAgICAgICAgIHRoaXMubnMuZXhlYygnYmF0Y2hpbmcvd2Vha2VuZXIuanMnLCBob3N0LCB3ZWFrZW5UaHJlYWRHcm93LCB0YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCsrYmF0Y2hDb3VudCA+PSA5MDAwMCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGlmIChwZXJmb3JtYW5jZS5ub3coKSA+IHN0YXJ0ICsgMjAwKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgICAgIGF3YWl0IHRoaXMubnMuc2xlZXAoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGJhdGNoQ291bnQgPj0gOTAwMDApIGJyZWFrO1xuICAgICAgICAgIGF3YWl0IDA7XG4gICAgICAgICAgYXdhaXQgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsYXVuY2hUaW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXVuY2hTdGFydDtcbiAgICAgICAgY29uc3QgW3Byb2ZpdCwgaW5jb21lXSA9IHRoaXMuY2FsY3VsYXRlUHJvZml0QW5kSW5jb21lKFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICBoYWNrVGhyZWFkICogYmF0Y2hDb3VudCxcbiAgICAgICAgICB3ZWFrZW5UaW1lICsgbGF1bmNoVGltZSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLm5zLnByaW50KGBMYXVuY2hlZCAke2JhdGNoQ291bnR9IGJhdGNoZXMgaW4gJHt0aGlzLm5zLnRGb3JtYXQobGF1bmNoVGltZSl9YCk7XG4gICAgICAgIHRoaXMubnMucHJpbnQoYEV4cGVjdGVkIFByb2ZpdDogJHt0aGlzLm5zLmZvcm1hdE51bWJlcihwcm9maXQsIDIpfSAvIHJvdW5kYCk7XG4gICAgICAgIHRoaXMubnMucHJpbnQoYEV4cGVjdGVkIEluY29tZTogJHt0aGlzLm5zLmZvcm1hdE51bWJlcihpbmNvbWUsIDIpfSAvIHNlY2ApO1xuICAgICAgICB0aGlzLm5zLnByaW50KGBTbGVlcGluZyBmb3IgJHt0aGlzLm5zLnRGb3JtYXQod2Vha2VuVGltZSl9XFxuYCk7XG5cbiAgICAgICAgaWYgKHRoaXMubnMuYXJnc1swXSA9PT0gJ3QnKSB0aGlzLm5zLmV4ZWMoJ21pc2MvdGltZXIuanMnLCAnaG9tZScsIDEsIHdlYWtlblRpbWUpO1xuICAgICAgICBhd2FpdCB0aGlzLm5zLnNsZWVwKHdlYWtlblRpbWUpO1xuXG4gICAgICAgIHRoaXMubnMud3JpdGVQb3J0KHRoaXMubnMucGlkLCB0cnVlKTtcbiAgICAgICAgdGhpcy5ucy50cHJpbnQoJ0F3YWl0aW5nIHNpZ25hbC4uLicpO1xuICAgICAgICBhd2FpdCB0aGlzLm5zLm5leHRQb3J0V3JpdGUodGhpcy5ucy5waWQpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlTm9kZUxpc3QoKTtcbiAgICAgICAgb3B0aW1hbCA9IGF3YWl0IHRoaXMuZ2V0T3B0aW1hbFRhcmdldCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVByb2ZpdEFuZEluY29tZSh0YXJnZXQ6IHN0cmluZywgdGhyZWFkczogbnVtYmVyLCB0aW1lOiBudW1iZXIpIHtcbiAgICBjb25zdCBwcm9maXQgPSB0aGlzLm5zLmdldFNlcnZlck1vbmV5QXZhaWxhYmxlKHRhcmdldCkgKiB0aGlzLm5zLmhhY2tBbmFseXplKHRhcmdldCkgKiB0aHJlYWRzO1xuICAgIHJldHVybiBbcHJvZml0LCBwcm9maXQgLyAodGltZSAvIDEwMDApXTtcbiAgfVxuXG4gIGdldFRpbWluZ3NBbmRXYWl0cyh0YXJnZXQ6IHN0cmluZykge1xuICAgIGNvbnN0IHdlYWtlblRpbWUgPSB0aGlzLm5zLmdldFdlYWtlblRpbWUodGFyZ2V0KTtcbiAgICByZXR1cm4ge1xuICAgICAgd2Vha2VuVGltZSxcbiAgICAgIGhhY2tXYWl0OiB3ZWFrZW5UaW1lIC0gdGhpcy5ucy5nZXRIYWNrVGltZSh0YXJnZXQpLFxuICAgICAgZ3Jvd1dhaXQ6IHdlYWtlblRpbWUgLSB0aGlzLm5zLmdldEdyb3dUaW1lKHRhcmdldCksXG4gICAgfTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVRocmVhZHMoaGFja1RocmVhZDogbnVtYmVyLCB0YXJnZXQ6IHN0cmluZykge1xuICAgIGNvbnN0IHdlYWtlbkVmZmVjdCA9IHRoaXMubnMud2Vha2VuQW5hbHl6ZSgxKTtcbiAgICBjb25zdCBoYWNrRWZmZWN0ID0gdGhpcy5ucy5oYWNrQW5hbHl6ZSh0YXJnZXQpO1xuICAgIGNvbnN0IGdyb3dUaHJlYWQgPSBNYXRoLmNlaWwodGhpcy5ucy5ncm93dGhBbmFseXplKHRhcmdldCwgMSAvICgxIC0gaGFja0VmZmVjdCAqIGhhY2tUaHJlYWQpKSk7XG4gICAgY29uc3Qgd2Vha2VuVGhyZWFkSGFjayA9IE1hdGguY2VpbCh0aGlzLm5zLmhhY2tBbmFseXplU2VjdXJpdHkoaGFja1RocmVhZCkgLyB3ZWFrZW5FZmZlY3QpO1xuICAgIGNvbnN0IHdlYWtlblRocmVhZEdyb3cgPSBNYXRoLmNlaWwodGhpcy5ucy5ncm93dGhBbmFseXplU2VjdXJpdHkoZ3Jvd1RocmVhZCkgLyB3ZWFrZW5FZmZlY3QpO1xuXG4gICAgcmV0dXJuIHsgaGFja1RocmVhZCwgZ3Jvd1RocmVhZCwgd2Vha2VuVGhyZWFkSGFjaywgd2Vha2VuVGhyZWFkR3JvdyB9O1xuICB9XG5cbiAgaXNQcmltZWQodGFyZ2V0OiBzdHJpbmcpIHtcbiAgICBjb25zdCBtYXhNb25leSA9IHRoaXMubnMuZ2V0U2VydmVyTWF4TW9uZXkodGFyZ2V0KTtcbiAgICBjb25zdCBjdXJyZW50TW9uZXkgPSB0aGlzLm5zLmdldFNlcnZlck1vbmV5QXZhaWxhYmxlKHRhcmdldCk7XG4gICAgY29uc3QgbWluU2VjdXJpdHkgPSB0aGlzLm5zLmdldFNlcnZlck1pblNlY3VyaXR5TGV2ZWwodGFyZ2V0KTtcbiAgICBjb25zdCBjdXJyZW50U2VjdXJpdHkgPSB0aGlzLm5zLmdldFNlcnZlclNlY3VyaXR5TGV2ZWwodGFyZ2V0KTtcblxuICAgIHJldHVybiBtYXhNb25leSA9PT0gY3VycmVudE1vbmV5ICYmIGN1cnJlbnRTZWN1cml0eSA9PT0gbWluU2VjdXJpdHk7XG4gIH1cblxuICBnZXRBdmFpbGFibGVSYW0gPSAobm9kZTogc3RyaW5nKSA9PlxuICAgIHRoaXMubnMuZ2V0U2VydmVyTWF4UmFtKG5vZGUpICogKG5vZGUgPT0gJ2hvbWUnID8gMC45IDogMSkgLSB0aGlzLm5zLmdldFNlcnZlclVzZWRSYW0obm9kZSk7XG59XG4iXSwibWFwcGluZ3MiOiJBQUVBLFNBQVMsd0JBQXdCO0FBRWpDLHNCQUFzQixLQUFLLElBQVE7QUFDakMsS0FBRyxHQUFHLFNBQVM7QUFDZixLQUFHLFdBQVcsS0FBSztBQUNuQixLQUFHLEdBQUcsU0FBUyxLQUFLLENBQUM7QUFDckIsS0FBRyxHQUFHLFdBQVcsS0FBSyxHQUFHO0FBQ3pCLEtBQUcsT0FBTyxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUM7QUFFakMsUUFBTSxVQUFVLElBQUksYUFBYSxFQUFFO0FBQ25DLFFBQU0sUUFBUSxXQUFXO0FBQzNCO0FBRUEsTUFBTSxhQUFhO0FBQUEsRUFDakI7QUFBQSxFQUNBO0FBQUEsRUFDQSxXQUFxQixDQUFDO0FB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

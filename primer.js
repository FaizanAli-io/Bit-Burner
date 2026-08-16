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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW1lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOUyB9IGZyb20gJ0Bucyc7XG5cbmltcG9ydCB7IGdldFRocmVhZHMsIGdldEl0ZXJzTmVlZGVkIH0gZnJvbSAnLi9oZWxwZXJzJztcblxuY29uc3QgU0NSSVBUX0NPU1QgPSAxLjc1O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihuczogTlMpIHtcbiAgbnMudWkub3BlblRhaWwoKTtcbiAgbnMuZGlzYWJsZUxvZygnQUxMJyk7XG4gIG5zLnVpLm1vdmVUYWlsKDgwMCwgMTkwKTtcbiAgbnMudWkucmVzaXplVGFpbCgzMjAsIDE4MCk7XG4gIG5zLmF0RXhpdCgoKSA9PiBucy51aS5jbG9zZVRhaWwoKSk7XG5cbiAgY29uc3QgcHJpbWVyID0gbmV3IFNlcnZlclByaW1lcihucyk7XG4gIGF3YWl0IHByaW1lci5wcmltZVNlcnZlcihTdHJpbmcobnMuYXJnc1swXSkpO1xufVxuXG5leHBvcnQgY2xhc3MgU2VydmVyUHJpbWVyIHtcbiAgbnM6IE5TO1xuICBub2RlTGlzdDogc3RyaW5nW10gPSBbXTtcbiAgc2NyaXB0RmlsZXM6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKG5zOiBOUykge1xuICAgIHRoaXMubnMgPSBucztcbiAgICB0aGlzLnNjcmlwdEZpbGVzID0gWydiYXRjaGluZy9oYWNrZXIuanMnLCAnYmF0Y2hpbmcvZ3Jvd2VyLmpzJywgJ2JhdGNoaW5nL3dlYWtlbmVyLmpzJ107XG5cbiAgICB0aGlzLnVwZGF0ZU5vZGVMaXN0KCk7XG4gIH1cblxuICB1cGRhdGVOb2RlTGlzdCgpIHtcbiAgICBjb25zdCBmaWxlID0gJy4vbGlzdHMvYnJva2VuLnR4dCc7XG4gICAgbGV0IGJyb2tlbiA9IHRoaXMubnNcbiAgICAgIC5yZWFkKGZpbGUpXG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAuZmlsdGVyKCh4KSA9PiB4KTtcblxuICAgIHRoaXMubm9kZUxpc3QgPSBbLi4uYnJva2VuLCAuLi50aGlzLm5zLmdldFB1cmNoYXNlZFNlcnZlcnMoKSwgJ2hvbWUnXTtcbiAgICB0aGlzLm5vZGVMaXN0LmZvckVhY2goKG5vZGUpID0+IHRoaXMubnMuc2NwKHRoaXMuc2NyaXB0RmlsZXMsIG5vZGUpKTtcbiAgfVxuXG4gIGFzeW5jIHByaW1lU2VydmVyKHRhcmdldDogc3RyaW5nKSB7XG4gICAgbGV0IHsgdG90YWxUaHJlYWRzIH0gPSBnZXRUaHJlYWRzKHRoaXMubnMsIHRhcmdldCk7XG4gICAgaWYgKHRvdGFsVGhyZWFkcyA8PSAwKSByZXR1cm47XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IHsgd2Vha2VuVGhyZWFkQmVmb3JlLCB3ZWFrZW5UaHJlYWRBZnRlciwgZ3Jvd1RocmVhZCwgdG90YWxUaHJlYWRzIH0gPSBnZXRUaHJlYWRzKFxuICAgICAgICB0aGlzLm5zLFxuICAgICAgICB0YXJnZXQsXG4gICAgICApO1xuXG4gICAgICBjb25zdCBHQVAgPSAxMDAwO1xuICAgICAgbGV0IGdyb3dEb25lID0gZmFsc2U7XG4gICAgICBsZXQgd2Vha2VuRG9uZSA9IGZhbHNlO1xuICAgICAgbGV0IHsgd2Vha2VuVGltZSwgZ3Jvd1dhaXQgfSA9IHRoaXMuZ2V0VGltZXModGFyZ2V0KTtcbiAgICAgIGxldCB7IGl0ZXJzLCB0aHJlYWRzUGVySXRlciB9ID0gZ2V0SXRlcnNOZWVkZWQoXG4gICAgICAgIHRoaXMubnMsXG4gICAgICAgIHRoaXMubm9kZUxpc3QsXG4gICAgICAgIFNDUklQVF9DT1NULFxuICAgICAgICB0b3RhbFRocmVhZHMsXG4gICAgICApO1xuXG4gICAgICB0aGlzLm5zLnByaW50KFxuICAgICAgICBgUHJpbWluZyBTZXJ2ZXI6ICR7dGFyZ2V0fVxcbmAsXG4gICAgICAgIGBJdGVyYXRpb25zIE5lZWRlZDogJHtpdGVyc31cXG5gLFxuICAgICAgICBgVGltZTogJHt0aGlzLm5zLnRGb3JtYXQod2Vha2VuVGltZSl9XFxuYCxcbiAgICAgICAgYFRocmVhZHM6ICR7d2Vha2VuVGhyZWFkQmVmb3JlfSArICR7Z3Jvd1RocmVhZH0gKyAke3dlYWtlblRocmVhZEFmdGVyfSA9ICR7dG90YWxUaHJlYWRzfVxcbmAsXG4gICAgICAgIGBUaHJlYWRzIFBlciBJdGVyYXRpb246ICR7dGhyZWFkc1Blckl0ZXJ9XFxuXFxuYCxcbiAgICAgICk7XG5cbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLm5vZGVMaXN0KSB7XG4gICAgICAgIGxldCBub2RlUmFtID0gdGhpcy5ucy5nZXRTZXJ2ZXJNYXhSYW0obm9kZSkgLSB0aGlzLm5zLmdldFNlcnZlclVzZWRSYW0obm9kZSk7XG4gICAgICAgIGxldCBub2RlVGhyZWFkcyA9IE1hdGguZmxvb3Iobm9kZVJhbSAvIFNDUklQVF9DT1NUKTtcblxuICAgICAgICBpZiAod2Vha2VuVGhyZWFkQmVmb3JlID4gMCAmJiBub2RlVGhyZWFkcyA+IDApIHtcbiAgICAgICAgICBsZXQgdGFza1RocmVhZHMgPSBNYXRoLm1pbih3ZWFrZW5UaHJlYWRCZWZvcmUsIG5vZGVUaHJlYWRzKTtcbiAgICAgICAgICB0aGlzLm5zLmV4ZWMoJ2JhdGNoaW5nL3dlYWtlbmVyLmpzJywgbm9kZSwgdGFza1RocmVhZHMsIHRhcmdldCk7XG4gICAgICAgICAgdGhpcy5ucy5wcmludChgICAtPiAke3Rhc2tUaHJlYWRzfSAvICR7d2Vha2VuVGhyZWFkQmVmb3JlfSBXVEIgQCAke25vZGV9YCk7XG4gICAgICAgICAgd2Vha2VuVGhyZWFkQmVmb3JlIC09IHRhc2tUaHJlYWRzO1xuICAgICAgICAgIG5vZGVUaHJlYWRzIC09IHRhc2tUaHJlYWRzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdyb3dUaHJlYWQgPiAwICYmIG5vZGVUaHJlYWRzID4gMCkge1xuICAgICAgICAgIGlmICghd2Vha2VuRG9uZSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5ucy5zbGVlcChHQVApO1xuICAgICAgICAgICAgd2Vha2VuRG9uZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCB0YXNrVGhyZWFkcyA9IE1hdGgubWluKGdyb3dUaHJlYWQsIG5vZGVUaHJlYWRzKTtcbiAgICAgICAgICB0aGlzLm5zLmV4ZWMoJ2JhdGNoaW5nL2dyb3dlci5qcycsIG5vZGUsIHRhc2tUaHJlYWRzLCB0YXJnZXQsIGdyb3dXYWl0KTtcbiAgICAgICAgICB0aGlzLm5zLnByaW50KGAgIC0+ICR7dGFza1RocmVhZHN9IC8gJHtncm93VGhyZWFkfSBHVCBAICR7bm9kZX1gKTtcbiAgICAgICAgICBncm93VGhyZWFkIC09IHRhc2tUaHJlYWRzO1xuICAgICAgICAgIG5vZGVUaHJlYWRzIC09IHRhc2tUaHJlYWRzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdlYWtlblRocmVhZEFmdGVyID4gMCAmJiBub2RlVGhyZWFkcyA+IDApIHtcbiAgICAgICAgICBpZiAoIWdyb3dEb25lKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLm5zLnNsZWVwKEdBUCk7XG4gICAgICAgICAgICBncm93RG9uZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCB0YXNrVGhyZWFkcyA9IE1hdGgubWluKHdlYWtlblRocmVhZEFmdGVyLCBub2RlVGhyZWFkcyk7XG4gICAgICAgICAgdGhpcy5ucy5leGVjKCdiYXRjaGluZy93ZWFrZW5lci5qcycsIG5vZGUsIHRhc2tUaHJlYWRzLCB0YXJnZXQpO1xuICAgICAgICAgIHRoaXMubnMucHJpbnQoYCAgLT4gJHt0YXNrVGhyZWFkc30gLyAke3dlYWtlblRocmVhZEFmdGVyfSBXVEEgQCAke25vZGV9YCk7XG4gICAgICAgICAgd2Vha2VuVGhyZWFkQWZ0ZXIgLT0gdGFza1RocmVhZHM7XG4gICAgICAgICAgbm9kZVRocmVhZHMgLT0gdGFza1RocmVhZHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5ucy5ydW4oJ21pc2MvdGltZXIuanMnLCAxLCB3ZWFrZW5UaW1lKTtcbiAgICAgIGF3YWl0IHRoaXMubnMuc2xlZXAod2Vha2VuVGltZSArIDk5KTtcbiAgICAgIHRoaXMudXBkYXRlTm9kZUxpc3QoKTtcblxuICAgICAgaWYgKHdlYWtlblRocmVhZEJlZm9yZSA8PSAwICYmIHdlYWtlblRocmVhZEFmdGVyIDw9IDAgJiYgZ3Jvd1RocmVhZCA8PSAwKSBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLm5zLnVpLmNsb3NlVGFpbCgpO1xuICB9XG5cbiAgZ2V0VGltZXModGFyZ2V0OiBzdHJpbmcpIHtcbiAgICBjb25zdCB3ZWFrZW5UaW1lID0gdGhpcy5ucy5nZXRXZWFrZW5UaW1lKHRhcmdldCk7XG4gICAgY29uc3QgZ3Jvd1RpbWUgPSB0aGlzLm5zLmdldEdyb3dUaW1lKHRhcmdldCk7XG4gICAgY29uc3QgZ3Jvd1dhaXQgPSB3ZWFrZW5UaW1lIC0gZ3Jvd1RpbWU7XG4gICAgcmV0dXJuIHsgd2Vha2VuVGltZSwgZ3Jvd1dhaXQgfTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFlBQVksc0JBQXNCO0FBRTNDLE1BQU0sY0FBYztBQUVwQixzQkFBc0IsS0FBSyxJQUFRO0FBQ2pDLEtBQUcsR0FBRyxTQUFTO0FBQ2YsS0FBRyxXQUFXLEtBQUs7QUFDbkIsS0FBRyxHQUFHLFNBQVMsS0FBSyxHQUFHO0FBQ3ZCLEtBQUcsR0FBRyxXQUFXLEtBQUssR0FBRztBQUN6QixLQUFHLE9BQU8sTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDO0FBRWpDLFFBQU0sU0FBUyxJQUFJLGFBQWEsRUFBRTtBQUNsQyxRQUFNLE9BQU8sWUFBWSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUVPLGFBQU0sYUFBYTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxXQUFxQixDQUFDO0FBQUEsRUFDdEI7QUFBQSxFQUVBLFlBQVksSUFBUTtBQUNsQixTQUFLLEtBQUs7QUFDVixTQUFLLGNBQWMsQ0FBQyxzQkFBc0Isc0JBQXNCLHNCQUFzQjtBQUV0RixTQUFLLGVBQWU7QUFBQSxFQUN0QjtBQUFBLEVB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

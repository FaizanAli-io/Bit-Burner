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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hbmFnZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5jb25zdCBGSUxFUyA9IFtcbiAgJ3dvcmtlcnMvaW5maWx0cmF0ZS5qcycsXG4gICd3b3JrZXJzL2J1eVJhbUFuZENvcmVzLmpzJyxcbiAgJ3dvcmtlcnMvYnV5VG9yQW5kUHJvZ3JhbXMuanMnLFxuICAnd29ya2Vycy9idXlBbmRVcGdyYWRlU2VydmVycy5qcycsXG4gICdmYWN0aW9ucy9jaXR5LWZhY3Rpb25zLmpzJyxcbiAgJ2ZhY3Rpb25zL2hhY2stZmFjdGlvbnMuanMnLFxuICAnZmFjdGlvbnMvZmFjdGlvbi13b3JrLmpzJyxcbl07XG5cbmZ1bmN0aW9uIGZyZWVSYW1Ib21lKG5zOiBOUykge1xuICByZXR1cm4gbnMuZ2V0U2VydmVyTWF4UmFtKCdob21lJykgLSBucy5nZXRTZXJ2ZXJVc2VkUmFtKCdob21lJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrQmF0Y2hTdGF0dXMobnM6IE5TLCBwaWQ6IG51bWJlcikge1xuICBhd2FpdCBucy5uZXh0UG9ydFdyaXRlKHBpZCk7XG4gIHJldHVybiBucy5yZWFkUG9ydChwaWQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihuczogTlMpIHtcbiAgbnMuY2xlYXIoJy4vbGlzdHMvYnJva2VuLnR4dCcpO1xuICBsZXQgcGlkcyA9IHsga2FybWE6IE5hTiwgZGlzcGxheTogTmFOLCBjb250cm9sbGVyOiBOYU4gfTtcbiAgY29uc3Qgd29ya2VycyA9IEZJTEVTLm1hcCgoeCkgPT4gKHsgZmlsZTogeCwgZG9uZTogZmFsc2UgfSkpO1xuXG4gIGNvbnN0IGFyZyA9IG5zLmFyZ3Muam9pbignJyk7XG4gIGlmIChhcmcuaW5jbHVkZXMoJ2QnKSkgcGlkcy5kaXNwbGF5ID0gbnMucnVuKCdkaXNwbGF5LmpzJyk7XG4gIGlmIChhcmcuaW5jbHVkZXMoJ2snKSkgcGlkcy5rYXJtYSA9IG5zLnJ1bignbWlzYy9rYXJtYS5qcycpO1xuICBpZiAoYXJnLmluY2x1ZGVzKCdjJykpIHtcbiAgICBjb25zdCBhcmdzID0gYXJnLmluY2x1ZGVzKCd0JykgPyBbJ3QnXSA6IFtdO1xuICAgIHBpZHMuY29udHJvbGxlciA9IG5zLnJ1bignY29udHJvbGxlci5qcycsIDEsIC4uLmFyZ3MpO1xuICB9XG5cbiAgYXdhaXQgcnVuV29ya2Vycyhucywgd29ya2Vycyk7XG4gIG5zLndyaXRlUG9ydChwaWRzLmNvbnRyb2xsZXIsIHRydWUpO1xuXG4gIHdoaWxlIChwaWRzLmNvbnRyb2xsZXIgJiYgIWlzTmFOKHBpZHMuY29udHJvbGxlcikpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja0JhdGNoU3RhdHVzKG5zLCBwaWRzLmNvbnRyb2xsZXIpO1xuICAgIG5zLnRwcmludChgU2lnbmFsIHJlY2VpdmVkOiAke3Jlc3VsdH0uYCk7XG4gICAgYXdhaXQgcnVuV29ya2Vycyhucywgd29ya2Vycyk7XG5cbiAgICBucy53cml0ZVBvcnQocGlkcy5jb250cm9sbGVyLCB0cnVlKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5Xb3JrZXJzKG5zOiBOUywgd29ya2VyczogeyBmaWxlOiBzdHJpbmc7IGRvbmU6IGJvb2xlYW4gfVtdKSB7XG4gIGZvciAoY29uc3Qgd29ya2VyIG9mIHdvcmtlcnMpIHtcbiAgICBpZiAod29ya2VyLmRvbmUpIGNvbnRpbnVlO1xuICAgIGNvbnN0IHJlcVJhbSA9IG5zLmdldFNjcmlwdFJhbSh3b3JrZXIuZmlsZSwgJ2hvbWUnKSB8fCAwO1xuXG4gICAgbGV0IGF0dGVtcHRzID0gMDtcbiAgICBjb25zdCBNQVhfQVRURU1QVFMgPSA1O1xuICAgIHdoaWxlIChmcmVlUmFtSG9tZShucykgPD0gcmVxUmFtICYmIGF0dGVtcHRzKysgPCBNQVhfQVRURU1QVFMpIHtcbiAgICAgIGF3YWl0IG5zLnNsZWVwKDEwMDApO1xuICAgIH1cblxuICAgIGlmIChhdHRlbXB0cyA+PSBNQVhfQVRURU1QVFMpIHtcbiAgICAgIG5zLnRwcmludChgU2tpcHBpbmcgJHt3b3JrZXIuZmlsZX1gKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIG5zLnRwcmludChgU3RhcnRpbmcgJHt3b3JrZXIuZmlsZX1gKTtcbiAgICBpZiAoIW5zLmlzUnVubmluZyh3b3JrZXIuZmlsZSkpIHtcbiAgICAgIGNvbnN0IHBpZCA9IG5zLnJ1bih3b3JrZXIuZmlsZSk7XG4gICAgICBhd2FpdCBucy5uZXh0UG9ydFdyaXRlKHBpZCk7XG4gICAgICBjb25zdCBzID0gbnMucmVhZFBvcnQocGlkKTtcbiAgICAgIHdvcmtlci5kb25lID0gQm9vbGVhbihzKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxRQUFRO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBRUEsU0FBUyxZQUFZLElBQVE7QUFDM0IsU0FBTyxHQUFHLGdCQUFnQixNQUFNLElBQUksR0FBRyxpQkFBaUIsTUFBTTtBQUNoRTtBQUVBLGVBQWUsaUJBQWlCLElBQVEsS0FBYTtBQUNuRCxRQUFNLEdBQUcsY0FBYyxHQUFHO0FBQzFCLFNBQU8sR0FBRyxTQUFTLEdBQUc7QUFDeEI7QUFFQSxzQkFBc0IsS0FBSyxJQUFRO0FBQ2pDLEtBQUcsTUFBTSxvQkFBb0I7QUFDN0IsTUFBSSxPQUFPLEVBQUUsT0FBTyxLQUFLLFNBQVMsS0FBSyxZQUFZLElBQUk7QUFDdkQsUUFBTSxVQUFVLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUcsTUFBTSxNQUFNLEVBQUU7QUFFM0QsUUFBTSxNQUFNLEdBQUcsS0FBSyxLQUFLLEVBQUU7QUFDM0IsTUFBSSxJQUFJLFNBQVMsR0FBRztBQUFHLFNBQUssVUFBVSxHQUFHLElBQUksWUFBWTtBQUN6RCxNQUFJLElBQUksU0FBUyxHQUFHO0FBQUcsU0FBSyxRQUFRLEdBQUcsSUFBSSxlQUFlO0FBQzFELE1BQUksSUFBSSxTQUFTLEdBQUcsR0FBRztBQUNyQixVQUFNLE9BQU8sSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFDLFNBQUssYUFBYSxHQUFHLElBQUksaUJBQWlCLEdBQUcsR0FBRyxJQUFJO0FBQUEsRUFDdEQ7QUFFQSxRQUFNLFdBQVcsSUFBSSxPQUFPO0FBQzVCLEtBQUcsVUFBVSxLQUFLLFlBQVksSUFBSTtBQUVsQyxTQUFPLEtBQUssY0FBYyxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUc7QUFDakQsVUFBTSxTQUFTLE1BQU0saUJBQWlCLElBQUksS0FBSyxVQUFVO0FBQ3pELE9BQUcsT0FBTyxvQkFBb0IsTUFBTSxHQUFHO0FBQ3ZDLFVBQU0sV0FBVyxJQUFJLE9BQU87QUFFNUIsT0FBRyxVQUFVLEtBQUssWUFBWSxJQUFJO0FBQUEsRUFDcEM7QUFDRjtBQUVBLGVBQWUsV0FBVyxJQUFRLFNBQTRDO0FBQzVFLGFBQVcsVUFBVSxTQUFTO0FBQzVCLFFBQUksT0FBTztBQUFNO0FBQ2pCLFVBQU0sU0FBUyxHQUFHLGFBQWEsT0FBTyxNQUFNLE1BQU0sS0FBSztBQUV2RCxRQUFJLFdBQVc7QUFDZixVQUFNLGVBQWU7QUFDckIsV0FBTyxZQUFZLEVBQUUsS0FBSyxVQUFVLGFBQWEsY0FBYztBQUM3RCxZQUFNLEdBQUcsTUFBTSxHQUFJO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksY0FBYztBQUM1QixTQUFHLE9BQU8sWUFBWSxPQUFPLElBQUksRUFBRTtBQUNuQztBQUFBLElBQ0Y7QUFFQSxPQUFHLE9BQU8sWUFBWSxPQUFPLElBQUksRUFBRTtBQUNuQyxRQUFJLENBQUMsR0FBRyxVQUFVLE9BQU8sSUFBSSxHQUFHO0FBQzlCLFlBQU0sTUFBTSxHQUFHLElBQUksT0FBTyxJQUFJO0FBQzlCLFlBQU0sR0FBRyxjQUFjLEdBQUc7QUFDMUIsWUFBTSxJQUFJLEdBQUcsU0FBUyxHQUFHO0FBQ3pCLGFBQU8sT0FBTyxRQUFRLENBQUM7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFDRjsiLCJuYW1lcyI6W119

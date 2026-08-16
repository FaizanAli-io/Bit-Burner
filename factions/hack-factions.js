import { tryCrack } from '/crack.js';
export async function main(ns) {
  let done = true;
  const factions = [
    ['CyberSec', 'CSEC'],
    ['NiteSec', 'avmnite-02h'],
    ['The Black Hand', 'I.I.I.I'],
    ['BitRunners', 'run4theh111z'],
  ];
  const player = ns.getPlayer();
  for (const [factionName, serverName] of factions) {
    if (!player.factions.includes(factionName)) {
      done = false;
      const path = findPath(ns, serverName);
      if (path) await joinFaction(ns, factionName, path);
    }
  }
  if (Boolean(ns.args[0])) await checkDemon(ns);
  ns.writePort(ns.pid, done);
}
async function checkDemon(ns) {
  const target = 'w0r1d_d43m0n';
  const path = findPath(ns, target);
  if (!path) {
    ns.tprint(`Path to ${target} not found.`);
    return;
  }
  const required = ns.getServerRequiredHackingLevel(target);
  if (ns.getHackingLevel() < required) {
    ns.tprint(`Hacking level too low for ${target} (Needed: ${required})`);
    return;
  }
  if (!tryCrack(ns, target)) {
    ns.tprint(`Failed to crack ${target}`);
    ns.singularity.connect('home');
    return;
  }
  for (const node of path) ns.singularity.connect(node);
  await ns.singularity.installBackdoor();
  ns.singularity.connect('home');
}
function findPath(ns, to, from = 'home') {
  if (from === to) return [to];
  const queue = [from];
  const parent = { [from]: null };
  const seen = /* @__PURE__ */ new Set([from]);
  while (queue.length) {
    const node = queue.shift();
    for (const child of ns.scan(node)) {
      if (seen.has(child)) continue;
      seen.add(child);
      parent[child] = node;
      if (child === to) {
        const path = [];
        let cur = child;
        while (cur && cur !== from) {
          path.push(cur);
          cur = parent[cur];
        }
        return path.reverse();
      }
      queue.push(child);
    }
  }
  return null;
}
async function joinFaction(ns, faction, path) {
  const single = ns.singularity;
  for (const node of path) single.connect(node);
  const current = path[path.length - 1];
  const required = ns.getServerRequiredHackingLevel(current);
  if (ns.getHackingLevel() < required) {
    single.connect('home');
    return;
  }
  if (!tryCrack(ns, current)) {
    ns.tprint(`Failed to crack ${current}`);
    single.connect('home');
    return;
  }
  await single.installBackdoor();
  if (single.joinFaction(faction)) ns.tprint(`Joined ${faction}`);
  else ns.tprint(`Couldn't join ${faction}`);
  single.connect('home');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stZmFjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5pbXBvcnQgeyB0cnlDcmFjayB9IGZyb20gJy4uL2NyYWNrJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1haW4obnM6IE5TKSB7XG4gIGxldCBkb25lID0gdHJ1ZTtcbiAgY29uc3QgZmFjdGlvbnMgPSBbXG4gICAgWydDeWJlclNlYycsICdDU0VDJ10sXG4gICAgWydOaXRlU2VjJywgJ2F2bW5pdGUtMDJoJ10sXG4gICAgWydUaGUgQmxhY2sgSGFuZCcsICdJLkkuSS5JJ10sXG4gICAgWydCaXRSdW5uZXJzJywgJ3J1bjR0aGVoMTExeiddLFxuICBdIGFzIGNvbnN0O1xuXG4gIGNvbnN0IHBsYXllciA9IG5zLmdldFBsYXllcigpO1xuICBmb3IgKGNvbnN0IFtmYWN0aW9uTmFtZSwgc2VydmVyTmFtZV0gb2YgZmFjdGlvbnMpIHtcbiAgICBpZiAoIXBsYXllci5mYWN0aW9ucy5pbmNsdWRlcyhmYWN0aW9uTmFtZSkpIHtcbiAgICAgIGRvbmUgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHBhdGggPSBmaW5kUGF0aChucywgc2VydmVyTmFtZSk7XG4gICAgICBpZiAocGF0aCkgYXdhaXQgam9pbkZhY3Rpb24obnMsIGZhY3Rpb25OYW1lLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICBpZiAoQm9vbGVhbihucy5hcmdzWzBdKSkgYXdhaXQgY2hlY2tEZW1vbihucyk7XG5cbiAgbnMud3JpdGVQb3J0KG5zLnBpZCwgZG9uZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrRGVtb24obnM6IE5TKSB7XG4gIGNvbnN0IHRhcmdldCA9ICd3MHIxZF9kNDNtMG4nO1xuICBjb25zdCBwYXRoID0gZmluZFBhdGgobnMsIHRhcmdldCk7XG4gIGlmICghcGF0aCkge1xuICAgIG5zLnRwcmludChgUGF0aCB0byAke3RhcmdldH0gbm90IGZvdW5kLmApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJlcXVpcmVkID0gbnMuZ2V0U2VydmVyUmVxdWlyZWRIYWNraW5nTGV2ZWwodGFyZ2V0KTtcbiAgaWYgKG5zLmdldEhhY2tpbmdMZXZlbCgpIDwgcmVxdWlyZWQpIHtcbiAgICBucy50cHJpbnQoYEhhY2tpbmcgbGV2ZWwgdG9vIGxvdyBmb3IgJHt0YXJnZXR9IChOZWVkZWQ6ICR7cmVxdWlyZWR9KWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghdHJ5Q3JhY2sobnMsIHRhcmdldCkpIHtcbiAgICBucy50cHJpbnQoYEZhaWxlZCB0byBjcmFjayAke3RhcmdldH1gKTtcbiAgICBucy5zaW5ndWxhcml0eS5jb25uZWN0KCdob21lJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yIChjb25zdCBub2RlIG9mIHBhdGgpIG5zLnNpbmd1bGFyaXR5LmNvbm5lY3Qobm9kZSk7XG4gIGF3YWl0IG5zLnNpbmd1bGFyaXR5Lmluc3RhbGxCYWNrZG9vcigpO1xuICBucy5zaW5ndWxhcml0eS5jb25uZWN0KCdob21lJyk7XG59XG5cbmZ1bmN0aW9uIGZpbmRQYXRoKG5zOiBOUywgdG86IHN0cmluZywgZnJvbTogc3RyaW5nID0gJ2hvbWUnKSB7XG4gIGlmIChmcm9tID09PSB0bykgcmV0dXJuIFt0b107XG5cbiAgY29uc3QgcXVldWU6IHN0cmluZ1tdID0gW2Zyb21dO1xuICBjb25zdCBwYXJlbnQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bGw+ID0geyBbZnJvbV06IG51bGwgfTtcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPihbZnJvbV0pO1xuXG4gIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICBjb25zdCBub2RlID0gcXVldWUuc2hpZnQoKSE7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBucy5zY2FuKG5vZGUpKSB7XG4gICAgICBpZiAoc2Vlbi5oYXMoY2hpbGQpKSBjb250aW51ZTtcbiAgICAgIHNlZW4uYWRkKGNoaWxkKTtcbiAgICAgIHBhcmVudFtjaGlsZF0gPSBub2RlO1xuICAgICAgaWYgKGNoaWxkID09PSB0bykge1xuICAgICAgICBjb25zdCBwYXRoOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgY3VyOiBzdHJpbmcgfCBudWxsID0gY2hpbGQ7XG4gICAgICAgIHdoaWxlIChjdXIgJiYgY3VyICE9PSBmcm9tKSB7XG4gICAgICAgICAgcGF0aC5wdXNoKGN1cik7XG4gICAgICAgICAgY3VyID0gcGFyZW50W2N1cl07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGgucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgICAgcXVldWUucHVzaChjaGlsZCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGpvaW5GYWN0aW9uKG5zOiBOUywgZmFjdGlvbjogc3RyaW5nLCBwYXRoOiBzdHJpbmdbXSkge1xuICBjb25zdCBzaW5nbGUgPSBucy5zaW5ndWxhcml0eTtcblxuICBmb3IgKGNvbnN0IG5vZGUgb2YgcGF0aCkgc2luZ2xlLmNvbm5lY3Qobm9kZSk7XG4gIGNvbnN0IGN1cnJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG5cbiAgY29uc3QgcmVxdWlyZWQgPSBucy5nZXRTZXJ2ZXJSZXF1aXJlZEhhY2tpbmdMZXZlbChjdXJyZW50KTtcbiAgaWYgKG5zLmdldEhhY2tpbmdMZXZlbCgpIDwgcmVxdWlyZWQpIHtcbiAgICBzaW5nbGUuY29ubmVjdCgnaG9tZScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghdHJ5Q3JhY2sobnMsIGN1cnJlbnQpKSB7XG4gICAgbnMudHByaW50KGBGYWlsZWQgdG8gY3JhY2sgJHtjdXJyZW50fWApO1xuICAgIHNpbmdsZS5jb25uZWN0KCdob21lJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXdhaXQgc2luZ2xlLmluc3RhbGxCYWNrZG9vcigpO1xuICBpZiAoc2luZ2xlLmpvaW5GYWN0aW9uKGZhY3Rpb24pKSBucy50cHJpbnQoYEpvaW5lZCAke2ZhY3Rpb259YCk7XG4gIGVsc2UgbnMudHByaW50KGBDb3VsZG4ndCBqb2luICR7ZmFjdGlvbn1gKTtcblxuICBzaW5nbGUuY29ubmVjdCgnaG9tZScpO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLGdCQUFnQjtBQUV6QixzQkFBc0IsS0FBSyxJQUFRO0FBQ2pDLE1BQUksT0FBTztBQUNYLFFBQU0sV0FBVztBQUFBLElBQ2YsQ0FBQyxZQUFZLE1BQU07QUFBQSxJQUNuQixDQUFDLFdBQVcsYUFBYTtBQUFBLElBQ3pCLENBQUMsa0JBQWtCLFNBQVM7QUFBQSxJQUM1QixDQUFDLGNBQWMsY0FBYztBQUFBLEVBQy9CO0FBRUEsUUFBTSxTQUFTLEdBQUcsVUFBVTtBQUM1QixhQUFXLENBQUMsYUFBYSxVQUFVLEtBQUssVUFBVTtBQUNoRCxRQUFJLENBQUMsT0FBTyxTQUFTLFNBQVMsV0FBVyxHQUFHO0FBQzFDLGFBQU87QUFDUCxZQUFNLE9BQU8sU0FBUyxJQUFJLFVBQVU7QUFDcEMsVUFBSTtBQUFNLGNBQU0sWUFBWSxJQUFJLGFBQWEsSUFBSTtBQUFBLElBQ25EO0FBQUEsRUFDRjtBQUVBLE1BQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQUcsVUFBTSxXQUFXLEVBQUU7QUFFNUMsS0FBRyxVQUFVLEdBQUcsS0FBSyxJQUFJO0FBQzNCO0FBRUEsZUFBZSxXQUFXLElBQVE7QUFDaEMsUUFBTSxTQUFTO0FBQ2YsUUFBTSxPQUFPLFNBQVMsSUFBSSxNQUFNO0FBQ2hDLE1BQUksQ0FBQyxNQUFNO0FBQ1QsT0FBRyxPQUFPLFdBQVcsTUFBTSxhQUFhO0FBQ3hDO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxHQUFHLDhCQUE4QixNQUFNO0FBQ3hELE1BQUksR0FBRyxnQkFBZ0IsSUFBSSxVQUFVO0FBQ25DLE9BQUcsT0FBTyw2QkFBNkIsTUFBTSxhQUFhLFFBQVEsR0FBRztBQUNyRTtBQUFBLEVBQ0Y7QUFFQSxNQUFJLENBQUMsU0FBUyxJQUFJLE1BQU0sR0FBRztBQUN6QixPQUFHLE9BQU8sbUJBQW1CLE1BQU0sRUFBRTtBQUNyQyxPQUFHLFlBQVksUUFBUSxNQUFNO0FBQzdCO0FBQUEsRUFDRjtBQUVBLGFBQVcsUUFBUTtBQUFNLE9BQUcsWUFBWSxRQUFRLElBQUk7QUFDcEQsUUFBTSxHQUFHLFlBQVksZ0JBQWdCO0FBQ3JDLEtBQUcsWUFBWSxRQUFRLE1BQU07QUFDL0I7QUFFQSxTQUFTLFNBQVMsSUFBUSxJQUFZLE9BQWUsUUFBUTtBQUMzRCxNQUFJLFNBQVM7QUFBSSxXQUFPLENBQUMsRUFBRTtBQUUzQixRQUFNLFFBQWtCLENBQUMsSUFBSTtBQUM3QixRQUFNLFNBQXdDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSztBQUM3RCxRQUFNLE9BQU8sb0JBQUksSUFBWSxDQUFDLElBQUksQ0FBQztBQUVuQyxTQUFPLE1BQU0sUUFBUTtBQUNuQixVQUFNLE9BQU8sTUFBTSxNQUFNO0FBQ3pCLGVBQVcsU0FBUyxHQUFHLEtBQUssSUFBSSxHQUFHO0FBQ2pDLFVBQUksS0FBSyxJQUFJLEtBQUs7QUFBRztBQUNyQixXQUFLLElBQUksS0FBSztBQUNkLGFBQU8sS0FBSyxJQUFJO0FBQ2hCLFVBQUksVUFBVSxJQUFJO0FBQ2hCLGNBQU0sT0FBaUIsQ0FBQztBQUN4QixZQUFJLE1BQXFCO0FBQ3pCLGVBQU8sT0FBTyxRQUFRLE1BQU07QUFDMUIsZUFBSyxLQUFLLEdBQUc7QUFDYixnQkFBTSxPQUFPLEdBQUc7QUFBQSxRQUNsQjtBQUNBLGVBQU8sS0FBSyxRQUFRO0FBQUEsTUFDdEI7QUFDQSxZQUFNLEtBQUssS0FBSztBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDtBQUVBLGVBQWUsWUFBWSxJQUFRLFNBQWlCLE1BQWdCO0FBQ2xFLFFBQU0sU0FBUyxHQUFHO0FBRWxCLGFBQVcsUUFBUTtBQUFNLFdBQU8sUUFBUSxJQUFJO0FBQzVDLFFBQU0sVUFBVSxLQUFLLEtBQUssU0FBUyxDQUFDO0FBRXBDLFFBQU0sV0FBVyxHQUFHLDhCQUE4QixPQUFPO0FBQ3pELE1BQUksR0FBRyxnQkFBZ0IsSUFBSSxVQUFVO0FBQ25DLFdBQU8sUUFBUSxNQUFNO0FBQ3JCO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxTQUFTLElBQUksT0FBTyxHQUFHO0FBQzFCLE9BQUcsT0FBTyxtQkFBbUIsT0FBTyxFQUFFO0FBQ3RDLFdBQU8sUUFBUSxNQUFNO0FBQ3JCO0FBQUEsRUFDRjtBQUVBLFFBQU0sT0FBTyxnQkFBZ0I7QUFDN0IsTUFBSSxPQUFPLFlBQVksT0FBTztBQUFHLE9BQUcsT0FBTyxVQUFVLE9BQU8sRUFBRTtBQUFBO0FBQ3pELE9BQUcsT0FBTyxpQkFBaUIsT0FBTyxFQUFFO0FBRXpDLFNBQU8sUUFBUSxNQUFNO0FBQ3ZCOyIsIm5hbWVzIjpbXX0=

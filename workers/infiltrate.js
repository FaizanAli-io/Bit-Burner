import { tryCrack } from '/crack.js';
export function main(ns) {
  new Infiltrator(ns).infiltrate();
}
export class Infiltrator {
  ns;
  done = false;
  constructor(ns) {
    this.ns = ns;
  }
  infiltrate() {
    this.writeServerList(this.ns);
    this.crackServerList(this.ns);
    this.ns.writePort(this.ns.pid, this.done);
  }
  writeServerList(ns) {
    const servers = this.buildServerList(ns, 'home', {});
    const serverNames = Object.keys(servers)
      .filter((x) => x !== 'home' && !x.startsWith('myserver'))
      .sort()
      .sort((a, b) => servers[a].maxRam - servers[b].maxRam);
    ns.write('lists/servers.txt', serverNames.join('\n'), 'w');
  }
  crackServerList(ns) {
    const broken = [];
    for (const server of ns.read('./lists/servers.txt').split('\n')) {
      if (server && (ns.hasRootAccess(server) || tryCrack(ns, server))) {
        broken.push(server);
      }
    }
    ns.write('lists/broken.txt', broken.join('\n'), 'w');
    this.done = ns.fileExists('SQLInject.exe');
  }
  buildServerList(ns, root, nodeList) {
    for (const node of ns.scan(root)) {
      if (!nodeList[node]) {
        nodeList[node] = ns.getServer(node);
        this.buildServerList(ns, node, nodeList);
      }
    }
    return nodeList;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZmlsdHJhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5pbXBvcnQgeyB0cnlDcmFjayB9IGZyb20gJy4uL2NyYWNrJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4obnM6IE5TKSB7XG4gIG5ldyBJbmZpbHRyYXRvcihucykuaW5maWx0cmF0ZSgpO1xufVxuXG5leHBvcnQgY2xhc3MgSW5maWx0cmF0b3Ige1xuICBuczogTlM7XG4gIGRvbmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihuczogTlMpIHtcbiAgICB0aGlzLm5zID0gbnM7XG4gIH1cblxuICBpbmZpbHRyYXRlKCkge1xuICAgIHRoaXMud3JpdGVTZXJ2ZXJMaXN0KHRoaXMubnMpO1xuICAgIHRoaXMuY3JhY2tTZXJ2ZXJMaXN0KHRoaXMubnMpO1xuXG4gICAgdGhpcy5ucy53cml0ZVBvcnQodGhpcy5ucy5waWQsIHRoaXMuZG9uZSk7XG4gIH1cblxuICB3cml0ZVNlcnZlckxpc3QobnM6IE5TKSB7XG4gICAgY29uc3Qgc2VydmVycyA9IHRoaXMuYnVpbGRTZXJ2ZXJMaXN0KG5zLCAnaG9tZScsIHt9KTtcbiAgICBjb25zdCBzZXJ2ZXJOYW1lcyA9IE9iamVjdC5rZXlzKHNlcnZlcnMpXG4gICAgICAuZmlsdGVyKCh4KSA9PiB4ICE9PSAnaG9tZScgJiYgIXguc3RhcnRzV2l0aCgnbXlzZXJ2ZXInKSlcbiAgICAgIC5zb3J0KClcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBzZXJ2ZXJzW2FdLm1heFJhbSAtIHNlcnZlcnNbYl0ubWF4UmFtKTtcblxuICAgIG5zLndyaXRlKCdsaXN0cy9zZXJ2ZXJzLnR4dCcsIHNlcnZlck5hbWVzLmpvaW4oJ1xcbicpLCAndycpO1xuICB9XG5cbiAgY3JhY2tTZXJ2ZXJMaXN0KG5zOiBOUykge1xuICAgIGNvbnN0IGJyb2tlbiA9IFtdO1xuICAgIGZvciAoY29uc3Qgc2VydmVyIG9mIG5zLnJlYWQoJy4vbGlzdHMvc2VydmVycy50eHQnKS5zcGxpdCgnXFxuJykpIHtcbiAgICAgIGlmIChzZXJ2ZXIgJiYgKG5zLmhhc1Jvb3RBY2Nlc3Moc2VydmVyKSB8fCB0cnlDcmFjayhucywgc2VydmVyKSkpIHtcbiAgICAgICAgYnJva2VuLnB1c2goc2VydmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBucy53cml0ZSgnbGlzdHMvYnJva2VuLnR4dCcsIGJyb2tlbi5qb2luKCdcXG4nKSwgJ3cnKTtcbiAgICB0aGlzLmRvbmUgPSBucy5maWxlRXhpc3RzKCdTUUxJbmplY3QuZXhlJyk7XG4gIH1cblxuICBidWlsZFNlcnZlckxpc3QobnM6IE5TLCByb290OiBzdHJpbmcsIG5vZGVMaXN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5zLnNjYW4ocm9vdCkpIHtcbiAgICAgIGlmICghbm9kZUxpc3Rbbm9kZV0pIHtcbiAgICAgICAgbm9kZUxpc3Rbbm9kZV0gPSBucy5nZXRTZXJ2ZXIobm9kZSk7XG4gICAgICAgIHRoaXMuYnVpbGRTZXJ2ZXJMaXN0KG5zLCBub2RlLCBub2RlTGlzdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlTGlzdDtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLGdCQUFnQjtBQUVsQixnQkFBUyxLQUFLLElBQVE7QUFDM0IsTUFBSSxZQUFZLEVBQUUsRUFBRSxXQUFXO0FBQ2pDO0FBRU8sYUFBTSxZQUFZO0FBQUEsRUFDdkI7QUFBQSxFQUNBLE9BQWdCO0FBQUEsRUFFaEIsWUFBWSxJQUFRO0FBQ2xCLFNBQUssS0FBSztBQUFBLEVBQ1o7QUFBQSxFQUVBLGFBQWE7QUFDWCxTQUFLLGdCQUFnQixLQUFLLEVBQUU7QUFDNUIsU0FBSyxnQkFBZ0IsS0FBSyxFQUFFO0FBRTVCLFNBQUssR0FBRyxVQUFVLEtBQUssR0FBRyxLQUFLLEtBQUssSUFBSTtBQUFBLEVBQzFDO0FBQUEsRUFFQSxnQkFBZ0IsSUFBUTtBQUN0QixVQUFNLFVBQVUsS0FBSyxnQkFBZ0IsSUFBSSxRQUFRLENBQUMsQ0FBQztBQUNuRCxVQUFNLGNBQWMsT0FBTyxLQUFLLE9BQU8sRUFDcEMsT0FBTyxDQUFDLE1BQU0sTUFBTSxVQUFVLENBQUMsRUFBRSxXQUFXLFVBQVUsQ0FBQyxFQUN2RCxLQUFLLEVBQ0wsS0FBSyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsRUFBRSxTQUFTLFFBQVEsQ0FBQyxFQUFFLE1BQU07QUFFdkQsT0FBRyxNQUFNLHFCQUFxQixZQUFZLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxFQUMzRDtBQUFBLEVBRUEsZ0JBQWdCLElBQVE7QUFDdEIsVUFBTSxTQUFTLENBQUM7QUFDaEIsZUFBVyxVQUFVLEdBQUcsS0FBSyxxQkFBcUIsRUFBRSxNQUFNLElBQUksR0FBRztBQUMvRCxVQUFJLFdBQVcsR0FBRyxjQUFjLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxJQUFJO0FBQ2hFLGVBQU8sS0FBSyxNQUFNO0FBQUEsTUFDcEI7QUFBQSxJQUNGO0FBRUEsT0FBRyxNQUFNLG9CQUFvQixPQUFPLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFDbkQsU0FBSyxPQUFPLEdBQUcsV0FBVyxlQUFlO0FBQUEsRUFDM0M7QUFBQSxFQUVBLGdCQUFnQixJQUFRLE1BQWMsVUFBK0I7QUFDbkUsZUFBVyxRQUFRLEdBQUcsS0FBSyxJQUFJLEdBQUc7QUFDaEMsVUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHO0FBQ25CLGlCQUFTLElBQUksSUFBSSxHQUFHLFVBQVUsSUFBSTtBQUNsQyxhQUFLLGdCQUFnQixJQUFJLE1BQU0sUUFBUTtBQUFBLE1BQ3pDO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0Y7IiwibmFtZXMiOltdfQ==

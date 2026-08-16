export async function main(ns) {
  const file = './lists/broken.txt';
  const servers = ns
    .read(file)
    .split('\n')
    .filter((x) => x)
    .concat(ns.cloud.getServerNames());
  servers.forEach((server) => ns.killall(server));
  ns.ui.clearTerminal();
  ns.killall();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3AudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTlMgfSBmcm9tICdAbnMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbihuczogTlMpIHtcbiAgY29uc3QgZmlsZSA9ICcuL2xpc3RzL2Jyb2tlbi50eHQnO1xuICBjb25zdCBzZXJ2ZXJzID0gbnNcbiAgICAucmVhZChmaWxlKVxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAuZmlsdGVyKCh4KSA9PiB4KVxuICAgIC5jb25jYXQobnMuZ2V0UHVyY2hhc2VkU2VydmVycygpKTtcblxuICBzZXJ2ZXJzLmZvckVhY2goKHNlcnZlcikgPT4gbnMua2lsbGFsbChzZXJ2ZXIpKTtcbiAgbnMudWkuY2xlYXJUZXJtaW5hbCgpO1xuICBucy5raWxsYWxsKCk7XG59XG4iXSwibWFwcGluZ3MiOiJBQUVBLHNCQUFzQixLQUFLLElBQVE7QUFDakMsUUFBTSxPQUFPO0FBQ2IsUUFBTSxVQUFVLEdBQ2IsS0FBSyxJQUFJLEVBQ1QsTUFBTSxJQUFJLEVBQ1YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUNmLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQztBQUVsQyxVQUFRLFFBQVEsQ0FBQyxXQUFXLEdBQUcsUUFBUSxNQUFNLENBQUM7QUFDOUMsS0FBRyxHQUFHLGNBQWM7QUFDcEIsS0FBRyxRQUFRO0FBQ2I7IiwibmFtZXMiOltdfQ==

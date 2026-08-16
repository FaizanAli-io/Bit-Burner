export async function main(ns) {
  ns.atExit(() => ns.ui.closeTail());
  const duration = Number(ns.args[0]);
  const start = performance.now();
  ns.ui.openTail();
  ns.disableLog('ALL');
  ns.ui.moveTail(800, 380);
  ns.ui.resizeTail(320, 70);
  const size = 40;
  let elapsed, space;
  do {
    ns.clearLog();
    elapsed = performance.now() - start;
    space = Math.min(Math.round(size * (elapsed / duration)), size);
    try {
      ns.print(`[${'-'.repeat(space)}${' '.repeat(size - space)}]`);
      ns.print(`${ns.format.time(elapsed)} / ${ns.format.time(duration)}`);
    } catch (error) {
      ns.tprint(error, ' ', space);
      break;
    }
    await ns.sleep(512);
  } while (elapsed < duration);
  ns.ui.closeTail();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5TIH0gZnJvbSAnQG5zJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1haW4obnM6IE5TKSB7XG4gIG5zLmF0RXhpdCgoKSA9PiBucy51aS5jbG9zZVRhaWwoKSk7XG5cbiAgY29uc3QgZHVyYXRpb24gPSBOdW1iZXIobnMuYXJnc1swXSk7XG4gIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgbnMudWkub3BlblRhaWwoKTtcbiAgbnMuZGlzYWJsZUxvZygnQUxMJyk7XG4gIG5zLnVpLm1vdmVUYWlsKDgwMCwgMzgwKTtcbiAgbnMudWkucmVzaXplVGFpbCgzMjAsIDcwKTtcblxuICBjb25zdCBzaXplID0gNDA7XG4gIGxldCBlbGFwc2VkLCBzcGFjZTtcblxuICBkbyB7XG4gICAgbnMuY2xlYXJMb2coKTtcbiAgICBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydDtcbiAgICBzcGFjZSA9IE1hdGgubWluKE1hdGgucm91bmQoc2l6ZSAqIChlbGFwc2VkIC8gZHVyYXRpb24pKSwgc2l6ZSk7XG5cbiAgICB0cnkge1xuICAgICAgbnMucHJpbnQoYFskeyctJy5yZXBlYXQoc3BhY2UpfSR7JyAnLnJlcGVhdChzaXplIC0gc3BhY2UpfV1gKTtcbiAgICAgIG5zLnByaW50KGAke25zLnRGb3JtYXQoZWxhcHNlZCl9IC8gJHtucy50Rm9ybWF0KGR1cmF0aW9uKX1gKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbnMudHByaW50KGVycm9yLCAnICcsIHNwYWNlKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGF3YWl0IG5zLnNsZWVwKDUxMik7XG4gIH0gd2hpbGUgKGVsYXBzZWQgPCBkdXJhdGlvbik7XG5cbiAgbnMudWkuY2xvc2VUYWlsKCk7XG59XG4iXSwibWFwcGluZ3MiOiJBQUVBLHNCQUFzQixLQUFLLElBQVE7QUFDakMsS0FBRyxPQUFPLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQztBQUVqQyxRQUFNLFdBQVcsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLFFBQU0sUUFBUSxZQUFZLElBQUk7QUFFOUIsS0FBRyxHQUFHLFNBQVM7QUFDZixLQUFHLFdBQVcsS0FBSztBQUNuQixLQUFHLEdBQUcsU0FBUyxLQUFLLEdBQUc7QUFDdkIsS0FBRyxHQUFHLFdBQVcsS0FBSyxFQUFFO0FBRXhCLFFBQU0sT0FBTztBQUNiLE1BQUksU0FBUztBQUViLEtBQUc7QUFDRCxPQUFHLFNBQVM7QUFDWixjQUFVLFlBQVksSUFBSSxJQUFJO0FBQzlCLFlBQVEsS0FBSyxJQUFJLEtBQUssTUFBTSxRQUFRLFVBQVUsU0FBUyxHQUFHLElBQUk7QUFFOUQsUUFBSTtBQUNGLFNBQUcsTUFBTSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsR0FBRyxJQUFJLE9BQU8sT0FBTyxLQUFLLENBQUMsR0FBRztBQUM1RCxTQUFHLE1BQU0sR0FBRyxHQUFHLFFBQVEsT0FBTyxDQUFDLE1BQU0sR0FBRyxRQUFRLFFBQVEsQ0FBQyxFQUFFO0FBQUEsSUFDN0QsU0FBUyxPQUFPO0FBQ2QsU0FBRyxPQUFPLE9BQU8sS0FBSyxLQUFLO0FBQzNCO0FBQUEsSUFDRjtBQUVBLFVBQU0sR0FBRyxNQUFNLEdBQUc7QUFBQSxFQUNwQixTQUFTLFVBQVU7QUFFbkIsS0FBRyxHQUFHLFVBQVU7QUFDbEI7IiwibmFtZXMiOltdfQ==

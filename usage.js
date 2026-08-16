export async function main(ns) {
  const files = ns.ls('home', '.js');
  const ramUsages = [];
  for (const file of files) {
    const ram = ns.getScriptRam(file, 'home');
    if (ram > 0) ramUsages.push({ file, ram });
  }
  ramUsages.sort((a, b) => b.ram - a.ram);
  for (const { file, ram } of ramUsages) {
    ns.tprintf('%-30s %.2f GB', file, ram);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5TIH0gZnJvbSAnQG5zJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKG5zOiBOUykge1xyXG4gIGNvbnN0IGZpbGVzID0gbnMubHMoJ2hvbWUnLCAnLmpzJyk7XHJcblxyXG4gIGNvbnN0IHJhbVVzYWdlcyA9IFtdO1xyXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgY29uc3QgcmFtID0gbnMuZ2V0U2NyaXB0UmFtKGZpbGUsICdob21lJyk7XHJcbiAgICBpZiAocmFtID4gMCkgcmFtVXNhZ2VzLnB1c2goeyBmaWxlLCByYW0gfSk7XHJcbiAgfVxyXG5cclxuICByYW1Vc2FnZXMuc29ydCgoYSwgYikgPT4gYi5yYW0gLSBhLnJhbSk7XHJcbiAgZm9yIChjb25zdCB7IGZpbGUsIHJhbSB9IG9mIHJhbVVzYWdlcykge1xyXG4gICAgbnMudHByaW50ZignJS0zMHMgJS4yZiBHQicsIGZpbGUsIHJhbSk7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6IkFBRUEsc0JBQXNCLEtBQUssSUFBUTtBQUNqQyxRQUFNLFFBQVEsR0FBRyxHQUFHLFFBQVEsS0FBSztBQUVqQyxRQUFNLFlBQVksQ0FBQztBQUNuQixhQUFXLFFBQVEsT0FBTztBQUN4QixVQUFNLE1BQU0sR0FBRyxhQUFhLE1BQU0sTUFBTTtBQUN4QyxRQUFJLE1BQU07QUFBRyxnQkFBVSxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFBQSxFQUMzQztBQUVBLFlBQVUsS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHO0FBQ3RDLGFBQVcsRUFBRSxNQUFNLElBQUksS0FBSyxXQUFXO0FBQ3JDLE9BQUcsUUFBUSxpQkFBaUIsTUFBTSxHQUFHO0FBQUEsRUFDdkM7QUFDRjsiLCJuYW1lcyI6W119

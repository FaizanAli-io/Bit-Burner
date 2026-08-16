const { readFileSync, writeFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');

const files = execFileSync('rg', ['--files', '-g', '*.js'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const sourceMapLine = /^\/\/#[ \t]+sourceMappingURL=data:application\/json;base64,.*(?:\r?\n|$)$/gm;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const cleaned = original.replace(sourceMapLine, '');
  if (cleaned !== original) writeFileSync(file, cleaned);
}

console.log(`Processed ${files.length} JavaScript files.`);

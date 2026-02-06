const fs = require('fs');

const html = fs.readFileSync('icon.html', 'utf8');

const icons = [...html.matchAll(/<span class="mls">\s*([^<]+)\s*<\/span>/g)]
  .map(m => m[1].trim());

fs.writeFileSync('icons-origin.txt', icons.join('\n'));
fs.writeFileSync('icons-sort.txt', icons.sort().join('\n'));

console.log(`✔ Extracted ${icons.length} icons`);

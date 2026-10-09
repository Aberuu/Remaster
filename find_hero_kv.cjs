const fs = require('fs');
const html = fs.readFileSync('wild_raw.html', 'utf8');

// Find script or references to hero-kv
const idx = html.indexOf('hero-kv');
console.log('Found hero-kv at index:', idx);

// Search for hero-kv occurrences
const regex = /hero-kv[\s\S]{0,300}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('--- MATCH ---');
  console.log(m[0]);
}

// Find inline scripts or external scripts
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
console.log('Inline scripts count:', scripts.length);
scripts.forEach((s, i) => {
  if (s.includes('hero-kv') || s.includes('canvas') || s.includes('pixel')) {
    console.log(`Script ${i} mentions hero-kv/canvas:`, s.slice(0, 300));
    fs.writeFileSync(`wild_script_${i}.js`, s);
  }
});

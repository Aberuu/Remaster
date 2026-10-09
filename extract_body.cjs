const fs = require('fs');
const html = fs.readFileSync('hellohello_raw.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  fs.writeFileSync('hellohello_body.html', bodyMatch[1]);
  console.log('Saved body, length:', bodyMatch[1].length);
}

// Find all script bundles
const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Scripts:', scripts);

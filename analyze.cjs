const fs = require('fs');
const html = fs.readFileSync('hellohello_raw.html', 'utf8');

// Find links, scripts, framework
console.log('--- FRAMEWORK DETECTION ---');
if (html.includes('webflow')) console.log('Uses Webflow');
if (html.includes('__NEXT_DATA__')) console.log('Uses Next.js');
if (html.includes('framer')) console.log('Uses Framer');

// Look for CSS files
const cssRegex = /href=["']([^"']+\.css[^"']*)["']/g;
let m;
const cssFiles = [];
while ((m = cssRegex.exec(html)) !== null) {
  cssFiles.push(m[1]);
}
console.log('CSS Files:', cssFiles);

// Look for styles or key classes
const classRegex = /class=["']([^"']+)["']/g;
const classes = new Set();
while ((m = classRegex.exec(html)) !== null) {
  m[1].split(/\s+/).forEach(c => classes.add(c));
}
console.log('Total unique classes:', classes.size);
console.log('Sample classes:', [...classes].slice(0, 40));

// Search for red colors or color styles in inline CSS
const styleTags = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
console.log('Inline style tags count:', styleTags.length);
fs.writeFileSync('inline_styles.css', styleTags.join('\n\n'));

// Check for mentions of red / colors / animations
console.log('Mentions of #ff or #e or rgb in html:');
const colors = [...new Set(html.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)|oklch\([^)]+\)/g) || [])];
console.log('Sample colors:', colors.slice(0, 30));

const fs = require('fs');
const html = fs.readFileSync('wild_raw.html', 'utf8');

// Find all css rules for hero, hhead, hgrid, pxctl
const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
const allCss = styleMatches.join('\n');
fs.writeFileSync('wild_styles.css', allCss);

const rules = [
  'hero-kv',
  '\\.hero\\b',
  '\\.hhead\\b',
  '\\.hgrid\\b',
  '\\.hl\\b',
  '\\.hcol\\b',
  '\\.hdesc\\b',
  '\\.hfoot\\b',
  '\\.htag\\b',
  '\\.pxctl\\b',
  '--gutter',
  '--cell',
  '--red'
];

rules.forEach(r => {
  const m = allCss.match(new RegExp(`[^}{]*${r}[^}{]*\\{[^}]*\\}`, 'gi'));
  if (m) {
    console.log(`--- MATCHES FOR ${r} ---`);
    console.log(m.slice(0, 5).join('\n'));
  }
});

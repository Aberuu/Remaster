const fs = require('fs');
const html = fs.readFileSync('wild_raw.html', 'utf8');

const idx = html.indexOf('id="hero"') !== -1 ? html.indexOf('id="hero"') : html.indexOf('class="hero"');
console.log('Hero position:', idx);
if (idx !== -1) {
  console.log(html.slice(Math.max(0, idx - 300), idx + 2500));
}

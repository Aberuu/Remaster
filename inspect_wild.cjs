const fs = require('fs');

fetch('https://craft.wild.as')
  .then(r => r.text())
  .then(html => {
    fs.writeFileSync('wild_raw.html', html);
    console.log('Saved wild_raw.html, length:', html.length);
    
    // Find canvas tags
    const canvas = html.match(/<canvas[^>]*>/gi);
    console.log('Canvases:', canvas);
    
    // Check main headings and texts
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log('H1:', h1s);

    const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log('H2:', h2s);

    // Look for marquee or wave keywords
    const matches = html.match(/(wave|marquee|pixel|canvas|grid)/gi);
    console.log('Keyword counts:', matches ? matches.length : 0);
  })
  .catch(err => console.error(err));

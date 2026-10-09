const fs = require('fs');
const html = fs.readFileSync('hellohello_raw.html', 'utf8');

// Extract __NEXT_DATA__
const nextDataMatch = html.match(/<script id=\"__NEXT_DATA__\" type=\"application\/json\">([\s\S]*?)<\/script>/);
if (nextDataMatch) {
  const nextData = JSON.parse(nextDataMatch[1]);
  fs.writeFileSync('hellohello_nextdata.json', JSON.stringify(nextData, null, 2));
  console.log('Saved __NEXT_DATA__ to hellohello_nextdata.json');
  console.log('Page props keys:', Object.keys(nextData.props?.pageProps || {}));
} else {
  console.log('No __NEXT_DATA__ found');
}

// Extract main HTML body inside <div id="__next">
const bodyMatch = html.match(/<div id=\"__next\">([\s\S]*?)<\/div>\s*<script/);
if (bodyMatch) {
  fs.writeFileSync('hellohello_body.html', bodyMatch[1]);
  console.log('Saved body to hellohello_body.html, length:', bodyMatch[1].length);
}

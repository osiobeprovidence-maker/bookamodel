const sourceMap = require('source-map');
const fs = require('fs');
const path = require('path');

async function main() {
  const smFile = path.join(__dirname, '..', 'dist', 'assets', 'index-NSjJnWqu.js.map');
  const jsFile = path.join(__dirname, '..', 'dist', 'assets', 'index-NSjJnWqu.js');
  const rawMap = JSON.parse(fs.readFileSync(smFile, 'utf8'));
  const js = fs.readFileSync(jsFile, 'utf8');

  // Find all 'new ' followed by identifier in the minified bundle
  const newPattern = /new\s+([a-zA-Z_$][a-zA-Z0-9_$.]*)/g;
  const matches = [];
  let match;
  while ((match = newPattern.exec(js)) !== null) {
    if (match[1].startsWith('Error') || match[1] === 'Promise' || match[1] === 'Array' || match[1] === 'Map' || match[1] === 'Set' || match[1] === 'WeakMap' || match[1] === 'Date' || match[1] === 'RegExp' || match[1] === 'AbortController' || match[1] === 'URL' || match[1] === 'URLSearchParams' || match[1] === 'TextDecoder' || match[1] === 'TextEncoder' || match[1] === 'FormData' || match[1] === 'Image' || match[1] === 'Event' || match[1] === 'CustomEvent' || match[1] === 'WebSocket' || match[1] === 'Worker') continue;
    
    // Get position in bundle
    const pos = match.index;
    // Convert to line/column
    const beforeMatch = js.substring(0, pos);
    const line = beforeMatch.split('\n').length;
    const lastNewline = beforeMatch.lastIndexOf('\n');
    const col = pos - lastNewline - 1;
    
    matches.push({ constructor: match[1], line, col, pos });
  }

  await sourceMap.SourceMapConsumer.with(rawMap, null, (consumer) => {
    for (const m of matches) {
      const pos = consumer.originalPositionFor({ line: m.line, column: m.col });
      if (pos.source && pos.source.includes('node_modules')) continue;
      console.log(`new ${m.constructor} at bundle:${m.line}:${m.col} -> ${pos.source || 'unknown'}:${pos.line || '?'}:${pos.column || '?'}`);
    }
  });
}

main().catch(console.error);

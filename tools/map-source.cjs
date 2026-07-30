const sourceMap = require('source-map');
const fs = require('fs');
const path = require('path');

async function main() {
  const line = parseInt(process.argv[2]) || 48;
  const col = parseInt(process.argv[3]) || 48295;
  
  const smFile = path.join(__dirname, '..', 'dist', 'assets', 'index-NSjJnWqu.js.map');
  const rawMap = JSON.parse(fs.readFileSync(smFile, 'utf8'));
  
  await sourceMap.SourceMapConsumer.with(rawMap, null, (consumer) => {
    const pos = consumer.originalPositionFor({ line, column: col });
    console.log(`Line ${line}, Col ${col} ->`);
    console.log(`  Source: ${pos.source}`);
    console.log(`  Line: ${pos.line}`);
    console.log(`  Column: ${pos.column}`);
    console.log(`  Name: ${pos.name}`);
    
    // Get the surrounding lines from original source
    if (pos.source && pos.line) {
      const sourceContent = consumer.sourceContentFor(pos.source);
      if (sourceContent) {
        const lines = sourceContent.split('\n');
        const start = Math.max(0, pos.line - 3);
        const end = Math.min(lines.length, pos.line + 2);
        for (let i = start; i < end; i++) {
          const marker = i === pos.line - 1 ? '>>>' : '   ';
          console.log(`${marker} ${i + 1}: ${lines[i]}`);
        }
      }
    }
  });
}

main().catch(console.error);

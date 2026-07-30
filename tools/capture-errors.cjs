const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9555;
const USER_DATA_DIR = `C:\\Users\\USER\\AppData\\Local\\Temp\\chrome-err-${Date.now()}`;

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    ws.send(JSON.stringify({ id, method, params }));
    const handler = (data) => {
      const resp = JSON.parse(data.toString());
      if (resp.id === id) {
        ws.removeListener('message', handler);
        resolve(resp);
      }
    };
    ws.on('message', handler);
    setTimeout(() => reject(new Error('Timeout for ' + method)), 20000);
  });
}

async function main() {
  const URL = process.argv[2] || 'http://localhost:4173';
  const PORT = new URL(URL).port || 4173;

  console.log('Launching Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    '--disable-background-networking',
    '--window-size=1280,900',
    'about:blank'
  ], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 5000));

  console.log('Fetching CDP target...');
  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
  const t = targets.find(t => t.url === 'about:blank') || targets[0];
  const wsUrl = t.webSocketDebuggerUrl;

  const ws = new (require('ws'))(wsUrl);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
    setTimeout(() => reject(new Error('WS timeout')), 10000);
  });

  console.log('Connected. Enabling...');
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Console.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Debugger.enable');
  await sendCDP(ws, 'Debugger.setPauseOnExceptions', { state: 'all' });

  // Collect all console messages
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (!msg.method) return;

      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        console.log('\n========== EXCEPTION THROWN ==========');
        console.log(`Error: ${d.text} ${d.exception?.description?.split('\n')[0] || ''}`);
        if (d.stackTrace) {
          for (const f of d.stackTrace.callFrames || []) {
            console.log(`  at ${f.functionName || '(anon)'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
          }
        }
        console.log('======================================\n');
      }

      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = msg.params.args.map(a => a.value !== undefined ? a.value : a.description || JSON.stringify(a)).join(' ');
        if (msg.params.type === 'error' || msg.params.type === 'warning') {
          console.log(`[${msg.params.type.toUpperCase()}] ${args}`);
          if (msg.params.stackTrace) {
            for (const f of msg.params.stackTrace.callFrames || []) {
              console.log(`  at ${f.functionName || '(anon)'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
            }
          }
        }
      }
    } catch(e) {}
  });

  console.log('Navigating to', URL);
  await sendCDP(ws, 'Page.navigate', { url: URL });
  await new Promise(r => setTimeout(r, 15000));

  console.log('Checking for paused debugger (exceptions)...');
  // If the debugger paused on exception, resume and log
  try {
    await sendCDP(ws, 'Debugger.resume');
  } catch(e) {}

  await new Promise(r => setTimeout(r, 2000));
  console.log('\n=== Done ===');
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

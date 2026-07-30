const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9444;
const URL = process.argv[2] || 'http://localhost:4173';
const USER_DATA_DIR = `C:\\Users\\USER\\AppData\\Local\\Temp\\chrome-prod-${Date.now()}`;

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
    setTimeout(() => reject(new Error('Timeout for ' + method)), 15000);
  });
}

async function main() {
  console.log('Starting Vite preview server...');
  const preview = spawn('npx', ['vite', 'preview', '--port=4173', '--host=0.0.0.0'], {
    stdio: 'ignore',
    cwd: 'C:\\Users\\USER\\OneDrive\\Desktop\\BOOKAMODEL'
  });
  await new Promise(r => setTimeout(r, 5000));

  console.log('Launching Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-sandbox', '--disable-gpu', '--no-first-run', '--disable-extensions',
    URL
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 8000));

  console.log('Connecting to CDP...');
  const wsUrl = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const target = targets.find(t => t.url && (t.url.includes('localhost') || t.url.includes('4173'))) || targets[0];
          if (target) resolve(target.webSocketDebuggerUrl);
          else reject(new Error('No targets. Got: ' + targets.length));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
    setTimeout(() => reject(new Error('WS timeout')), 10000);
  });

  console.log('Connected! Enabling domains...');
  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'Console.enable');
  await sendCDP(ws, 'Runtime.enable');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (!msg.method) return;

      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        console.log('\n========== EXCEPTION THROWN ==========');
        console.log(`Type: ${d.text}`);
        console.log(`Message: ${d.exception?.description?.split('\\n')[0] || ''}`);
        if (d.stackTrace) {
          for (const f of d.stackTrace.callFrames || []) {
            console.log(`  at ${f.functionName || '(anonymous)'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
          }
        }
        // Also log exception details
        if (d.exception) {
          console.log('Full exception:', JSON.stringify(d.exception, null, 2).slice(0, 2000));
        }
        console.log('======================================\n');
      }

      if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
        const args = msg.params.args.map(a => a.value !== undefined ? a.value : a.description || a.text || JSON.stringify(a)).join(' ');
        console.log(`[${msg.params.type.toUpperCase()}] ${args}`);
        if (msg.params.stackTrace) {
          for (const f of msg.params.stackTrace.callFrames || []) {
            console.log(`  at ${f.functionName || '(anonymous)'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
          }
        }
      }
    } catch (e) {}
  });

  console.log('Navigating to', URL);
  await sendCDP(ws, 'Page.navigate', { url: URL });
  await new Promise(r => setTimeout(r, 30000));

  console.log('\n=== Done ===');
  chrome.kill('SIGKILL');
  preview.kill('SIGKILL');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

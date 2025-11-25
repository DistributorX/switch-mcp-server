const { spawn } = require('child_process');
const server = spawn('node', ['dist/stdio.js']);
let msgId = 1;

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(l => l.trim());
  lines.forEach(line => {
    console.log('← Server:', line);
  });
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

function send(method, params) {
  const msg = { jsonrpc: "2.0", id: msgId++, method, params };
  console.log('→ Client:', JSON.stringify(msg));
  server.stdin.write(JSON.stringify(msg) + '\n');
}

function sendNotification(method, params) {
  const msg = { jsonrpc: "2.0", method, params };
  console.log('→ Client:', JSON.stringify(msg));
  server.stdin.write(JSON.stringify(msg) + '\n');
}

console.log('=== MCP Protocol Test ===\n');

// Test sequence
console.log('1. Initialize handshake');
send('initialize', {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "test-client", version: "1.0" }
});

setTimeout(() => {
  console.log('\n2. Send initialized notification');
  sendNotification('notifications/initialized');
}, 200);

setTimeout(() => {
  console.log('\n3. List resources');
  send('resources/list', {});
}, 400);

setTimeout(() => {
  console.log('\n4. Read a resource');
  send('resources/read', { uri: 'switch-docs://overview.md' });
}, 600);

setTimeout(() => {
  console.log('\n5. List tools');
  send('tools/list', {});
}, 800);

setTimeout(() => {
  console.log('\n6. Search via tool');
  send('tools/call', {
    name: 'search_docs',
    arguments: { query: 'FlowElement', limit: 3 }
  });
}, 1000);

setTimeout(() => {
  console.log('\n=== Test Complete ===');
  server.stdin.end();
  setTimeout(() => process.exit(0), 200);
}, 1500);

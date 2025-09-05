#!/usr/bin/env tsx

/**
 * Health Check Server for Railway
 * Simple HTTP server to check if consumers are running
 */

import http from 'http';

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'nextecom-consumers',
      uptime: process.uptime()
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>NextEcom RabbitMQ Consumers</h1>
          <p>Status: Running</p>
          <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
          <p>Health Check: <a href="/health">/health</a></p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🏥 Health check server running on port ${PORT}`);
});

export default server;

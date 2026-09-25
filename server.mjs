// Local development server. Uses Node.js built-ins; no npm installation required.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be a number between 1 and 65535.');
  process.exit(1);
}
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
};
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method not allowed');
    return;
  }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let filename = path.resolve(root, '.' + pathname);
    const relative = path.relative(root, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative) || pathname.includes('\0')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    let info = await stat(filename);
    if (info.isDirectory()) {
      filename = path.join(filename, 'index.html');
      info = await stat(filename);
    }
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200, {
      'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(filename);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404, { 'Content-Type': 'text/plain' });
    res.end(error instanceof URIError ? 'Invalid URL' : 'Page not found');
  }
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Close the other server or set PORT to another number.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}`;
  console.log(`\nMohamed Kaif portfolio: ${url}\nKeep this terminal open. Press Ctrl+C to stop.\n`);
  if (process.argv.includes('--open')) {
    const [command, args] = process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', () => console.log(`Open ${url} in your browser.`));
    child.unref();
  }
});

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8000);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + pathname);
    if (!(path === root.replace(/[\\/]$/, '') || path.startsWith(root.endsWith(sep) ? root : root + sep)) || pathname.split('/').some(part => part.startsWith('.'))) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const info = await stat(path), target = info.isDirectory() ? resolve(path, 'index.html') : path;
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Poster Studio: http://127.0.0.1:${port}`));

// Local-only design preview; no upload/API handler.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    if (fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    const bytes = fs.readFileSync(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Design preview: http://127.0.0.1:4173/design/ingestion/prototype/'));

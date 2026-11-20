import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { store } from './store.js';
import { seedOshwal } from './seeds/oshwal.js';
import { createApiRouter } from './routes.js';
import { startCronScheduler } from './cron.js';
import { detectLanIpv4 } from './integrations.js';

function loadLocalEnv() {
  if (process.env.VITEST) return;
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

export function createApp() {
  loadLocalEnv();
  if (!store.load()) {
    seedOshwal();
  }
  store.ensureSecurityBootstrap();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(createApiRouter());

  const clientDist = path.resolve(process.cwd(), 'dist', 'client');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api|\/openapi\.json).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
  return app;
}

const isMain = !process.env.VITEST && process.argv[1] && /server[\\/]index\.(ts|js)$/i.test(process.argv[1]);
if (isMain) {
  const port = Number(process.env.PORT ?? 4100);
  const app = createApp();
  app.listen(port, '0.0.0.0', () => {
    const lanIp = detectLanIpv4();
    const lanNote = lanIp ? ` | LAN: http://${lanIp}:${port}` : '';
    console.log(`SabiEdu ERP API listening on http://0.0.0.0:${port}${lanNote} (OpenAPI docs: http://localhost:${port}/api/docs)`);
    startCronScheduler();
  });
}

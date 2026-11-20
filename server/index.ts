import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { store } from './store.js';
import { seedOshwal } from './seeds/oshwal.js';
import { createApiRouter } from './routes.js';
import { startCronScheduler } from './cron.js';

export function createApp() {
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
    console.log(`OpenEdu Prime ERP API listening on http://0.0.0.0:${port} (OpenAPI docs: http://localhost:${port}/api/docs)`);
    startCronScheduler();
  });
}

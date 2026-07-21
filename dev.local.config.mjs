import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

// Config de DEV LOCAL (não versionar). Sobe o front E roda as serverless
// functions da pasta api/ como middleware do próprio Vite — sem depender de
// `vercel dev`/login. Uso: npx vite --config dev.local.config.mjs
function localVercelApi() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl || req.url || '';
        if (!url.startsWith('/api/')) return next();

        const u = new URL(url, 'http://localhost');
        const name = u.pathname.replace(/^\/api\//, '').replace(/\/$/, '');

        // Shims no estilo Vercel/Express que os handlers esperam.
        req.query = Object.fromEntries(u.searchParams.entries());
        res.status = (c) => { res.statusCode = c; return res; };
        res.json = (o) => {
          if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(o));
          return res;
        };

        let mod;
        try {
          mod = await server.ssrLoadModule('/api/' + name + '.js');
        } catch {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'API route não encontrada: ' + name }));
          return;
        }
        const handler = mod.default;
        if (typeof handler !== 'function') {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'handler inválido em ' + name }));
          return;
        }

        // stripe-webhook lê o corpo CRU (verificação de assinatura): não consumir o stream.
        if (name === 'stripe-webhook') {
          return handler(req, res);
        }

        // Demais rotas: parseia o corpo JSON em req.body, como a Vercel faz.
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString('utf8');
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }

        try {
          await handler(req, res);
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        }
      });
    },
  };
}

export default ({ mode }) => {
  // '' = carrega TODAS as vars do .env.local (não só as VITE_) pro process.env,
  // pra que os handlers server-side enxerguem STRIPE_*/META_*.
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);
  return {
    plugins: [react(), localVercelApi()],
    optimizeDeps: { exclude: ['lucide-react'] },
  };
};

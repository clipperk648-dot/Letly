import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function netlifyFunctionsMiddleware() {
  return {
    name: "netlify-functions-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        const map = {
          "/api/auth/register": "./netlify/functions/auth-register.js",
          "/api/auth/login": "./netlify/functions/auth-login.js",
          "/api/auth/profile": "./netlify/functions/auth-profile.js",
          "/api/health": "./netlify/functions/health.js",
          "/api/properties": "./netlify/functions/properties.js",
          "/api/messages": "./netlify/functions/messages.js",
          "/api/social/posts": "./api/social/posts.js",
          "/api/social/comments": "./api/social/comments.js",
          "/api/social/likes": "./api/social/likes.js",
          "/api/social/follows": "./api/social/follows.js",
          "/api/social/profile": "./api/social/profile.js",
        };
        const fnRel = map[url];
        if (!fnRel) return next();
        const fnAbs = path.resolve(process.cwd(), fnRel);

        const collectBody = () => new Promise((resolve) => {
          const chunks = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => resolve(Buffer.concat(chunks).toString()));
          req.on("error", () => resolve(""));
        });

        (async () => {
          try {
            const body = await collectBody();
            const fileUrl = pathToFileURL(fnAbs).href + `?t=${Date.now()}`;
            const imported = await import(fileUrl);
            const mod = imported?.default || imported;
            const handler = mod?.handler || mod;
            const result = await handler({
              httpMethod: req.method || "GET",
              headers: req.headers || {},
              body,
            });
            res.statusCode = result.statusCode || 200;
            const headers = result.headers || {};
            for (const k of Object.keys(headers)) {
              try { res.setHeader(k, headers[k]); } catch {}
            }
            res.end(result.body || "");
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Dev middleware error", message: String(err && err.message ? err.message : err) }));
          }
        })();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["recharts", "d3"],
          ui: ["framer-motion", "lucide-react"],
        },
      },
    },
  },
  plugins: [tsconfigPaths(), react(), tagger(), netlifyFunctionsMiddleware()],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    hmr: {
      clientPort: 4028,
      protocol: 'ws',
    },
  },
});

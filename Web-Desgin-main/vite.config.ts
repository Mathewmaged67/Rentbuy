// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        // Fix: "does not provide an export named 'useSyncExternalStoreWithSelector'"
        // Force Vite to use the CJS build which exports everything correctly
        "use-sync-external-store/shim/with-selector": path.resolve(
          __dirname,
          "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.js"
        ),
        "use-sync-external-store/shim": path.resolve(
          __dirname,
          "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.js"
        ),
      },
    },
  },
});

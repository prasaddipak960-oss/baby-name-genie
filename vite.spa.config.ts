import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// Vercel-safe static SPA build.
// The app is fully client-side, so deploying a plain Vite bundle avoids the
// TanStack Start/Nitro server-output mismatch that caused the live white screen.
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
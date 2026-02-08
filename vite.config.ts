import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Improved code splitting for better caching and faster loads
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js into its own chunk (large library)
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // React ecosystem - core bundle
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animation libraries
          'animation-vendor': ['framer-motion', '@react-spring/three'],
          // UI components
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tooltip', '@radix-ui/react-slot'],
        },
      },
    },
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    // Increase chunk size warning limit since Three.js is large
    chunkSizeWarningLimit: 700,
    // Source maps only in development
    sourcemap: mode === 'development',
  },
}));



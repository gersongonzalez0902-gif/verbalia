import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Oculta las herramientas de desarrollo de Next.js: el jugador solo ve el
   * juego, nunca paneles técnicos de compilación o enrutado.
   */
  devIndicators: false,
  reactStrictMode: false,
  /** Mega-7 · Optimización: barrel-eliminación para lucide-react. */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

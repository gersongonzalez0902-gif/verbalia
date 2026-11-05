import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Oculta las herramientas de desarrollo de Next.js: el jugador solo ve el
   * juego, nunca paneles técnicos de compilación o enrutado.
   */
  devIndicators: false,
  reactStrictMode: false,
};

export default nextConfig;

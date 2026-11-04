import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "VERBALIA · La aventura del lenguaje",
  description:
    "Videojuego educativo para entrenar vocabulario, gramática, ortografía, lectura y expresión. Explora el Archipiélago de las Palabras en sesiones de 3 a 5 minutos.",
  applicationName: "VERBALIA",
  manifest: "/manifest.webmanifest",
  keywords: [
    "verbalia",
    "videojuego educativo",
    "español",
    "vocabulario",
    "gramática",
    "ortografía",
    "aprender jugando",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VERBALIA",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#17211b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

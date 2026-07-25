import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ohne root wählt Turbopack wegen einer package-lock.json im Home-Verzeichnis
  // dieses als Workspace-Root und überwacht den gesamten Ordner (EMFILE-Fehler).
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;

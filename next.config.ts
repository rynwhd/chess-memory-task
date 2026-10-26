import type { NextConfig } from "next";

// On GitHub Pages a project site lives at https://<user>.github.io/<repo>/,
// so every asset URL must be prefixed with "/<repo>". The deploy workflow
// sets NEXT_PUBLIC_BASE_PATH automatically; locally it is empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // emit a fully static site into ./out
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true, // /results -> /results/index.html (GitHub Pages friendly)
  images: { unoptimized: true }, // next/image optimisation needs a server
};

export default nextConfig;

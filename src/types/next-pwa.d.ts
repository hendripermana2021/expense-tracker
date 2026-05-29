declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface NextPwaOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    fallbacks?: {
      document?: string;
    };
  }

  type NextPwa = (options: NextPwaOptions) => (nextConfig: NextConfig) => NextConfig;

  const nextPwa: NextPwa;
  export default nextPwa;
}

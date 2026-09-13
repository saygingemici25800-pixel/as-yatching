import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Seyir Defteri fotoğrafları Supabase Storage'dan imzalı URL ile geliyor.
 * next/image'in dış kaynağı optimize edebilmesi için alan adı izinli olmalı.
 * NEXT_PUBLIC_SUPABASE_URL tanımlı değilse hiç kural eklenmez (yerel demo).
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/**",
          },
        ]
      : [],
  },
};

export default withNextIntl(nextConfig);

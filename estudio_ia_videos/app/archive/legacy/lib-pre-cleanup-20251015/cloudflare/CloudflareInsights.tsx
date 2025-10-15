
"use client";

import Script from "next/script";

interface CloudflareInsightsProps {
  token?: string;
  enabled?: boolean;
}

/**
 * ☁️ CLOUDFLARE INSIGHTS (SINGLE BEACON)
 * Carrega apenas um beacon do Cloudflare para evitar duplicação
 * Use apenas uma vez no layout raiz
 */
export default function CloudflareInsights({ 
  token = process.env.NEXT_PUBLIC_CLOUDFLARE_INSIGHTS_TOKEN,
  enabled = true 
}: CloudflareInsightsProps) {
  if (!enabled || !token) {
    return null;
  }

  return (
    <Script
      id="cf-insights"
      strategy="afterInteractive"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}

import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.STILLROOM_LOGGING_CHECK === '1' ? '.next-logging-check' : '.next',
  logging: false,
  poweredByHeader: false,
  outputFileTracingExcludes: { '/*': ['./.private/**/*', './.env*', './test-results/**/*', './playwright-report/**/*', './.next-logging-check/**/*'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ] }];
  },
};
export default config;

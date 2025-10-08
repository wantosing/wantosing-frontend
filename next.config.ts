import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'i.scdn.co', // spotify
      'i.ytimg.com', // youtube thumbnails
      'img.youtube.com',
      'is1-ssl.mzstatic.com', // apple
      'is2-ssl.mzstatic.com',
      'pbs.twimg.com', // common
      'lh3.googleusercontent.com',
    ],
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();

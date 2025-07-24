import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  overrides: {
    wrapper: 'cloudflare-edge',
    converter: 'edge',
    tagCache: 'dummy',
    queue: 'dummy',
    incrementalCache: 'dummy',
    kvCache: 'dummy',
  },
  experimental: {
    disableServerFunctionsPlatformCheck: true,
  },
  buildCommand: 'npm run build',
  buildOutputPath: '.next',
});

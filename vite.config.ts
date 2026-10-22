import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages lives below /PhiOS-XR/, other hosts typically serve at /.
  base: process.env.GITHUB_PAGES === 'true' ? '/PhiOS-XR/' : '/',
  build: { target: 'es2022' },
})

import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Pin the workspace root. Without this Turbopack walks up past the repo and
   * finds an unrelated package-lock.json in the user profile directory, which
   * it warns about and could infer the wrong root from.
   */
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig

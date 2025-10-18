/** @type {import('next').nextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['sharp', 'pg'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでNode.jsモジュールを使用しないようにする
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        querystring: false,
        zlib: false,
        punycode: false,
        readline: false,
        vm: false,
        constants: false,
        domain: false,
        cluster: false,
        worker_threads: false,
        perf_hooks: false,
        async_hooks: false,
        inspector: false,
        trace_events: false,
        v8: false,
        wasi: false,
        worker_threads: false,
      }
      
      // pgライブラリをクライアントサイドで除外
      config.externals = config.externals || []
      config.externals.push({
        'pg': 'commonjs pg',
        'pg-native': 'commonjs pg-native',
        'pg-query-stream': 'commonjs pg-query-stream',
        'pg-pool': 'commonjs pg-pool',
        'pg-types': 'commonjs pg-types',
        'pg-int8': 'commonjs pg-int8',
        'pg-connection-string': 'commonjs pg-connection-string',
        'pgpass': 'commonjs pgpass',
        'detect-libc': 'commonjs detect-libc',
      })
    }
    return config
  },
}

module.exports = nextConfig

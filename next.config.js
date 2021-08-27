module.exports = {
  reactStrictMode: true,
  webpack: function (config, { dev, isServer }) {
    if (!isServer) {
        config.resolve.fallback.fs = false
    }
    if (!dev) {
        config.plugins.push(
            new CopyPlugin({
                patterns: [{ from: "candidates", to: "candidates" }],
            })
        )
    }
    return config
},
}

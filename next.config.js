/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // ✅ This tells webpack to handle the pdf.worker file correctly
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?mjs/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
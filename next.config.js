/** @type {import('next').NextConfig} */
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    // this will override the experiments
    // eslint-disable-next-line no-param-reassign
    config.experiments = { ...config.experiments, ...{ topLevelAwait: true } };
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config;
  },
};

module.exports = nextConfig;

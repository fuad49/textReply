/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore pg-native completely
      config.externals.push('pg-native');
    }
    return config;
  },
};

export default nextConfig;

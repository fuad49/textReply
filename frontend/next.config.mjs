/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
  turbopack: {},
};

export default nextConfig;

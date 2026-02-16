/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
};

export default nextConfig;

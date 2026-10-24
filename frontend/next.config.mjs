/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // minimal runtime bundle for the Docker image
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;

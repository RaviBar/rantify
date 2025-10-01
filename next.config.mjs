/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  images: {
    // Option A: add common hostnames
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'search.brave.com'],
  }
};
 
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "assets.aceternity.com" },
      { hostname: "kvkweiyzknanqddupvok.supabase.co" },
      { hostname: "encrypted-tbn0.gstatic.com" },
      {hostname:"dummyimage.com"}
    ],
  },
};

export default nextConfig;

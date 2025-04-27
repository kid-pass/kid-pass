import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'kid-pass.public.blob.vercel-storage.com',
				port: '',
			},
		],
	},
};

export default nextConfig;

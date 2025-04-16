'use client';

import { newsItems } from '@/utils/news';
import { Box, Image } from '@mantine/core';

interface NewsDetailPageProps {
	params: {
		slug: string;
	};
}

export function generateStaticParams() {
	return newsItems.map((news) => ({
		slug: news.id,
	}));
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
	const { slug } = params;
	const newsItem = newsItems.find((item) => item.id === slug);

	return (
		<Box>
			<Image src={newsItem?.imageUrl} />
		</Box>
	);
}

'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import useNavigation from '@/hook/useNavigation';
import instance from '@/utils/axios';
import { Box, Image, Paper, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface NewsItem {
	id: string;
	title: string[];
	content: string[];
	imageUrl: string[];
}

const App = () => {
	const [newsData, setNewsData] = useState<NewsItem[]>([]);
	const router = useRouter();
	const { goBack } = useNavigation();

	const fetchNewsData = async () => {
		const response = await instance.get('/news');

		setNewsData(response.data.data);
	};

	useEffect(() => {
		fetchNewsData();
	}, []);

	return (
		<MobileLayout
			headerType="back"
			title="건강뉴스"
			currentRoute="/more/news"
			onBack={goBack}
		>
			<Stack px="md" gap="md">
				{newsData.map((news) => (
					<Paper
						key={news.id}
						onClick={() => {
							router.push(`/more/news/${news.id}`);
						}}
					>
						<Image
							src={news.imageUrl[0].replace('/public', '')}
							radius="18px 18px 0 0"
							w="100%"
							h="200px"
						/>
						<Box
							p="20"
							style={{
								width: '100%',
								borderRadius: '0 0 18px 18px',
							}}
							bg="#F8FFC9"
						>
							<Text c="#000000" fz="1.625rem" fw={700}>
								{news.title[0]}
							</Text>
						</Box>
					</Paper>
				))}
			</Stack>
		</MobileLayout>
	);
};

export default App;

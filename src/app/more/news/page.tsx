'use client';

import instance from '@/utils/axios';
import { newsItems } from '@/utils/news';
import { Box, Image, Paper, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';

const App = () => {
	const fetchNewsData = async () => {
		const response = await instance.get('/news');

		return response.data;
	};

	useEffect(() => {
		fetchNewsData();
	}, []);

	return (
		<Stack p="md" gap="md">
			{newsItems.map((news) => (
				<Paper key={news.id}>
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
	);
};

export default App;

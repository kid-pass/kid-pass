'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import useNavigation from '@/hook/useNavigation';
import instance from '@/utils/axios';
import { Box, Image, Text, Stack } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const App = () => {
	const pathname = usePathname();
	const id = pathname.split('/').pop();
	const [newsDetail, setNewsDetail] = useState<any>(null);
	const { goBack } = useNavigation();

	const fetchReportDetail = async () => {
		try {
			const response = await instance.get(`/news/${id}`);
			setNewsDetail(response.data.data[0]);
		} catch (error) {
			console.error('Error fetching news detail:', error);
		}
	};

	useEffect(() => {
		fetchReportDetail();
	}, []);

	const renderNewsContent = () => {
		if (!newsDetail) return null;

		// 직접 데이터 구조 확인
		const imageUrl = newsDetail.imageUrl;
		const title = newsDetail.title;
		const content = newsDetail.content;

		// 가장 긴 배열의 길이 찾기
		const maxLength = Math.max(
			Array.isArray(imageUrl) ? imageUrl.length : 0,
			Array.isArray(title) ? title.length : 0,
			Array.isArray(content) ? content.length : 0
		);

		const newsItems = [];

		// 각 인덱스별로 렌더링
		for (let i = 0; i < maxLength; i++) {
			const currentImage =
				Array.isArray(imageUrl) && i < imageUrl.length
					? imageUrl[i]
					: null;
			const currentTitle =
				Array.isArray(title) && i < title.length ? title[i] : null;
			const currentContent =
				Array.isArray(content) && i < content.length
					? content[i]
					: null;

			// 적어도 하나의 요소가 있는 경우만 렌더링
			if (currentImage || currentTitle || currentContent) {
				newsItems.push(
					<Box key={i}>
						{currentImage && (
							<Image
								src={currentImage}
								alt={`뉴스 이미지 ${i + 1}`}
								mb="24"
							/>
						)}
						<Box px="20">
							{currentTitle && (
								<Text fw={600} c="#222222" fz="32" mb="40">
									{currentTitle}
								</Text>
							)}
							{currentContent && (
								<Text
									mb="40"
									fw={500}
									c="#1A1918"
									fz="md"
									style={{ lineHeight: '1.3' }}
								>
									{currentContent}
								</Text>
							)}
						</Box>
					</Box>
				);
			}
		}

		return newsItems;
	};

	return (
		<MobileLayout headerType="back" onBack={goBack} title="건강뉴스 상세">
			<Box>
				<Stack gap={0}>{renderNewsContent()}</Stack>
			</Box>
		</MobileLayout>
	);
};

export default App;

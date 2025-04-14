'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import instance from '@/utils/axios';
import { Box, Flex, LoadingOverlay, Paper, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReportData {
	childId: string;
	childName: string;
	date: string;
	id: string;
}

function formatDate(dateString: string) {
	const date = new Date(dateString);

	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	const hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, '0');

	return `${year}년 ${month}월 ${day}일 `;
}

const App = () => {
	const [reportData, setReportData] = useState<ReportData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const onBack = () => {
		router.back();
	};

	const fetchReportList = async () => {
		const response = await instance.get('/report');

		setReportData(response.data.data);
		setIsLoading(false);

		return response;
	};

	useEffect(() => {
		setIsLoading(true);
		fetchReportList();
	}, []);

	return (
		<MobileLayout
			showHeader={true}
			headerType="profile"
			title="리포트 리스트"
			onBack={onBack}
			currentRoute="/more/report"
		>
			<Stack p="md" gap="md">
				{isLoading ? (
					<LoadingOverlay visible={isLoading}></LoadingOverlay>
				) : reportData.length > 0 ? (
					reportData.map((item) => (
						<Paper
							key={item.id}
							withBorder
							p="md"
							radius="md"
							bg="white"
							style={{ cursor: 'pointer' }}
							onClick={() => {
								router.push(`./report/${item.id}`);
							}}
						>
							<Box>
								<Flex
									justify="space-between"
									align="center"
									mb="xs"
								>
									<Text fw={600} fz="md">
										{item.childName}
									</Text>
									{/* <Text fz="md" c="dimmed">
										{item.hospital}
									</Text> */}
								</Flex>
								<Text fz="sm" c="gray.6">
									{formatDate(item.date)}
								</Text>
							</Box>
						</Paper>
					))
				) : (
					<Paper withBorder p="md" radius="md" bg="white">
						<Text
							c="#FFB6D7"
							fw={500}
							style={{ textAlign: 'center' }}
						>
							리포트가 없습니다.
						</Text>
					</Paper>
				)}
			</Stack>
		</MobileLayout>
	);
};

export default App;

'use client';

import { useRouter } from 'next/navigation';
import { Prescription } from './type/hospital';
import MobileLayout from '../../components/mantine/MobileLayout';
import { Paper, Flex, Text, Stack, ActionIcon, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import instance from '@/utils/axios';

const Hospital = () => {
	const router = useRouter();
	const { crtChldrnNo } = useAuthStore();
	const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getChildPrescriptions = async (childId: string) => {
		try {
			console.log(crtChldrnNo);

			const response = await instance.get(
				`/child/${childId}/prescription`
			);

			console.log(response.data);
			return response.data;
		} catch (error) {
			console.error('처방전 조회 오류:', error);
			throw error;
		}
	};

	useEffect(() => {
		const fetchPrescriptions = async () => {
			// crtChldrnNo가 undefined인 경우 API 요청을 하지 않음
			if (!crtChldrnNo) {
				setLoading(false);
				setError('아이 정보를 찾을 수 없습니다.');
				return;
			}

			try {
				setLoading(true);
				const data = await getChildPrescriptions(crtChldrnNo);
				setPrescriptions(data);
				setError(null);
			} catch (err) {
				setError('처방전을 불러오는데 실패했습니다.');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchPrescriptions();
	}, [crtChldrnNo]);

	return (
		<MobileLayout
			showHeader={true}
			headerType="profile"
			title="병원 처방전"
			showBottomNav={true}
			currentRoute="/hospital"
		>
			<Stack p="md" gap="md">
				{prescriptions.map((record) => (
					<Item
						key={record.id}
						{...record}
						onClick={() => {
							router.push(`/hospital/detail?id=${record.id}`);
						}}
					/>
				))}
			</Stack>

			<Box pos="fixed" bottom={80} right={16} style={{ zIndex: 10 }}>
				<ActionIcon
					size="xl"
					radius="xl"
					color="blue"
					onClick={() => router.push('/hospital/form')}
				>
					<IconPlus size={24} />
				</ActionIcon>
			</Box>
		</MobileLayout>
	);
};
const Item = (props: Prescription & { onClick?: () => void }) => {
	// onClick과 나머지 속성 분리
	const { onClick, ...item } = props;

	return (
		<Paper
			withBorder
			p="md"
			radius="md"
			bg="white"
			onClick={onClick} // 여기에 onClick 이벤트 추가
			style={{ cursor: 'pointer' }} // 클릭 가능함을 시각적으로 표시
		>
			<Flex justify="space-between" align="center" mb="xs">
				<Text fw={600} fz="md">
					{item.diagnoses}
				</Text>
				<Text fz="md" c="dimmed">
					{item.hospital}
				</Text>
			</Flex>
			<Text fz="sm" c="gray.6">
				{item.date}
			</Text>
		</Paper>
	);
};

export default Hospital;

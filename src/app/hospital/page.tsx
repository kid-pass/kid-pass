'use client';

import { useRouter } from 'next/navigation';
import { Prescription } from './type/hospital';
import MobileLayout from '../../components/mantine/MobileLayout';
import { Stack, ActionIcon, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import instance from '@/utils/axios';
import PrescritionItem from './PrescriptionItem';

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
					<PrescritionItem
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

export default Hospital;

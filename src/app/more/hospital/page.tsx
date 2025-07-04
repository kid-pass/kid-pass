'use client';

import { useRouter } from 'next/navigation';
import { Prescription } from './type/hospital';
import MobileLayout from '../../../components/mantine/MobileLayout';
import { Stack, ActionIcon, Box, LoadingOverlay } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import instance from '@/utils/axios';
import PrescritionItem from './PrescriptionItem';
import EmptyState from '@/components/EmptyState/EmptyState';

const Hospital = () => {
	const router = useRouter();
	const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
	const [isloading, setIsLoading] = useState(true);
	const { crtChldrnNo } = useAuthStore();
	const [isReactNative, setIsReactNative] = useState(false);

	useEffect(() => {
		// 클라이언트 사이드에서만 실행됨
		setIsReactNative(!!window.ReactNativeWebView);
	}, []);

	const getChildPrescriptions = async (childId: string) => {
		try {
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
			setIsLoading(true);

			if (!crtChldrnNo) {
				setIsLoading(false);
				return;
			}

			try {
				const data = await getChildPrescriptions(crtChldrnNo);
				setPrescriptions(data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPrescriptions();
	}, [crtChldrnNo]);

	return (
		<>
			{isloading ? (
				<LoadingOverlay visible={isloading} />
			) : (
				<MobileLayout
					showHeader={true}
					headerType="back"
					title="병원 처방전"
					showBottomNav={true}
					onBack={() => router.back()}
					currentRoute="/more/hospital"
				>
					<Stack p="md" gap="md">
						{prescriptions.length === 0 ? (
							<EmptyState />
						) : (
							prescriptions.map((record) => (
								<PrescritionItem
									key={record.id}
									{...record}
									onClick={() => {
										router.push(
											`./hospital/detail?id=${record.id}`
										);
									}}
								/>
							))
						)}
					</Stack>

					<Box
						pos="fixed"
						bottom={isReactNative ? 10 : 80}
						right={16}
						style={{ zIndex: 10 }}
					>
						<ActionIcon
							size="xl"
							radius="xl"
							color="blue"
							onClick={() => router.push('./hospital/form')}
						>
							<IconPlus size={24} />
						</ActionIcon>
					</Box>
				</MobileLayout>
			)}
		</>
	);
};

export default Hospital;

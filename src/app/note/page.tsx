'use client';

import VaccineCount, { VaccineStatusInfo } from './components/VaccineCount';
import ProgressBar from '@/components/progressBar/progressBar';
import useAuth from '@/hook/useAuth';
import { useEffect, useState } from 'react';
import instance from '@/utils/axios';
import useChldrnListStore from '@/store/useChldrnListStore';
import Spacer from '@/elements/spacer/Spacer';
import { Group, Box, Text, Flex, LoadingOverlay } from '@mantine/core';
import MobileLayout from '@/components/mantine/MobileLayout';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export interface VacntnInfo {
	id: string;
	vacntnId: string;
	vacntnIctsd: string;
	vacntnDoseNumber: number;
	vacntnInoclDt: string;
	childId: string;
	createdAt: Date;
	updatedAt: Date;
	isCompleted?: boolean;
	actualDate?: string | null;
}
interface VaccinationData {
	vacntnInfo: VacntnInfo[];
	totalCompletedDoses: number;
	totalRequiredDoses: number;
	completionPercentage: number;
	vaccineStatusMap: Record<string, VaccineStatusInfo>;
}
const App = () => {
	const router = useRouter();
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [vaccinationData, setVaccinationData] = useState<VaccinationData>({
		vacntnInfo: [],
		totalCompletedDoses: 0,
		totalRequiredDoses: 0,
		completionPercentage: 0,
		vaccineStatusMap: {},
	});

	// Zustand store에서 crtChldrnNo 가져오기
	const { crtChldrnNo } = useAuthStore();

	const handleBack = () => router.push('/');

	useEffect(() => {
		const fetchData = async () => {
			if (crtChldrnNo) {
				setIsLoading(true);

				try {
					const token = await getToken();

					const response = await instance.get(
						`/vaccine/info?chldrnNo=${crtChldrnNo}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					// 백엔드에서 모든 필요한 데이터를 받아 상태 업데이트
					setVaccinationData(response.data.data);
				} catch (error) {
					console.error('데이터 불러오기 실패:', error);
					// 에러 발생 시 기본값으로 초기화
					setVaccinationData({
						vacntnInfo: [],
						totalCompletedDoses: 0,
						totalRequiredDoses: 0,
						completionPercentage: 0,
						vaccineStatusMap: {},
					});
				} finally {
					setIsLoading(false);
				}
			}
		};

		// 컴포넌트 마운트 시 초기 데이터 로드
		fetchData();
	}, [crtChldrnNo]);

	return (
		<MobileLayout
			showHeader={true}
			headerType="profile"
			title="아기수첩"
			showBottomNav={true}
			onBack={handleBack}
			calendar={true}
		>
			<Box p="0 20">
				<LoadingOverlay visible={isLoading} />
				<Text fw={700} size="md-lg" c="#222222">
					예방접종 진행률
				</Text>

				<Box
					mt="sm"
					mb="sm"
					p="16"
					style={{
						backgroundColor: '#F4F4F4',
						width: '100%',
						borderRadius: '10px',
					}}
				>
					<Group mb="sm" gap={0} justify="space-between" w="100%">
						<Group gap={8}>
							<Flex
								pb="4"
								pt="4"
								pl="8"
								pr="8"
								gap="4"
								display="flex"
								align="center"
								style={{
									backgroundColor: '#729BED',
									borderRadius: '12px',
									textAlign: 'center',
								}}
							>
								<Text fw={700} c="white" fz="sm">
									완료
								</Text>
								<Text fw={700} size="lg" c="white" fz="sm">
									{vaccinationData.totalCompletedDoses}
								</Text>
							</Flex>

							<Flex
								pb="4"
								pt="4"
								pl="8"
								pr="8"
								gap="4"
								display="flex"
								align="center"
								style={{
									backgroundColor: '#BFBFBF',
									borderRadius: '12px',
									textAlign: 'center',
								}}
							>
								<Text fw={700} c="white" fz="sm">
									미접종
								</Text>
								<Text fw={700} size="lg" c="white" fz="sm">
									{vaccinationData.totalRequiredDoses}
								</Text>
							</Flex>
						</Group>

						<Text size="xl" fw={700}>
							{`${vaccinationData.completionPercentage}%`}
						</Text>
					</Group>

					<ProgressBar
						completed={vaccinationData.completionPercentage}
						total={100}
					/>

					{/*
      <Progress
        value={vaccinationData.completionPercentage}
        color="#729BED"
        size="lg"
      />
      */}
				</Box>

				<Text fw={700} size="md-lg" c="#222222">
					예방접종 자세히 보기
				</Text>
				<VaccineCount
					vaccineStatusMap={vaccinationData.vaccineStatusMap}
				/>

				<Spacer height={50} />
			</Box>
		</MobileLayout>
	);
};

export default App;

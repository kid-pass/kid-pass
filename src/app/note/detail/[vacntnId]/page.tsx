'use client';

import useAuth from '@/hook/useAuth';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import instance from '@/utils/axios';
import Spacer from '@/elements/spacer/Spacer';
import ScrollPicker from '../../components/ScrollPicker';
import { useDateStore } from '@/store/useDateStore';
import MobileLayout from '@/components/mantine/MobileLayout';
import {
	Box,
	Button,
	Divider,
	Flex,
	Group,
	Image,
	Text,
	useMantineTheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';

// 백신 기록 데이터 타입
interface VacntnInfo {
	id: string;
	vacntnId: string;
	vacntnIctsd: string;
	vacntnDoseNumber: number;
	vacntnInoclDt: string;
	childId: string;
}

// 접종 차수별 상태 정보
interface DoseStatus {
	doseNumber: number;
	vaccineCode: string;
	vaccineName: string;
	isCompleted: boolean;
	vaccinationDate: string | null;
	recordId: string | null;
}

// 백신 상세 정보 응답 타입
interface VaccineDetailResponse {
	vaccineId: number;
	vaccineName: string;
	totalDoses: number;
	completedDoses: number;
	doseStatus: DoseStatus[];
	nextVaccineInfo: {
		vaccineCode: string;
		doseNumber: number;
	} | null;
	vaccineRecords: VacntnInfo[];
}

export default function VaccineDetailPage() {
	const theme = useMantineTheme();
	const router = useRouter();
	const { getToken } = useAuth();
	const token = getToken();
	const params = useParams();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [vaccineDetail, setVaccineDetail] =
		useState<VaccineDetailResponse | null>(null);
	const handleBack = () => router.push('/');

	// URL에서 vaccineId 추출
	const vaccineId = params?.vacntnId as string;
	const crtChldrnNo = searchParams.get('crtChldrnNo');

	// 백신 상세 정보 가져오기
	const fetchVaccineDetail = useCallback(async () => {
		if (!vaccineId || !crtChldrnNo) return;

		try {
			setLoading(true);
			const response = await instance.get(
				`/vaccine/detail?chldrnNo=${crtChldrnNo}&vaccineId=${vaccineId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log(response.data.data);
			if (response.data?.data) {
				setVaccineDetail(response.data.data);
			}
			setError(null);
		} catch (error) {
			console.error('백신 상세 정보 가져오기 실패:', error);
			setError('백신 정보를 불러오는데 실패했습니다.');
		} finally {
			setLoading(false);
		}
	}, [crtChldrnNo, vaccineId]);

	useEffect(() => {
		fetchVaccineDetail();
	}, [fetchVaccineDetail]);

	// 백신 접종 등록
	const handleConfirm = useCallback(async () => {
		if (!vaccineDetail?.nextVaccineInfo || !crtChldrnNo) return;

		try {
			const { year, month, day } = useDateStore.getState();
			const formattedDate = `${year}-${month
				.toString()
				.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

			const body = {
				childId: crtChldrnNo,
				vaccinationData: {
					vacntnId: vaccineId,
					vacntnIctsd: vaccineDetail.nextVaccineInfo.vaccineCode,
					vacntnDoseNumber: vaccineDetail.nextVaccineInfo.doseNumber,
					vacntnInoclDt: formattedDate,
				},
			};

			await instance.patch('/vaccine/detail', body, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			// 성공 후 데이터 다시 불러오기
			await fetchVaccineDetail();
		} catch (error) {
			console.error('백신 접종 기록 생성 중 오류 발생:', error);
		}
	}, [vaccineDetail, crtChldrnNo, vaccineId, token, fetchVaccineDetail]);

	// 모달 콘텐츠 설정 및 열기
	const handleOpenVaccineModal = useCallback(() => {
		// 모달 ID를 통해 모달을 열고 닫을 수 있습니다
		const modalId = modals.open({
			// 중앙 모달 테마 적용
			centered: true,
			withCloseButton: false,
			radius: 'md',
			padding: 0,
			title: '접종일',
			styles: {
				header: {
					borderBottom: '1px solid #D9D9D9',
					padding: 0,
				},
				title: {
					width: '100%',
					padding: '16px',
					fontWeight: 700,
					fontSize: '18px',
					color: '#222',
				},
				content: {
					padding: 0,
				},
			},
			children: (
				<Box w="100%">
					<Box>
						<ScrollPicker />
					</Box>
					<Flex>
						<Button
							onClick={() => modals.close(modalId)}
							variant="default"
							color="gray"
							radius={0}
							styles={{
								root: {
									flex: 1,
									backgroundColor: '#F4F4F4',
									border: 'none',
									borderRadius: '0',
								},
							}}
						>
							취소
						</Button>
						<Button
							onClick={() => {
								handleConfirm();
								modals.close(modalId);
							}}
							variant="filled"
							color="blue"
							radius={0}
							styles={{
								root: {
									flex: 1,
									borderRadius: '0',
								},
							}}
						>
							확인
						</Button>
					</Flex>
				</Box>
			),
		});
	}, [handleConfirm]);

	return (
		<>
			{vaccineDetail ? (
				<MobileLayout
					showHeader={true}
					headerType="back"
					title={vaccineDetail.vaccineName}
					showBottomNav={true}
					onBack={handleBack}
				>
					<Box px={16}>
						<Text fw={700} fz="xl">
							{vaccineDetail.vaccineName}
						</Text>
						<Box
							mt={32}
							display="flex"
							style={{
								alignItems: 'center',
								justifyContent: 'space-between',
							}}
						>
							<Flex>
								<Text
									fw={600}
									fz={theme.fontSizes.mdLg}
									c="#729BED"
								>
									완료 {vaccineDetail.completedDoses}
								</Text>
								<Divider
									orientation="vertical"
									mx="md"
									size="xs"
									h={16}
									color="#D9D9D9"
								/>
								<Text
									fw={600}
									fz={theme.fontSizes.mdLg}
									c="#BFBFBF"
								>
									미접종
									{vaccineDetail.totalDoses -
										vaccineDetail.completedDoses}
								</Text>
							</Flex>
							<Flex align="center" gap={8}>
								{Array.from({
									length: vaccineDetail.totalDoses,
								}).map((_, index) => (
									<Box
										key={`circle-${index}`}
										w={12}
										h={12}
										bg={
											index < vaccineDetail.completedDoses
												? '#729BED'
												: '#D9D9D9'
										}
										style={{ borderRadius: '50%' }}
									/>
								))}
							</Flex>
						</Box>
						<Spacer height={16} />
						{vaccineDetail.doseStatus &&
							vaccineDetail.doseStatus.map((dose, index) => (
								<Box
									key={`vaccine-${dose.doseNumber}차`}
									mb={16}
								>
									{dose.isCompleted ? (
										<Box
											w="100%"
											bg="#BFBFBF"
											style={{
												borderRadius: 8,
												justifyContent: 'space-between',
											}}
											py={32}
											px={16}
											display="flex"
										>
											<Button
												style={{
													backgroundColor: '#BFBfBF',
													border: '1px solid white',
													color: 'white',
													padding: '4px 12px',
												}}
											>
												{`${dose.doseNumber}차 (${dose.vaccineCode})`}
											</Button>
											<Group gap={20} align="center">
												<Text
													fz="md"
													fw={500}
													c="white"
												>
													{dose.vaccinationDate
														? `${new Date(
																dose.vaccinationDate
														  ).toLocaleDateString()}`
														: ''}
												</Text>
												<Text
													fz="lg"
													fw={700}
													c="white"
												>
													완료
												</Text>
											</Group>
										</Box>
									) : (
										<Box
											w="100%"
											style={{
												border: '1px solid #729BED',
												borderRadius: 8,
												justifyContent: 'space-between',
											}}
											py={32}
											px={16}
											display="flex"
											onClick={handleOpenVaccineModal}
										>
											<Button
												size="S"
												style={{
													backgroundColor:
														'rgba(114, 155, 237, 0.1)',
													color: '#729BED',
													fontWeight: '700',
												}}
											>
												{`${dose.doseNumber}차 (${dose.vaccineCode})`}
											</Button>
											<Group gap={4} align="center">
												<Image
													src="/add_vaccine.svg"
													width={18}
													height={18}
													alt="백신 추가"
												/>
												<Text
													fz="xl"
													fw={700}
													c="#729BED"
												>
													등록하기
												</Text>
											</Group>
										</Box>
									)}
								</Box>
							))}
					</Box>
				</MobileLayout>
			) : (
				<p>로딩중..</p>
			)}
		</>
	);
}

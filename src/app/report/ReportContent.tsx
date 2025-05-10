'use client';

import ProfileMetrics from '@/components/metrics/ProfileMetrics';
import {
	Box,
	Button,
	Flex,
	LoadingOverlay,
	Stack,
	Text,
	useMantineTheme,
} from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ActionTab from './ActionTab';
import EmptyState from '@/components/EmptyState/EmptyState';
import { common } from '@/utils/common';
import { useToast } from '@/hook/useToast';
import useNavigation from '@/hook/useNavigation';
import PrescritionItem from '../more/hospital/PrescriptionItem';
import { useChildReportData } from '@/hook/useChildReportData';
import {
	SymptomItem,
	Prescription,
	VaccinationRecord,
	CategoryItem,
} from '@/types/childReportData';
import { IconCalendarCode } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import ReportWheel from './ReportWheel';

const ReportContent = () => {
	const searchParams = useSearchParams();
	const childId = searchParams.get('chldrnNo');
	const [days, setDays] = useState(3);
	const [selectedDays, setSelectedDays] = useState(days);
	const captureRef = useRef<HTMLDivElement>(null);
	const { getToday, getFormatDate, getAge } = common();
	const today = getToday();
	const theme = useMantineTheme();
	const { goPage } = useNavigation();
	const { successToast } = useToast();
	const [isReactNativeWebView, setIsReactNativeWebView] = useState(true);
	const selectedDaysRef = useRef(days);

	// 통합 API 호출 훅 사용
	const { data, isLoading, isError, error } = useChildReportData(
		childId,
		days,
		true
	);

	useEffect(() => {
		// window.ReactNativeWebView가 존재하면 RN 웹뷰 환경으로 판단
		setIsReactNativeWebView(!!window.ReactNativeWebView);
	}, []);

	// Wheel에서 값이 변경될 때 호출될 함수
	const handleDaysChange = (value: number) => {
		console.log('wheel에서 선택된 값:', value);
		selectedDaysRef.current = value; // ref 값 업데이트
		setSelectedDays(value);
	};

	// 확인 버튼 클릭 시 ref 값 사용
	const confirmDaysChange = () => {
		const valueToApply = selectedDaysRef.current;
		console.log('변경 적용:', valueToApply);
		setDays(valueToApply);
		modals.closeAll();
	};
	const openRecordModal = () => {
		setSelectedDays(days);

		const recordModal = modals.open({
			centered: true,
			withCloseButton: false,
			radius: 'md',
			padding: 0,
			title: '기간 변경',
			styles: {
				header: {
					borderBottom: '1px solid #D9D9D9',
					padding: 0,
				},
				title: {
					width: '100%',
					padding: '16px',
					fontWeight: 700,
					textAlign:'center',
					fontSize: '18px',
					color: '#222',
				},
				content: {
					padding: 0,
				},
			},
			children: (
				<Box>
					<ReportWheel
						values={[3, 7, 14]}
						initialValue={days}
						onChange={handleDaysChange}
						width="100%"
						height="120px"
						fontSize="16px"
					/>
					<Box display="flex">
						<Button
							onClick={() => modals.close(recordModal)}
							radius={0}
							variant='transparent'
							c="#222222"
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
							bg={theme.other.statusColors.succeess}
							c="#FFFFFF"
							radius={0}
							styles={{
								root: {
									flex: 1,
									borderRadius: '0',
								},
							}}
							onClick={confirmDaysChange}
						>
							변경
						</Button>
					</Box>
				</Box>
			),
		});
	};

	// 발행이 성공적으로 완료된 후 호출될 함수
	const handlePublishSuccess = () => {
		try {
			successToast({
				title: '레포트 발행',
				message: '레포트가 발행되었습니다.',
				position: 'top-center',
				autoClose: 2000,
			});

			goPage('/more/report');
		} catch (err) {
			console.log(err);
		}
	};

	// 에러 처리
	if (isError && error) {
		return (
			<Box p="md">
				<Text c="red">
					{error instanceof Error
						? error.message
						: '데이터를 불러오는 중 오류가 발생했습니다.'}
				</Text>
			</Box>
		);
	}

	// 데이터 구조 분해
	const profile = data?.profile;
	const symptoms = data?.symptoms || [];
	const prescriptions = data?.prescriptions || [];
	const vaccineData = data?.vaccines || [];
	const categoryRecords = data?.categories || [];

	return (
		<Box>
			{isLoading ? (
				<LoadingOverlay visible={isLoading} />
			) : (
				<Box px={16} ref={captureRef}>
					<Text
						fw={500}
						fz={theme.fontSizes.sm}
						c={theme.other.fontColors.empty}
						mb={theme.spacing.s}
					>
						발행일 {today}
					</Text>
					{profile && (
						<Box
							style={{
								visibility: 'visible',
								borderRadius: '8px',
							}}
							bg="brand.0"
							p="md"
						>
							<Flex justify="space-between" mb="md">
								<Stack gap="md">
									<ProfileMetrics
										label={`${getFormatDate(
											profile.birthDate
										)?.substring(0, 10)} 출생`}
										value={profile.name}
									/>
									<ProfileMetrics
										label="나이 (만)"
										value={getAge(profile.birthDate)}
									/>
								</Stack>
							</Flex>

							<Flex align="center" justify="space-between">
								<ProfileMetrics
									label="몸무게"
									value={`${profile.weight}kg`}
								/>
								<ProfileMetrics
									label="키"
									value={`${profile.height}cm`}
								/>
								<ProfileMetrics
									label="머리 둘레"
									value={`${profile.headCircumference}cm`}
								/>
							</Flex>
						</Box>
					)}
					<Box mt="xl">
						<Text fw={700} fz="lg" mb="xl">
							아기의 증상은요
						</Text>
						{symptoms.length === 0 ? (
							<EmptyState />
						) : (
							<Box display="flex" my="12 40" style={{ gap: 4 }}>
								{symptoms.map((item: SymptomItem) => (
									<Box
										key={item.id}
										p="10 20"
										bg="#FF7B7B"
										style={{ borderRadius: '20px' }}
									>
										<Text c="#FFFFFF" fz="md" fw={600}>
											{item.symptom}
										</Text>
									</Box>
								))}
							</Box>
						)}
					</Box>
					<Box mt="xl">
						<Text fw={700} fz="lg" mb="xl">
							최근 아기가 치료받은 기록이에요
						</Text>
						<Stack gap="md">
							{prescriptions.length === 0 ? (
								<EmptyState />
							) : (
								prescriptions.map((record: Prescription) => (
									<PrescritionItem
										key={record.id}
										{...record}
									/>
								))
							)}
						</Stack>
					</Box>
					<Box mt="xl">
						<Text fw={700} fz="lg" mb="xl">
							최근 아기의 예방접종 기록이에요
						</Text>

						{vaccineData && vaccineData.length === 0 ? (
							<EmptyState />
						) : (
							<Box
								p={theme.spacing.lg}
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '16px',
									boxShadow: `${theme.other.shadow.basic}`,
									borderRadius: '10px',
								}}
							>
								{vaccineData.map(
									(vaccine: VaccinationRecord) => (
										<Box
											display="flex"
											style={{
												flexDirection: 'column',
												gap: `${theme.spacing.sm}`,
												borderBottom:
													'1px solid #F4F4F4',
											}}
											key={vaccine.id}
										>
											<Text
												c={theme.other.fontColors.sub3}
												fz="md"
												fw={500}
											>
												{getFormatDate(
													vaccine.vaccinationDate
												)}
											</Text>
											<Box
												display="flex"
												style={{
													alignItems: 'center',
													justifyContent:
														'space-between',
												}}
												pb={theme.spacing.lg}
											>
												<Text
													c="#000000"
													fz={theme.fontSizes.mdLg}
													fw={600}
												>
													{vaccine.vaccineName}
												</Text>
												<Box
													display="flex"
													style={{ gap: '8px' }}
												>
													{Array.from({
														length: vaccine.totalRequiredDoses,
													}).map((_, index) => (
														<Box
															key={`circle-${index}`}
															w={12}
															h={12}
															bg={
																index <
																vaccine.completedDoses
																	? '#729BED'
																	: '#D9D9D9'
															}
															style={{
																borderRadius:
																	'50%',
															}}
														/>
													))}
												</Box>
											</Box>
										</Box>
									)
								)}
							</Box>
						)}
					</Box>
					<Box mt="xl">
						<Text fw={700} fz="lg" mb="xl">
							특이사항
						</Text>
						{categoryRecords.length === 0 ? (
							<EmptyState />
						) : (
							<Box display="flex" my="12 40" style={{ gap: 4 }}>
								{categoryRecords
									.filter(
										(item: CategoryItem) =>
											Array.isArray(item.behavior) &&
											item.behavior.length > 0
									)
									.map((item: CategoryItem) => (
										<Box
											key={item.id}
											p="10 20"
											bg={theme.colors.brand[13]}
											style={{ borderRadius: '20px' }}
										>
											<Text c="#FFFFFF" fz="md" fw={600}>
												{item.behavior[0]}
											</Text>
										</Box>
									))}
							</Box>
						)}
					</Box>
				</Box>
			)}

			<ActionTab
				onPublishSuccess={handlePublishSuccess}
				captureRef={captureRef}
			/>
			<Button
				w={42}
				h={42}
				radius="xl"
				bg="brand.7"
				c="white"
				style={{
					position: 'fixed',
					bottom: isReactNativeWebView ? 0 : 80,
					right: 20,
					padding: 0,
					zIndex: 1000,
				}}
				onClick={openRecordModal}
			>
				<IconCalendarCode size={24} stroke={3} />
			</Button>
		</Box>
	);
};

export default ReportContent;

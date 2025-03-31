'use client';

import MobileLayout from '@/components/mantine/MobileLayout';
import ProfileMetrics from '@/components/metrics/ProfileMetrics';
import instance from '@/utils/axios';
import { Box, Flex, Image, Stack, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// 증상 타입 정의
interface SymptomItem {
	id: string;
	symptom: string;
}

// 기록 타입 정의
interface SymptomRecord {
	id: string;
	type: string;
	startTime: string;
	endTime: string | null;
	symptom: string;
	severity: string;
	memo: string | null;
}

// 날짜별 그룹화된 기록 인터페이스
interface GroupedRecords {
	[date: string]: SymptomRecord[];
}

// 아이 정보에 대한 인터페이스 정의
interface ChildProfile {
	id: string;
	name: string;
	birthDate: string;
	gender: 'M' | 'F';
	weight: number;
	height: number;
	headCircumference: number;
	ageType: string;
	allergies: string[];
	symptoms: string[];
	memo: string;
	createdAt: string;
	updatedAt: string;
	// 추가 계산 필드
	age?: number;
	formattedBirthDate?: string;
}

// API 응답 인터페이스
interface ApiResponse {
	message: string;
	data: ChildProfile;
}

// 만 나이 계산 함수
const calculateAge = (birthDate: string): number => {
	const birth = new Date(birthDate);
	const today = new Date();

	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();

	// 생일이 아직 지나지 않았으면 나이에서 1을 뺌
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birth.getDate())
	) {
		age--;
	}

	return age;
};

// 날짜 포맷 함수 (YYYY-MM-DD)
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};

// 시간 포맷 함수 (HH:MM)
const formatTime = (dateString: string): string => {
	const date = new Date(dateString);
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');

	return `${hours}:${minutes}`;
};

// 심각도에 따른 색상 반환
const getSeverityColor = (severity: string): string => {
	switch (severity) {
		case 'HIGH':
			return 'red';
		case 'MEDIUM':
			return 'orange';
		case 'LOW':
			return 'green';
		default:
			return 'gray';
	}
};

const App = () => {
	const navigate = useRouter();
	const searchParams = useSearchParams();
	const [profile, setProfile] = useState<ChildProfile | null>(null);
	const [symptoms, setSymptoms] = useState<SymptomItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// URL에서 chldrnNo 파라미터 가져오기
				const chldrnNo = searchParams.get('chldrnNo');

				if (chldrnNo) {
					const response = await instance.get<ApiResponse>(
						`child/getChildInfo?childId=${chldrnNo}`
					);

					const childData = response.data.data;

					// 데이터에 만 나이 추가
					const profileData: ChildProfile = {
						...childData,
						age: calculateAge(childData.birthDate),
						formattedBirthDate: formatDate(childData.birthDate),
					};

					setProfile(profileData);
				} else {
					setError('URL에 chldrnNo 파라미터가 없습니다.');
					console.error('URL에 chldrnNo 파라미터가 없습니다.');
				}
			} catch (error) {
				setError('데이터를 불러오는 중 오류가 발생했습니다.');
				console.error('데이터 불러오기 실패:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [searchParams]); // searchParams가 변경될 때마다 재실행

	useEffect(() => {
		const fetchSymptoms = async () => {
			try {
				const childId = searchParams.get('chldrnNo');

				if (!childId) {
					setError('아이 정보가 없습니다.');
					setLoading(false);
					return;
				}

				// 오늘 날짜 구하기
				const today = new Date();
				const formattedToday = formatDate(today.toISOString());

				// API 호출
				const response = await instance.get(
					`/record?childId=${childId}&type=SYMPTOM&startDate=${formattedToday}`
				);

				const allRecords = response.data.data;

				// 3일치 데이터만 필터링
				const last3Days: GroupedRecords = {};
				const dates = Object.keys(allRecords)
					.sort()
					.reverse()
					.slice(0, 3);

				dates.forEach((date) => {
					last3Days[date] = allRecords[date];
				});

				// 증상만 추출하는 함수
				const extractSymptoms = () => {
					const symptomsWithIds: { id: string; symptom: string }[] =
						[];

					Object.keys(last3Days).forEach((date) => {
						last3Days[date].forEach((record) => {
							if (record.symptom && record.symptom !== null) {
								symptomsWithIds.push({
									id: record.id,
									symptom: record.symptom,
								});
							}
						});
					});

					// 증상 기준으로 중복 제거 (동일 증상이라도 id가 다르면 다른 항목으로 간주)
					const uniqueSymptoms = Array.from(
						new Map(
							symptomsWithIds.map((item) => [item.symptom, item])
						).values()
					);

					return uniqueSymptoms;
				};

				// 증상 배열 저장
				const extractedSymptoms = extractSymptoms();
				setSymptoms(extractedSymptoms);
			} catch (error) {
				console.error('증상 기록 조회 실패:', error);
				setError('증상 기록을 불러오는 중 오류가 발생했습니다.');
			} finally {
				setLoading(false);
			}
		};

		fetchSymptoms();
	}, [searchParams]);

	const handleBack = () => navigate.back();

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="리포트 상세보기"
			showBottomNav={true}
			onBack={handleBack}
		>
			{loading ? (
				<Text mt="xl">데이터 로딩 중...</Text>
			) : (
				<Box px={16}>
					{profile && (
						<Box
							style={{
								borderRadius: '8px',
							}}
							bg="brand.0"
							p="md"
							mb="xl"
						>
							<Flex justify="space-between" mb="md">
								<Stack gap="md">
									<ProfileMetrics
										label={`${profile.formattedBirthDate?.substring(
											0,
											10
										)} 출생`}
										value={profile.name}
									/>
									<ProfileMetrics
										label="나이 (만)"
										value={String(profile.age)}
									/>
								</Stack>

								<Stack gap={8}>
									<Flex align="end" justify="end">
										<Image
											src="https://heidimoon.cafe24.com/renwal/test2/barcode.png"
											width={76}
											height={76}
											alt="바코드"
										/>
									</Flex>
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
					<Text fw={700} fz="lg">
						아기의 증상은요
					</Text>
					{symptoms.length === 0 ? (
						<Text>증상이 없습니다</Text>
					) : (
						<Box display="flex" my="12 40" style={{ gap: 4 }}>
							{symptoms.map((item) => (
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
					<Text fw={700} fz="lg">
						아기의 예방접종 이력이에요
					</Text>
				</Box>
			)}
		</MobileLayout>
	);
};

export default App;

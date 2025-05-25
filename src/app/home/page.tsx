'use client';

import { useEffect, useState } from 'react';
import { MetricsSection } from '@/components/metrics/MetricsSection';
import ProfileCarousel from './ProfileCarousel';
import useAuth from '@/hook/useAuth';
import useChldrnListStore from '@/store/useChldrnListStore';
import MobileLayout from '@/components/mantine/MobileLayout';
import {
	Group,
	Text,
	Image,
	Stack,
	Flex,
	Container,
	useMantineTheme,
	Box,
	Paper,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuthStore } from '@/store/useAuthStore';
import { common } from '@/utils/common';
import instance from '@/utils/axios';
import { NewsItem } from '../more/news/page';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/EmptyState/EmptyState';
import { NextVaccineInfo } from '../api/vaccine/next/route';
import sendToRn from '@/utils/sendToRn';
import { useMediaQuery } from '@mantine/hooks';

interface PhysicalStats {
	chldrnBdwgh: number;
	chldrnHead: number;
	chldrnHeight: number;
	chldrnNo: string;
}

export interface KidProfile {
	age: number;
	atchCode: string;
	chldrnBrthdy?: string;
	chldrnInfoList: [PhysicalStats];
	chldrnNm: string;
	chldrnNo: string;
	days: number;
	weeks: number;
	gender: string;
}

interface RecordMetricsDetail {
	label: string;
	value: string;
}

interface RecordMetrics {
	title: string;
	isOpen: boolean;
	onToggle: () => void;
	details: RecordMetricsDetail[];
}

export interface KidRecord {
	profile: KidProfile;
	metrics: RecordMetrics[];
}

interface Child {
	id: string;
	name: string;
	birthDate: string;
	gender: string;
	weight: number | null;
	height: number | null;
	headCircumference: number | null;
	ageType: string | null;
	allergies: string[];
	symptoms: string[];
	memo: string | null;
	profileImageUrl: string | null;
}

const createMockMetrics = (
	kidName: string,
	kidIndex: number,
	toggleMetric: (kidIndex: number, metricIndex: number) => void
) => [
	{
		title: '수면패턴',
		isOpen: true,
		onToggle: () => toggleMetric(kidIndex, 0),
		details: [
			{ label: '간격', value: '3회' },
			{ label: '횟수', value: '6회' },
		],
	},
	{
		title: '식사패턴',
		isOpen: true,
		onToggle: () => toggleMetric(kidIndex, 1),
		details: [
			{ label: '간격', value: '2시간' },
			{ label: '횟수', value: '6회' },
		],
	},
	{
		title: '배변패턴',
		isOpen: true,
		onToggle: () => toggleMetric(kidIndex, 2),
		details: [
			{ label: '대변', value: '6회' },
			{ label: '소변', value: '6회' },
			{
				label: '대변색깔',
				value: kidName === '정민규' ? '묽은 변' : '정상',
			},
		],
	},
];

// 아이 데이터 가공 함수 분리
const processChildData = (
	children: Child[],
	toggleMetric: (kidIndex: number, metricIndex: number) => void
) => {
	const { getKoreanAge } = common();

	return children.map((child, index) => {
		const { weeks, days, age } = getKoreanAge(child.birthDate);

		return {
			profile: {
				chldrnNm: child.name,
				chldrnBrthdy: child.birthDate,
				ageType: child.ageType ?? '',
				age: age,
				gender: child.gender,
				chldrnNo: child.id,
				atchCode: '',
				days,
				weeks,
				chldrnInfoList: [
					{
						chldrnBdwgh: child.weight ?? 0,
						chldrnHead: child.headCircumference ?? 0,
						chldrnHeight: child.height ?? 0,
						chldrnNo: child.id,
					},
				] as [PhysicalStats],
			},
			metrics: createMockMetrics(child.name, index, toggleMetric),
		};
	});
};

const App: React.FC = () => {
	const theme = useMantineTheme();
	const [kidsData, setKidsData] = useState<KidRecord[]>([]);
	const [newsData, setNewsData] = useState<NewsItem[]>([]);
	const [vaccineData, setVaccineData] = useState<NextVaccineInfo[]>([]);
	const [crtChldrnNoKidIndex, setCrtChldrnNoKidIndex] = useState(0);
	const { setChldrnList, children } = useChldrnListStore();
	const { getToken } = useAuth();
	const { setCrtChldrnNo, token, crtChldrnNo } = useAuthStore();
	const router = useRouter();
	const isSmallScreen = useMediaQuery('(max-width: 350px)');

	useEffect(() => {
		// 토큰이 이미 있으면 바로 데이터 가져오기
		if (token) {
			fetchChildrenData();
		}

		fetchNewsData();
		// 토큰이 설정되면 데이터 가져오기
		const handleTokenSet = (event: CustomEvent) => {
			fetchChildrenData();
		};

		window.addEventListener('tokenSet', handleTokenSet as EventListener);

		return () => {
			window.removeEventListener(
				'tokenSet',
				handleTokenSet as EventListener
			);
		};
	}, [token]);

	useEffect(() => {}, []);

	const fetchChildrenData = async () => {
		const token = await getToken();

		try {
			const response = await fetch('/api/child/getChildrenInfo', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();
			console.log('data', data);
			if (response.ok && data.data) {
				handleChildrenData(data.data);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const fetchNewsData = async () => {
		try {
			// 처방전 상세 정보를 가져오는 API 호출
			const response = await instance.get('/news?limit=3');

			setNewsData(response.data.data);
		} catch (err) {
			console.error('뉴스 정보 조회 오류:', err);
		}
	};

	const fetchNextVaccinData = async () => {
		try {
			// children 배열과 인덱스가 유효한지 먼저 확인
			if (!children || children.length === 0) {
				console.log('아직 children 데이터가 로드되지 않았습니다');
				return;
			}

			if (
				crtChldrnNoKidIndex === undefined ||
				crtChldrnNoKidIndex < 0 ||
				crtChldrnNoKidIndex >= children.length
			) {
				console.log('유효하지 않은 인덱스:', crtChldrnNoKidIndex);
				return;
			}

			const childData = children[crtChldrnNoKidIndex];

			if (!childData || !childData.birthDate) {
				console.log('선택된 아이의 생일 정보가 없습니다:', childData);
				return;
			}

			const birthDate = childData.birthDate.substring(0, 10);

			console.log('요청할 생일 정보:', birthDate);

			const response = await instance.get('vaccine/next', {
				params: {
					birthDate: birthDate,
				},
			});

			console.log(response.data.data);
			setVaccineData(response.data.data);
		} catch (err) {
			console.error('다음 백신 이력 조회 오류', err);
		}
	};

	useEffect(() => {
		fetchNextVaccinData();
	}, [crtChldrnNoKidIndex, crtChldrnNo]);

	// 데이터 처리 함수를 분리
	const handleChildrenData = (children: Child[]) => {
		if (children.length > 0) {
			// 로그인과 동시에 아이번호  zustand 에 저장
			setCrtChldrnNo(children[0].id);
		} else {
			sendToRn({ type: 'NAV', data: { route: '/addchild' } });
		}

		const childrenToStore = children.map((child) => ({
			chldrnNo: child.id,
			chldrnNm: child.name,
			chldrnSexdstn: child.gender,
			profileImageUrl: child.profileImageUrl,
			birthDate: child.birthDate,
		}));

		setChldrnList(childrenToStore);
		const processedData = processChildData(children, toggleMetric);
		setKidsData(processedData);
	};
	// 특정 메트릭 업데이트 함수 분리
	const updateMetricState = (metrics: any[], metricIndex: number) => {
		return metrics.map((metric, mIdx) => {
			if (mIdx === metricIndex) {
				return {
					...metric,
					isOpen: !metric.isOpen,
				};
			}
			return metric;
		});
	};

	// 메인 토글 함수
	const toggleMetric = (kidIndex: number, metricIndex: number) => {
		setKidsData((prevData) => {
			return prevData.map((kid, idx) => {
				if (idx === kidIndex) {
					return {
						...kid,
						metrics: updateMetricState(kid.metrics, metricIndex),
					};
				}
				return kid;
			});
		});
	};

	const currentSlide = kidsData[crtChldrnNoKidIndex];

	return (
		<MobileLayout
			showHeader={false}
			headerType="profile"
			title="홈"
			showBottomNav={true}
			currentRoute="/"
		>
			<Container p="0">
				<Group justify="space-between" align="center" w="100%" p="20">
					<Text size="xl" ff="HakgyoansimWoojuR" c="#222222">
						오늘의아이
					</Text>
					<Image
						src="https://heidimoon.cafe24.com/renwal/test2/Bell.svg"
						alt="알림"
					/>
				</Group>
				<ProfileCarousel
					profiles={kidsData}
					onSlideChange={setCrtChldrnNoKidIndex}
				/>
				<Box px="1.25rem" mb="8rem">
					<Box
						bg={theme.colors.brand[7]}
						p="lg"
						display="flex"
						pos="relative"
						style={{
							borderRadius: '8px',
							alignItems: 'center',
							cursor: 'pointer',
							height: '70px',
							gap: '4px',
						}}
						onClick={() => {
							sendToRn({
								type: 'NAV',
								data: { route: '/record' },
							});
						}}
					>
						<IconPlus color="#FFFFFF" size={12} strokeWidth={4} />
						<Text
							c="white"
							fw={700}
							fz={isSmallScreen ? '0.875rem' : 'md'}
						>
							오늘의 아이 증상 기록하기
						</Text>

						<Image
							src="/logo_sub.svg"
							alt=""
							pos="absolute"
							bottom={0}
							right={10}
							w="auto"
							h="auto"
							style={{
								objectFit: 'contain', // 비율 유지하면서 컨테이너 안에 맞춤
							}}
						/>
					</Box>
					<Group gap="xs" align="center" mt="md">
						<Flex
							p="md"
							bg="white"
							justify="space-between"
							align="center"
							flex={1}
							styles={{
								root: {
									border: '1px solid #d5d5d5',
									borderRadius: '8px',
									flex: '1',
									textDecoration: 'none',
								},
							}}
							onClick={() => {
								sendToRn({
									type: 'NAV',
									data: { route: '/map' },
								});
							}}
						>
							<Text
								fw={700}
								fz="md"
								c="#222222"
								style={{ lineHeight: '1.2' }}
							>
								지금 문 연
								<br />
								병원/약국
							</Text>
							<Image
								src="/pharmacy.svg"
								alt="약국 재고조회"
								width={27}
								height={36}
							/>
						</Flex>

						<Flex
							p="md"
							bg="white"
							justify="space-between"
							align="start"
							styles={{
								root: {
									border: '1px solid #d5d5d5',
									borderRadius: '8px',
									flex: '1',
									textDecoration: 'none',
								},
							}}
							onClick={() => {
								sendToRn({
									type: 'NAV',
									data: { route: '/hospital' },
								});
							}}
						>
							<Text
								fw={700}
								fz="md"
								c="#222222"
								style={{
									lineHeight: '1.2',
									whiteSpace: 'nowrap',
								}}
							>
								진료받은
								<br />
								기록
							</Text>
							<Box
								display="flex"
								style={{
									justifyContent: 'flex-end',
									gap: '4px',
								}}
							>
								<Image
									src="/ebene_1.svg"
									alt="진료 기록"
									width={27}
									height={37}
									visibleFrom="xss"
								/>
								<Image
									src="/ebene_2.svg"
									alt="진료 기록"
									width={27}
									height={37}
								/>
							</Box>
						</Flex>
					</Group>
					{currentSlide && (
						<MetricsSection
							labelText={`오늘의 ${currentSlide.profile.chldrnNm} 성장기록이에요`}
							metricsData={currentSlide.metrics}
						/>
					)}
					<Box mb="40">
						<Text
							mb="24"
							c={theme.other.fontColors.primary}
							fz={theme.fontSizes.lg}
							fw={700}
						>
							다가오는 예방접종을 알려드려요
						</Text>

						{vaccineData.length === 0 ? (
							<EmptyState />
						) : (
							<Box
								style={{
									boxShadow:
										'0px 0px 10px 0px rgba(0, 0, 0, 0.15)',
									borderRadius: '20px',
									gap: '16px',
									flexDirection: 'column',
								}}
								p="md"
								display="flex"
							>
								{vaccineData.map((vaccine, index) => (
									<Box key={index + 1}>
										<Box
											display="flex"
											w="100%"
											style={{
												justifyContent: 'space-between',
											}}
										>
											<Text
												fz={theme.fontSizes.mdLg}
												fw={600}
											>
												{vaccine.diseaseName}
											</Text>
											<Text
												fz={theme.fontSizes.mdLg}
												fw={600}
											>
												{vaccine.scheduledDate}
											</Text>
										</Box>
									</Box>
								))}
							</Box>
						)}
					</Box>

					<Box>
						<Text
							c={theme.other.fontColors.primary}
							fz={theme.fontSizes.lg}
							fw={700}
						>
							아이 건강 꿀팁
						</Text>
						<Stack gap="md" mt="md">
							{newsData.map((news) => (
								<Paper
									key={news.id}
									onClick={() => {
										router.push(`/more/news/${news.id}`);
									}}
								>
									<Image
										src={news.imageUrl[0].replace(
											'/public',
											''
										)}
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
										<Text c="#000000" fz="1rem" fw={700}>
											{news.title[0]}
										</Text>
									</Box>
								</Paper>
							))}
						</Stack>
					</Box>
				</Box>
			</Container>
		</MobileLayout>
	);
};

export default App;

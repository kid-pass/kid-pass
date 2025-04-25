'use client';

import React, { useState, useEffect } from 'react';
import {
	Box,
	Group,
	Title,
	Button,
	Grid,
	Text,
	Container,
	useMantineTheme,
	Loader,
	Badge,
	Tooltip,
} from '@mantine/core';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import WeeklyDatePicker from '@/components/datePicker/WeekCarousel';
import dayjs from 'dayjs';
import MobileLayout from '@/components/mantine/MobileLayout';
import useAuth from '@/hook/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

// 백신 유형별 색상 매핑
const vaccineColorMap = {
	BCG: '#6b7ae3', // 결핵
	HepB: '#f0ad4e', // B형간염
	DTaP: '#5bc0de', // 디프테리아/파상풍/백일해
	Tdap: '#5bc0de', // 파상풍/디프테리아/백일해 추가접종
	IPV: '#5cb85c', // 폴리오
	Hib: '#d9534f', // b형 헤모필루스
	PCV: '#17a2b8', // 폐렴구균
	MMR: '#f06292', // 홍역/유행성이하선염/풍진
	VAR: '#ba68c8', // 수두
	HepA: '#ff7043', // A형간염
	IJEV: '#9575cd', // 일본뇌염 불활성화
	LJEV: '#7986cb', // 일본뇌염 약독화 생백신
	HPV: '#4db6ac', // 사람유두종바이러스
	RV1: '#81c784', // 로타바이러스 1가
	RV5: '#81c784', // 로타바이러스 5가
};

const vaccineNameMap = {
	BCG: '결핵',
	HepB: 'B형간염',
	DTaP: '디프테리아/파상풍/백일해',
	Tdap: '파상풍/디프테리아/백일해',
	IPV: '소아마비',
	Hib: 'b형 헤모필루스',
	PCV: '폐렴구균',
	MMR: '홍역/유행성이하선염/풍진',
	VAR: '수두',
	HepA: 'A형간염',
	IJEV: '일본뇌염(불활성화)',
	LJEV: '일본뇌염(생백신)',
	HPV: '사람유두종바이러스',
	RV1: '로타바이러스(1가)',
	RV5: '로타바이러스(5가)',
};

interface VaccineSchedule {
	id: string;
	vacntnId: string;
	vacntnIctsd: string;
	vacntnDoseNumber: number;
	vacntnInoclDt: string;
	childId: string;
	diseaseName?: string;
	vaccineName?: string;
	isCompleted?: boolean; // 접종 완료 여부
	actualDate?: string; // 실제 접종일
}

interface MonthWithVaccine {
	year: number;
	month: number;
}

const VaccineCalendar = () => {
	const [viewType] = useState('calendar');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [vaccineSchedules, setVaccineSchedules] = useState<VaccineSchedule[]>(
		[]
	);
	const [loading, setLoading] = useState(false);
	const [monthsLoading, setMonthsLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState('all');
	const { getToken } = useAuth();
	const theme = useMantineTheme();
	const { crtChldrnNo } = useAuthStore();

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// 이전 달의 마지막 날 정보
	const prevMonthLastDay = new Date(year, month, 0);
	const prevMonthLastDate = prevMonthLastDay.getDate();

	const firstDayOfWeek = firstDay.getDay();
	const lastDate = lastDay.getDate();

	const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
	const monthNames = [
		'1월',
		'2월',
		'3월',
		'4월',
		'5월',
		'6월',
		'7월',
		'8월',
		'9월',
		'10월',
		'11월',
		'12월',
	];
	const [monthsWithVaccines, setMonthsWithVaccines] = useState<MonthWithVaccine[]>([]);

	// 백신 일정이 있는 월 목록 조회
	useEffect(() => {
		const fetchVaccineMonths = async () => {
			if (!crtChldrnNo) return;
			
			try {
				setMonthsLoading(true);
				const token = await getToken();
				const response = await fetch(
					`/api/vaccine/months?childId=${crtChldrnNo}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setMonthsWithVaccines(data.data);
					
					// 만약 현재 달에 백신 일정이 없다면, 가장 가까운 백신 일정이 있는 달로 이동
					if (data.data.length > 0) {
						const currentYearMonth = { year, month: month + 1 };
						const hasCurrentMonth = data.data.some(
							(m: MonthWithVaccine) => 
								m.year === currentYearMonth.year && 
								m.month === currentYearMonth.month
						);
						
						if (!hasCurrentMonth) {
							// 현재 날짜와 가장 가까운 달 찾기
							const closest = findClosestMonth(data.data, currentYearMonth);
							if (closest) {
								setCurrentDate(new Date(closest.year, closest.month - 1, 1));
							}
						}
					}
				} else {
					console.error('백신 일정 월 목록 조회 실패');
				}
			} catch (error) {
				console.error('백신 일정 월 목록 조회 에러:', error);
			} finally {
				setMonthsLoading(false);
			}
		};

		fetchVaccineMonths();
	}, [crtChldrnNo]);

	// 현재 날짜와 가장 가까운 백신 일정이 있는 달 찾기
	const findClosestMonth = (months: MonthWithVaccine[], current: { year: number, month: number }) => {
		if (months.length === 0) return null;
		
		// 날짜 차이 계산 (절대값 기준)
		return months.reduce((closest, month) => {
			const currentDiff = Math.abs(
				(current.year * 12 + current.month) - 
				(closest.year * 12 + closest.month)
			);
			
			const newDiff = Math.abs(
				(current.year * 12 + current.month) - 
				(month.year * 12 + month.month)
			);
			
			return newDiff < currentDiff ? month : closest;
		}, months[0]);
	};

	// 백신 일정 조회
	useEffect(() => {
		const fetchVaccineSchedules = async () => {
			if (!crtChldrnNo) return;
			
			try {
				setLoading(true);

				const token = await getToken();
				const response = await fetch(
					`/api/vaccine/schedule?childId=${crtChldrnNo}&year=${year}&month=${
						month + 1
					}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setVaccineSchedules(data.data);
				} else {
					console.error('백신 일정 조회 실패');
				}
			} catch (error) {
				console.error('백신 일정 조회 에러:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchVaccineSchedules();
	}, [year, month, crtChldrnNo]); // currentDate가 변경될 때마다 새로운 데이터 요청

	// 달력에 표시할 날짜 배열 생성
	const getDatesArray = () => {
		const dates = [];

		// 이전 달의 날짜 추가
		for (let i = 0; i < firstDayOfWeek; i++) {
			const prevDate = prevMonthLastDate - firstDayOfWeek + i + 1;
			dates.push({
				day: prevDate,
				type: 'prev',
				date: new Date(year, month - 1, prevDate),
			});
		}

		// 현재 달의 날짜 추가
		for (let i = 1; i <= lastDate; i++) {
			dates.push({
				day: i,
				type: 'current',
				date: new Date(year, month, i),
			});
		}

		// 다음 달의 날짜 추가 (7x6=42 그리드를 채우기 위해)
		const remainingDays = 42 - dates.length;
		for (let i = 1; i <= remainingDays; i++) {
			dates.push({
				day: i,
				type: 'next',
				date: new Date(year, month + 1, i),
			});
		}

		return dates;
	};

	const getWeeksArray = () => {
		const dates = getDatesArray();
		const weeks = [];

		for (let i = 0; i < dates.length; i += 7) {
			weeks.push(dates.slice(i, i + 7));
		}

		return weeks;
	};

	// 날짜에 백신 일정이 있는지 확인
	const getVaccinesForDate = (date: Date) => {
		const dateString = date.toISOString().split('T')[0];

		// 필터링 로직
		let filteredSchedules = vaccineSchedules.filter(
			(schedule) => schedule.vacntnInoclDt === dateString
		);

		if (selectedFilter && selectedFilter !== 'all') {
			// 선택된 특정 백신만 필터링
			filteredSchedules = filteredSchedules.filter(
				(schedule) => schedule.vacntnIctsd === selectedFilter
			);
		}

		return filteredSchedules;
	};

	const getAvailableVaccineFilters = () => {
		// 현재 표시 중인 월의 백신 종류 추출 (중복 제거)
		const uniqueVaccineCodes = new Set<string>();

		// 해당 월에 있는 백신 코드 수집
		vaccineSchedules.forEach((schedule) => {
			uniqueVaccineCodes.add(schedule.vacntnIctsd);
		});

		// 중복 없이 정렬된 배열로 변환
		const availableVaccineCodes = Array.from(uniqueVaccineCodes).sort();

		// 각 백신 코드별 필터 옵션 생성
		return availableVaccineCodes.map((code) => ({
			value: code,
			label: vaccineNameMap[code as keyof typeof vaccineNameMap] || code,
			color:
				vaccineColorMap[code as keyof typeof vaccineColorMap] || '#888',
		}));
	};

	// 현재 월이 백신 일정이 있는 월인지 확인
	const isCurrentMonthWithVaccines = () => {
		return monthsWithVaccines.some(
			(m) => m.year === year && m.month === month + 1
		);
	};

	// 이전 백신 일정이 있는 달로 이동 가능한지 확인
	const hasPrevMonth = () => {
		return monthsWithVaccines.some(
			(m) => 
				m.year < year || 
				(m.year === year && m.month < month + 1)
		);
	};

	// 다음 백신 일정이 있는 달로 이동 가능한지 확인
	const hasNextMonth = () => {
		return monthsWithVaccines.some(
			(m) => 
				m.year > year || 
				(m.year === year && m.month > month + 1)
		);
	};

	// 이전 백신 일정이 있는 달로 이동
	const handlePrevMonth = () => {
		if (monthsLoading || !hasPrevMonth()) return;

		const currentYearMonth = { year, month: month + 1 }; // JavaScript month는 0부터 시작

		// 이전 달 중 가장 가까운 백신 일정이 있는 달 찾기
		const prevMonths = monthsWithVaccines
			.filter(
				(m) =>
					m.year < currentYearMonth.year ||
					(m.year === currentYearMonth.year &&
						m.month < currentYearMonth.month)
			)
			.sort((a, b) => {
				// 역순 정렬로 가장 가까운 이전 달이 마지막에 오도록
				if (a.year !== b.year) return b.year - a.year;
				return b.month - a.month;
			});

		if (prevMonths.length > 0) {
			// 가장 가까운 이전 백신 일정이 있는 달로 이동
			const prevMonth = prevMonths[0];
			setCurrentDate(new Date(prevMonth.year, prevMonth.month - 1, 1));
		}
	};

	// 다음 백신 일정이 있는 달로 이동
	const handleNextMonth = () => {
		if (monthsLoading || !hasNextMonth()) return;

		const currentYearMonth = { year, month: month + 1 }; // JavaScript month는 0부터 시작

		// 다음 달 중 가장 가까운 백신 일정이 있는 달 찾기
		const nextMonths = monthsWithVaccines
			.filter(
				(m) =>
					m.year > currentYearMonth.year ||
					(m.year === currentYearMonth.year &&
						m.month > currentYearMonth.month)
			)
			.sort((a, b) => {
				// 오름차순 정렬로 가장 가까운 다음 달이 첫번째에 오도록
				if (a.year !== b.year) return a.year - b.year;
				return a.month - b.month;
			});

		if (nextMonths.length > 0) {
			// 가장 가까운 다음 백신 일정이 있는 달로 이동
			const nextMonth = nextMonths[0];
			setCurrentDate(new Date(nextMonth.year, nextMonth.month - 1, 1));
		}
	};

	// 백신 표시를 위한 인디케이터 렌더링
	const renderVaccineIndicators = (date: Date) => {
		const vaccines = getVaccinesForDate(date);

		if (vaccines.length === 0) return null;

		return (
			<Group gap={2} justify="center" mt={2}>
				{vaccines.map((vaccine, index) => (
					<Tooltip
						key={index}
						label={`${vaccine.diseaseName || ''} (${
							vaccine.vaccineName || ''
						}) ${vaccine.vacntnDoseNumber}차 - ${
							vaccine.isCompleted ? '접종완료' : '접종예정'
						}`}
					>
						<Box
							style={{
								width: '8px',
								height: '8px',
								borderRadius: '50%',
								// 접종 미완료는 점선 테두리, 완료는 채워진 원으로 표시
								border: vaccine.isCompleted
									? 'none'
									: `1px solid ${
											vaccineColorMap[
												vaccine.vacntnIctsd as keyof typeof vaccineColorMap
											] || '#888'
									  }`,
								// 접종 미완료는 배경색 투명하게
								backgroundColor: vaccine.isCompleted
									? vaccineColorMap[
											vaccine.vacntnIctsd as keyof typeof vaccineColorMap
									  ] || '#888'
									: 'transparent',
							}}
						/>
					</Tooltip>
				))}
			</Group>
		);
	};

	return (
		<MobileLayout title="접종 달력">
			<Container size="sm" p={0}>
				<Group justify="space-between" mb="md" px="16">
					<Group gap="xs">
						<Title order={4}>
							{year}년 {monthNames[month]}
						</Title>
						<Box>
							<Button
								variant="subtle"
								p={0}
								h={24}
								style={{ 
									all: 'unset', 
									cursor: hasPrevMonth() ? 'pointer' : 'not-allowed',
									opacity: hasPrevMonth() ? 1 : 0.5
								}}
								onClick={handlePrevMonth}
								disabled={monthsLoading || !hasPrevMonth()}
							>
								<IconChevronUp size={20} />
							</Button>
							<Button
								variant="subtle"
								p={0}
								h={24}
								style={{ 
									all: 'unset', 
									cursor: hasNextMonth() ? 'pointer' : 'not-allowed',
									opacity: hasNextMonth() ? 1 : 0.5
								}}
								onClick={handleNextMonth}
								disabled={monthsLoading || !hasNextMonth()}
							>
								<IconChevronDown size={20} />
							</Button>
						</Box>
					</Group>
				</Group>

				{/* 백신 필터 */}
				<Group
					gap="xs"
					px="md"
					mb="md"
					style={{ overflowX: 'auto' }}
				>
					{getAvailableVaccineFilters().map((option) => (
						<Badge
							key={option.value}
							size="lg"
							variant="light"
							style={{
								backgroundColor: `${option.color}20`, // 20% 투명도
								color: option.color,
							}}
						>
							{option.label}
						</Badge>
					))}
				</Group>

				<Box px="16" mb="16">
					<Group gap="md">
						<Group gap="xs">
							<Box
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									backgroundColor: theme.colors.blue[5],
								}}
							/>
							<Text size="sm">접종 완료</Text>
						</Group>
						<Group gap="xs">
							<Box
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									border: `1px solid ${theme.colors.blue[5]}`,
									backgroundColor: 'transparent',
								}}
							/>
							<Text size="sm">접종 예정</Text>
						</Group>
					</Group>
				</Box>

				{loading || monthsLoading ? (
					<Box
						py="xl"
						style={{ display: 'flex', justifyContent: 'center' }}
					>
						<Loader />
					</Box>
				) : !isCurrentMonthWithVaccines() && monthsWithVaccines.length > 0 ? (
					<Box py="xl" px="md" style={{ textAlign: 'center' }}>
						<Text>현재 월에는 백신 일정이 없습니다.</Text>
						<Text size="sm" mt="sm">
							화살표를 클릭하여 백신 일정이 있는 달로 이동하세요.
						</Text>
					</Box>
				) : viewType === 'calendar' ? (
					<>
						<Grid columns={7} gutter="xs" mb="xs">
							{weekDays.map((day) => (
								<Grid.Col span={1} key={day}>
									<Text
										ta="center"
										size="sm"
										fw={600}
										c="dimmed"
									>
										{day}
									</Text>
								</Grid.Col>
							))}
						</Grid>

						<Box>
							{getWeeksArray().map((week, weekIndex) => (
								<Grid
									key={weekIndex}
									columns={7}
									gutter="xs"
									style={{
										borderTop:
											'1px solid ' + theme.colors.gray[3],
										height: '4rem',
									}}
								>
									{week.map((date, dateIndex) => (
										<Grid.Col span={1} key={dateIndex}>
											<Box
												pt="xs"
												style={{
													textAlign: 'center',
													color:
														date.type !== 'current'
															? theme.colors
																	.gray[3]
															: theme.colors
																	.dark[8],
												}}
											>
												<Text size="md" fw={600}>
													{date.day}
												</Text>
												{renderVaccineIndicators(
													date.date
												)}
											</Box>
										</Grid.Col>
									))}
								</Grid>
							))}
						</Box>
					</>
				) : (
					<WeeklyDatePicker
						currentDate={dayjs(currentDate)}
						onSelect={(date) => {
							setCurrentDate(date.toDate());
						}}
					/>
				)}
			</Container>
		</MobileLayout>
	);
};

export default VaccineCalendar;





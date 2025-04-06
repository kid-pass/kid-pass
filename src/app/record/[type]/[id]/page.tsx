'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuth from '@/hook/useAuth';
import { TYPE_PATH_MAP } from '../../constants';
import MobileLayout from '@/components/mantine/MobileLayout';
import {
	Paper,
	Flex,
	Stack,
	Title,
	Text,
	Group,
	Button as MantineButton,
	AppShell,
	Box,
	Button,
} from '@mantine/core';
import dayjs from 'dayjs';

interface RecordDetailProps {
	params: Promise<{
		type: string;
		id: string;
	}>;
}

interface RecordInfo {
	label: string;
	value: string | number;
}

const RecordDetail = ({ params }: RecordDetailProps) => {
	const router = useRouter();
	const { getToken } = useAuth();
	const [record, setRecord] = useState<any>(null);
	const resolvedParams = use(params);

	useEffect(() => {
		const fetchRecord = async () => {
			try {
				const token = await getToken();
				const currentKid = localStorage.getItem('currentKid');

				if (!token || !currentKid) {
					return;
				}

				const response = await fetch(
					`/api/record/${resolvedParams.id}?type=${resolvedParams.type}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.ok) {
					const data = await response.json();
					setRecord(data.data);
				}
			} catch (error) {
				console.error('기록 조회 에러:', error);
			}
		};

		fetchRecord();
	}, [resolvedParams.id, resolvedParams.type]);

	const handleEdit = () => {
		const pathMap = {
			FEEDING: '/record/FEEDING',
			SLEEP: '/record/SLEEP',
			DIAPER: '/record/DIAPER',
			TEMPERATURE: '/record/TEMPERATURE',
			GROWTH: '/record/GROWTH',
			HEAD: '/record/HEAD',
			EMOTION: '/record/EMOTION',
			SYMPTOM: '/record/SYMPTOM',
			MEDICINE: '/record/MEDICINE',
			ETC: '/record/ETC',
		} as const;

		const path = pathMap[resolvedParams.type as keyof typeof pathMap];
		if (path) {
			router.push(`${path}?id=${resolvedParams.id}`);
		}
	};

	const handleDelete = async () => {
		if (!window.confirm('정말 삭제하시겠습니까?')) {
			return;
		}

		try {
			const token = await getToken();
			const response = await fetch(`/api/record/${resolvedParams.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				router.back();
			}
		} catch (error) {
			console.error('기록 삭제 에러:', error);
		}
	};

	const getRecordInfo = (record: any): RecordInfo[] => {
		const info: RecordInfo[] = [
			{
				label: '시작 시간',
				value: dayjs(record.startTime).format('YYYY-MM-DD HH:mm'),
			},
		];

		if (record.endTime) {
			info.push({
				label: '종료 시간',
				value: dayjs(record.endTime).format('YYYY-MM-DD HH:mm'),
			});
		}

		// 수유 기록
		if (record.type === 'FEEDING') {
			info.push(
				{ label: '수유 종류', value: record.mealType },
				{ label: '수유량', value: `${record.amount}${record.unit}` }
			);
		}

		// 배변 기록
		if (record.type === 'DIAPER') {
			info.push(
				{ label: '종류', value: record.diaperType },
				{ label: '색깔', value: record.diaperColor },
				{ label: '형태', value: record.diaperShape },
				{ label: '양', value: record.diaperAmount }
			);
		}

		// 수면 기록
		if (record.type === 'SLEEP') {
			info.push({ label: '수면 종류', value: record.sleepType });
		}

		// 체온 기록
		if (record.type === 'TEMPERATURE') {
			info.push({ label: '체온', value: record.temperature });
		}

		// 성장 기록
		if (record.type === 'GROWTH') {
			info.push({ label: '몸무게', value: record.weight });
			info.push({ label: '키', value: record.height });
			info.push({ label: '두위', value: record.headSize });
		}

		// 감정 기록
		if (record.type === 'EMOTION') {
			info.push({ label: '감정', value: record.emotion });
			info.push({ label: '특이증상', value: record.special });
		}

		// 특이증상 기록
		if (record.type === 'SYMPTOM') {
			info.push({ label: '증상', value: record.symptom });
			info.push({ label: '심각도', value: record.severity });
		}

		// 약 기록
		if (record.type === 'MEDICINE') {
			info.push({ label: '약 이름', value: record.medicine });
		}

		// 기타 기록
		if (record.type === 'ETC') {
			info.push({ label: '카테고리', value: record.category });
			info.push({ label: '행동 종류', value: record.behavior });
		}

		return info;
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title={`${
				TYPE_PATH_MAP[
					resolvedParams.type as keyof typeof TYPE_PATH_MAP
				] ?? '기록'
			} 상세`}
			onBack={() => router.back()}
			showBottomNav={false}
		>
			{record && (
				<Stack p="md" gap="md">
					{getRecordInfo(record).map((info, index) => (
						<Flex
							key={index}
							justify="space-between"
							align="center"
							py={8}
							style={{
								borderBottom:
									'1px solid var(--mantine-color-gray-2)',
							}}
						>
							<Text fw={500} c="gray.7">
								{info.label}
							</Text>
							<Text>{info.value}</Text>
						</Flex>
					))}

					{record.memo && (
						<Paper withBorder p="md" mt="md" bg="gray.0">
							<Title order={6} mb="xs" c="gray.7">
								메모
							</Title>
							<Text>{record.memo}</Text>
						</Paper>
					)}
				</Stack>
			)}
			<AppShell.Footer>
				<Box p="md">
					<Group grow>
						<Button c="white" bg="brand.7" onClick={handleEdit}>
							수정하기
						</Button>
						<Button bg="red" c="white" onClick={handleDelete}>
							삭제하기
						</Button>
					</Group>
				</Box>
			</AppShell.Footer>
		</MobileLayout>
	);
};

export default RecordDetail;

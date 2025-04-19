'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Box,
	Stack,
	Textarea,
	Button,
	Text,
	Group,
	AppShell,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '@/hook/useAuth';
import { TYPE_MAP, TYPE_TIP_MAP } from '../constants';
import { DateTimePicker } from '@mantine/dates';
// 타입별 필드 컴포넌트들
import FeedingFields from './fields/FeedingFields';
import MedicineFields from './fields/MedicineFields';
import SleepFields from './fields/SleepFields';
import SymptomFields from './fields/SymptomFields';
import GrowthFields from './fields/GrowthFields';
import TemperatureFields from './fields/TemperatureFields';
import EtcFields from './fields/EtcFields';
import EmotionFields from './fields/EmotionFields';
import DiaperFields from './fields/DiaperFields';
import MobileLayout from '@/components/mantine/MobileLayout';
import { IconCalendar } from '@tabler/icons-react';
import { IconClock } from '@tabler/icons-react';
import HospitalFields from './fields/HospitalFields';
import { useAuthStore } from '@/store/useAuthStore';

interface RecordFormProps {
	type: string;
}

export interface FormValues {
	startDate?: Date;
	endDate?: Date;
	memo: string;
	[key: string]: any;
}

const RecordForm = ({ type }: RecordFormProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get('id');
	const { getToken } = useAuth();
	const { crtChldrnNo } = useAuthStore();

	const isRangeMode = type === 'SLEEP' || type === 'FEEDING';

	const form = useForm<FormValues>({
		initialValues: {
			startDate: undefined,
			endDate: undefined,
			memo: '',
		},
		validate: {
			startDate: (value) => (value ? null : '시작 시간은 필수입니다'),
			memo: (value) =>
				value.length > 200 ? '메모는 200자를 초과할 수 없습니다' : null,
		},
	});

	useEffect(() => {
		if (id) {
			fetchRecord(id);
		}
	}, [id]);

	const fetchRecord = async (recordId: string) => {
		try {
			const token = await getToken();
			const response = await fetch(
				`/api/record/${recordId}?type=${type}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const { data } = await response.json();
				// 폼 데이터 전체 업데이트
				form.setValues({
					startDate: new Date(data.startTime),
					endDate: data.endTime ? new Date(data.endTime) : undefined,
					memo: data.memo || '',
					...data,
				});
			}
		} catch (error) {
			console.error('기록 조회 에러:', error);
		}
	};

	const handleSubmit = async (values: FormValues) => {
		try {
			const token = await getToken();

			const response = await fetch(
				id ? `/api/record/${id}` : '/api/record',
				{
					method: id ? 'PUT' : 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						childId: crtChldrnNo,
						type,
						startTime: values.startDate,
						endTime: values.endDate,
						...values,
					}),
				}
			);

			if (response.ok) {
				router.back();
			}
		} catch (error) {
			console.error('기록 저장 에러:', error);
		}
	};

	const renderFields = () => {
		switch (type) {
			case 'FEEDING':
				return <FeedingFields form={form} />;
			case 'MEDICINE':
				return <MedicineFields form={form} />;
			case 'SLEEP':
				return <SleepFields form={form} />;
			case 'SYMPTOM':
				return <SymptomFields form={form} />;
			case 'GROWTH':
				return <GrowthFields form={form} />;
			case 'TEMPERATURE':
				return <TemperatureFields form={form} />;
			case 'ETC':
				return <EtcFields form={form} />;
			case 'EMOTION':
				return <EmotionFields form={form} />;
			case 'DIAPER':
				return <DiaperFields form={form} />;
			case 'HOSPITAL':
				return <HospitalFields form={form} />;
			default:
				return null;
		}
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title={`${TYPE_MAP[type as keyof typeof TYPE_MAP] || '기록'} ${
				id ? '수정' : '등록'
			}`}
			onBack={() => router.back()}
			showBottomNav={false}
		>
			<Box
				component="form"
				onSubmit={form.onSubmit(handleSubmit)}
				p="md"
				pb={80}
			>
				<Stack gap="xl" pb="md">
					{TYPE_TIP_MAP[type as keyof typeof TYPE_TIP_MAP] && (
						<Stack gap="xs">
							<Text fw={600} fz="md">
								{
									TYPE_TIP_MAP[
										type as keyof typeof TYPE_TIP_MAP
									].title
								}
							</Text>
							<Box
								bg="#FFEDED"
								p="sm"
								style={{ borderRadius: '8px' }}
							>
								<Text
									fw={500}
									fz="sm"
									c="#FF6969"
									style={{
										whiteSpace: 'pre-wrap',
										lineHeight: '1.5',
									}}
								>
									{
										TYPE_TIP_MAP[
											type as keyof typeof TYPE_TIP_MAP
										].tip
									}
								</Text>
							</Box>
						</Stack>
					)}

					<Box>
						{isRangeMode ? (
							<>
								<Text fw={600} fz="md" mb="xs">
									기록 날짜
								</Text>

								<Group
									style={{
										flexDirection: 'column',
										border: '1px solid',
										borderRadius: '8px',
										padding: '8px',
										borderColor:
											'var(--mantine-color-gray-3)',
									}}
									gap={0}
									aria-label="기록 날짜"
								>
									<DateTimePicker
										label="시작"
										placeholder="시작 날짜 선택"
										value={form.values.startDate}
										onChange={(date) =>
											form.setFieldValue(
												'startDate',
												date || undefined
											)
										}
										clearable={false}
										valueFormat="YYYY-MM-DD HH:mm"
										rightSection={<IconClock size={16} />}
										error={form.errors.startDate}
										size="md"
										styles={{
											input: {
												border: 'none',
												width: '100%',
											},
											root: {
												display: 'flex',
												width: '100%',
												alignItems: 'center',
											},
										}}
										lang="ko"
									/>
									<DateTimePicker
										label="종료 "
										placeholder="종료 날짜 선택"
										value={form.values.endDate}
										onChange={(date) =>
											form.setFieldValue(
												'endDate',
												date || undefined
											)
										}
										clearable
										valueFormat="YYYY-MM-DD HH:mm"
										rightSection={<IconClock size={16} />}
										size="md"
										styles={{
											input: {
												border: 'none',
												width: '100%',
											},
											root: {
												display: 'flex',
												alignItems: 'center',
												width: '100%',
											},
										}}
										lang="ko"
									/>
								</Group>
							</>
						) : (
							<DateTimePicker
								label="기록 날짜"
								placeholder="날짜 및 시간 선택"
								value={form.values.startDate}
								onChange={(date) =>
									form.setFieldValue(
										'startDate',
										date || undefined
									)
								}
								size="md"
								clearable={false}
								valueFormat="YYYY-MM-DD HH:mm"
								leftSection={<IconCalendar size={16} />}
								error={form.errors.startDate}
								styles={{
									input: {
										lineHeight: 2.1,
									},
								}}
								lang="ko"
							/>
						)}
					</Box>

					{renderFields()}

					<Box>
						<Textarea
							label="메모"
							{...form.getInputProps('memo')}
							placeholder="메모를 입력해주세요"
							minRows={4}
							size="md"
							variant="filled"
							styles={{ input: { height: '120px' } }}
						/>
						<Text fz="sm" ta="right" c="dimmed" mt={4}>
							{form.values.memo.length}/200
						</Text>
					</Box>
				</Stack>
			</Box>
			<AppShell.Footer>
				<Box p="md">
					<Button
						onClick={() => form.onSubmit(handleSubmit)()}
						fullWidth
						size="md"
						type="submit"
						variant="filled"
						color="blue"
					>
						{id ? '수정하기' : '등록하기'}
					</Button>
				</Box>
			</AppShell.Footer>
		</MobileLayout>
	);
};

export default RecordForm;

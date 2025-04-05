'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
	TextInput,
	Stack,
	Box,
	Button,
	AppShell,
	Select,
	Image,
	Text,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar, IconXboxX } from '@tabler/icons-react';
import MobileLayout from '@/components/mantine/MobileLayout';
import { Suspense, useRef, useState } from 'react';

interface Item {
	id: string;
	name: string;
	[key: string]: any;
}

const diagnoses = ['감기', '코로나19', '장염', '인플루엔자', '기관지염'];

const medicines = ['타이레놀', '써스펜', '판콜에이', '베타딘', '게보린'];

function HospitalFormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get('id');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [prescriptionImage, setPrescriptionImage] = useState<string | null>(
		null
	);

	const form = useForm({
		initialValues: {
			date: undefined as Date | undefined,
			hospital: '',
			doctor: '',
			treatmentMethod: '',
			diagnoses: '',
			medicines: '',
			prescriptionImageUrl: '',
		},
		validate: {
			date: (value) => (value ? null : '날짜를 선택해주세요'),
		},
	});

	const handleSubmit = (values: typeof form.values) => {
		// 저장 로직 구현
		console.log(values);
		// 예: API 호출, 상태 업데이트 등
		router.back();
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// 파일 미리보기 URL 생성
			const imageUrl = URL.createObjectURL(file);
			setPrescriptionImage(imageUrl);

			// form 상태에 이미지 URL 저장
			form.setFieldValue('prescriptionImageUrl', imageUrl);

			// 이미지 업로드 후에는 약 선택 필드를 비활성화하거나 숨길 수 있음
			// 실제 서버에 업로드할 때는 FormData를 사용해야 합니다
		}
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title={`병원 진료 ${id ? '수정' : '등록'}`}
			onBack={() => router.back()}
			showBottomNav={false}
		>
			<Box
				component="form"
				onSubmit={form.onSubmit(handleSubmit)}
				px="md"
				pb="96"
			>
				<Stack gap="xl">
					<Box>
						<DateTimePicker
							label="진찰 받은 날짜"
							placeholder="날짜 및 시간 선택"
							value={form.values.date}
							onChange={(date) =>
								form.setFieldValue('date', date || undefined)
							}
							size="md"
							clearable={false}
							valueFormat="YYYY-MM-DD HH:mm"
							leftSection={<IconCalendar size={16} />}
							error={form.errors.date}
							styles={{
								input: {
									lineHeight: 2.1,
								},
							}}
							lang="ko"
						/>
					</Box>

					<Box>
						<TextInput
							label="진찰받은 병원"
							{...form.getInputProps('hospital')}
							placeholder="병원 이름을 입력해주세요"
							size="md"
						/>
					</Box>

					<Box>
						<TextInput
							label="선생님 성함"
							{...form.getInputProps('doctor')}
							placeholder="선생님 성함을 입력해주세요"
							size="md"
						/>
					</Box>

					<Box>
						<Select
							label="진단받은 병명"
							placeholder="병명을 선택해주세요"
							size="md"
							data={diagnoses}
							value={form.values.diagnoses}
							searchable
							onChange={(value) =>
								form.setFieldValue('diagnoses', value || '')
							}
						/>
					</Box>

					<Box>
						<TextInput
							label="치료 방법"
							{...form.getInputProps('treatmentMethod')}
							placeholder="치료 방법을 입력해주세요"
							size="md"
						/>
					</Box>

					<Box>
						<Select
							label="처방받은 약"
							placeholder="약을 선택해주세요"
							size="md"
							data={medicines}
							value={form.values.medicines}
							searchable
							onChange={(value) =>
								form.setFieldValue('medicines', value || '')
							}
						/>
					</Box>

					{/* 처방전 이미지 업로드 섹션 */}
					<Box>
						<Text fw={500} size="md" mb="xs">
							처방전 이미지
						</Text>

						{!prescriptionImage ? (
							<Box
								p="md"
								style={{
									border: '1px dashed #ced4da',
									borderRadius: '8px',
									cursor: 'pointer',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									height: '120px',
								}}
								onClick={() => fileInputRef.current?.click()}
							>
								<img
									src="/upload.svg"
									width={24}
									height={24}
									style={{ marginBottom: '8px' }}
								/>
								<Text size="sm" c="dimmed">
									처방전 사진 업로드
								</Text>
								<input
									type="file"
									ref={fileInputRef}
									style={{ display: 'none' }}
									accept="image/*"
									onChange={handleImageUpload}
								/>
							</Box>
						) : (
							<Box pos="relative">
								<Image
									src={prescriptionImage}
									alt="처방전 이미지"
									radius="md"
									h={200}
								/>
								<Box
									variant="light"
									size="xs"
									pos="absolute"
									top="-24px"
									right="0"
									onClick={() => {
										setPrescriptionImage(null);
										form.setFieldValue(
											'prescriptionImageUrl',
											''
										);
									}}
								>
									<IconXboxX size={24} />
								</Box>
							</Box>
						)}
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
}

export default function HospitalFormPage() {
	return (
		<Suspense fallback={<div>로딩 중...</div>}>
			<HospitalFormContent />
		</Suspense>
	);
}

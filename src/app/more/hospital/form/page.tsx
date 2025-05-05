'use client';

import { useSearchParams } from 'next/navigation';
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
import useAuth from '@/hook/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import instance from '@/utils/axios';
import useNavigation from '@/hook/useNavigation';
import { useToast } from '@/hook/useToast';
import axios from 'axios';

const diagnoses = ['감기', '코로나19', '장염', '인플루엔자', '기관지염'];

const medicines = ['타이레놀', '써스펜', '판콜에이', '베타딘', '게보린'];

function HospitalFormContent() {
	const { getToken } = useAuth();
	const { crtChldrnNo } = useAuthStore();
	const { goBack } = useNavigation();
	const searchParams = useSearchParams();
	const id = searchParams.get('id');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [prescriptionImage, setPrescriptionImage] = useState<string | null>(
		null
	);
	const { errorToast, successToast } = useToast();

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

	// 제출 함수 수정
	const handleSubmit = async (values: typeof form.values) => {
		try {
			setSubmitting(true);
			const token = await getToken();

			console.log(token);
			// 이미지가 선택되었는지 확인
			let imageUrl = values.prescriptionImageUrl;

			// 새 이미지가 선택되었으면 업로드
			if (selectedFile) {
				// FormData 생성
				const formData = new FormData();
				formData.append('file', selectedFile);
				formData.append('filePrefix', 'prescription');

				// axios로 이미지 업로드
				const { data } = await instance.post('/image', formData, {
					headers: {
						'Content-Type': 'multipart/form-data', // FormData를 위한 Content-Type 설정
						Authorization: `Bearer ${token}`,
					},
				});

				imageUrl = data.url;
			}

			// 제출할 데이터 준비
			const prescriptionData = {
				childId: crtChldrnNo,
				date: values.date?.toISOString(),
				hospital: values.hospital,
				doctor: values.doctor,
				diagnoses: values.diagnoses,
				treatmentMethod: values.treatmentMethod,
				medicines: values.medicines,
				prescriptionImageUrl: imageUrl,
			};

			// axios로 진료 기록 등록
			await instance.post('/prescription', prescriptionData);
			successToast({
				title: '진료기록 발행',
				message: '진료기록이 발행되었습니다',
				position: 'top-center',
				autoClose: 2000,
			});
			// 성공 시 페이지 이동
			goBack();
		} catch (error) {
			console.error('진료 기록 저장 오류:', error);

			// 에러 메시지 추출 로직
			let errorMessage = '알 수 없는 오류가 발생했습니다';

			if (axios.isAxiosError(error)) {
				// Axios 에러인 경우
				if (error.response) {
					// 서버에서 응답이 왔지만 오류 상태 코드인 경우
					errorMessage =
						error.response.data.message ||
						`오류 코드: ${error.response.status}`;
				} else if (error.request) {
					// 요청은 보냈지만 응답이 없는 경우
					errorMessage = '서버에서 응답이 없습니다';
				} else {
					// 요청 설정 중 오류 발생
					errorMessage = error.message;
				}
			} else {
				// Axios 에러가 아닌 일반 에러
				errorMessage =
					error instanceof Error ? error.message : String(error);
			}

			// 토스트 표시
			errorToast({
				title: '진료기록 발행 실패',
				message: errorMessage,
				position: 'top-center',
				autoClose: 2000,
			});
		} finally {
			setSubmitting(false);
		}
	};
	// 이미지 업로드 함수 수정
	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// 파일 객체를 상태로 저장
		setSelectedFile(file);

		// 로컬 미리보기용 URL 생성
		const localPreviewUrl = URL.createObjectURL(file);
		setPrescriptionImage(localPreviewUrl);
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title={`병원 진료 ${id ? '수정' : '등록'}`}
			onBack={goBack}
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

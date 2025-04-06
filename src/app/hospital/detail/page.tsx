'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MobileLayout from '@/components/mantine/MobileLayout';
import instance from '@/utils/axios';
import { Paper, Text, Alert, Box } from '@mantine/core';
import Metrics from './Metrics';

// 처방전 상세 정보 타입
interface PrescriptionDetail {
	id: string;
	childId: string;
	date: string;
	hospital: string;
	doctor?: string;
	diagnoses?: string;
	treatmentMethod?: string;
	medicines?: string;
	prescriptionImageUrl?: string;
	memo?: string;
	createdAt: string;
	updatedAt: string;
}

const App = () => {
	const searchParams = useSearchParams();
	const prescriptionId = searchParams.get('id');

	const [prescription, setPrescription] = useState<PrescriptionDetail | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 처방전 상세 정보 가져오기
	useEffect(() => {
		const fetchPrescriptionDetail = async () => {
			if (!prescriptionId) {
				setError('처방전 ID가 없습니다.');
				setLoading(false);
				return;
			}

			try {
				// 처방전 상세 정보를 가져오는 API 호출
				const response = await instance.get(
					`/prescription/detail/${prescriptionId}`
				);
				console.log('처방전 상세 정보:', response.data);

				if (response.data) {
					setPrescription(response.data);
				} else {
					setError('처방전 정보를 찾을 수 없습니다.');
				}
			} catch (err) {
				console.error('처방전 상세 정보 조회 오류:', err);
				setError('처방전 정보를 불러오는데 실패했습니다.');
			} finally {
				setLoading(false);
			}
		};

		fetchPrescriptionDetail();
	}, [prescriptionId]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getOriginalFileName = (url: string) => {
		try {
			// URL에서 파일명 부분 추출
			const fileName = url.split('/').pop()?.split('-')[0];
			if (!fileName) return '처방전 이미지';

			// 디코딩
			return decodeURIComponent(fileName);
		} catch (error) {
			return '처방전 이미지';
		}
	};

	return (
		<MobileLayout
			showHeader={true}
			headerType="back"
			title="진료기록 상세"
			currentRoute="/more"
		>
			{loading ? (
				<div>로딩중입니다.</div>
			) : error ? (
				<p>에러입니다</p>
			) : prescription ? (
				<Box p="16">
					<Paper shadow="xs" p="md" withBorder>
						<Metrics label="병원" value={prescription.hospital} />
						<Metrics label="날짜" value={prescription.date} />
						<Metrics label="담당의" value={prescription.doctor} />
						<Metrics
							label="진단명"
							value={prescription.diagnoses}
						/>
						<Metrics
							label="처방 약품"
							value={prescription.medicines}
						/>
						<Metrics
							label="치료 방법"
							value={prescription.treatmentMethod}
						/>
						<Metrics label="메모" value={prescription.memo} />
						{prescription.prescriptionImageUrl && (
							<Box>
								<Text fw={600} size="lg" c="#000000" mb={6}>
									처방전 이미지
								</Text>
								<Box>
									<img
										src={prescription.prescriptionImageUrl} // 원본 URL 그대로 사용
										alt={getOriginalFileName(
											prescription.prescriptionImageUrl
										)} // 파일명은 alt에 사용
										width="100%"
									/>
								</Box>
							</Box>
						)}
					</Paper>
				</Box>
			) : (
				<div className="p-4">
					<Alert color="blue">처방전 정보가 없습니다.</Alert>
				</div>
			)}
		</MobileLayout>
	);
};

export default App;

'use client';

import { Box, Button } from '@mantine/core';
import { RefObject, useState } from 'react';
import html2canvas from 'html2canvas';
import useAuth from '@/hook/useAuth';
import instance from '@/utils/axios';
import { useAuthStore } from '@/store/useAuthStore';

interface ActionTabProps {
	onPublishSuccess?: (data: any) => void;
	captureRef: RefObject<HTMLElement>;
	onPublishError?: (error: any) => void;
}

const ActionTab = ({
	onPublishSuccess,
	onPublishError,
	captureRef,
}: ActionTabProps) => {
	const [isPublishing, setIsPublishing] = useState(false);
	const { getToken } = useAuth();
	const { crtChldrnNo } = useAuthStore();

	const captureElement = async (): Promise<Blob | null> => {
		if (!captureRef) return null;

		try {
			const element = captureRef.current;

			if (!element) {
				console.error('❌ 캡처할 요소가 없습니다 (ref가 null)');
				return null;
			}

			// 1. 이미지가 모두 로드될 때까지 대기
			const images = Array.from(element.querySelectorAll('img'));
			if (images.length > 0) {
				await Promise.all(
					images.map(
						(img) =>
							new Promise((resolve) => {
								if (img.complete) {
									resolve(null);
								} else {
									img.onload = () => resolve(null);
									img.onerror = () => resolve(null);
								}
							})
					)
				);
			}

			// 3. html2canvas 실행

			const canvas = await html2canvas(element, {
				useCORS: true,
				scrollX: 0,
				scrollY: 0,
				width: element.scrollWidth,
				height: element.scrollHeight,
				scale: window.devicePixelRatio,
				logging: true,
				allowTaint: true,
				backgroundColor: null,
				onclone: (documentClone, ele) => {
					return documentClone;
				},
			});

			// 4. 캔버스를 Blob으로 변환
			return new Promise((resolve) => {
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							console.error('Blob 생성 실패');
							resolve(null);
						} else {
							resolve(blob);
						}
					},
					'image/png',
					1
				);
			});
		} catch (error) {
			console.error('캡처 중 오류 발생:', error);
			return null;
		}
	};
	const handlePublishClick = async () => {
		try {
			setIsPublishing(true);
			const token = await getToken();

			if (!token) {
				setIsPublishing(false);
				return;
			}

			const blob = await captureElement();

			if (!blob) {
				setIsPublishing(false);
				onPublishError?.('이미지 생성 실패');
				return;
			}

			const formData = new FormData();
			formData.append('file', blob, 'medical_report.png');
			formData.append('filePrefix', 'medical_record');

			// 6. 서버로 전송
			try {
				// 인스턴스 생성 및 이미지 API 호출
				const { data } = await instance.post('/image', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				});

				// 이미지 업로드 성공 후, 리포트 생성 API 호출
				if (data && data.url) {
					// 리포트 생성 API 호출
					const reportResponse = await instance.post(
						'/report',
						{
							imageUrl: data.url,
							childId: crtChldrnNo,
						},
						{
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (reportResponse.data) {
						onPublishSuccess?.(reportResponse.data);
					}
				}
			} catch (error) {
				console.error('서버 요청 중 오류:', error);
				onPublishError?.(error);
			} finally {
				setIsPublishing(false);
			}
		} catch (error) {
			console.error('발행 중 오류:', error);
			onPublishError?.(error);
		} finally {
			setIsPublishing(false);
		}
	};

	return (
		<>
			<Box px="16">
				<Button
					mt="40px"
					loading={isPublishing}
					fullWidth
					c="#FFFFFF"
					style={{ cursor: 'pointer' }}
					onClick={handlePublishClick}
				>
					발행하기
				</Button>
			</Box>
		</>
	);
};

export default ActionTab;

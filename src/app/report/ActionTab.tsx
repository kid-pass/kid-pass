'use client';

import { Box, Button } from '@mantine/core';
import { RefObject, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import useAuth from '@/hook/useAuth';
import instance from '@/utils/axios';
import { useAuthStore } from '@/store/useAuthStore';

interface ActionTabProps {
	// 발행 성공 콜백
	onPublishSuccess?: (data: any) => void;
	captureRef: RefObject<HTMLElement>;
	// 발행 실패 콜백 (선택적)
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

			console.log('👉 캡처 대상:', element);

			// 1. 이미지가 모두 로드될 때까지 대기
			const images = Array.from(element.querySelectorAll('img'));
			if (images.length > 0) {
				console.log(`📸 이미지 ${images.length}개 로딩 대기 중...`);
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
				width: element.scrollWidth, // windowWidth 대신 width 사용
				height: element.scrollHeight, // windowHeight 대신 height 사용
				scale: window.devicePixelRatio,
				logging: true,
				allowTaint: true,
				backgroundColor: null, // 투명 배경 (필요시 제거)
				onclone: (documentClone, ele) => {
					return documentClone;
				},
			});

			// 4. 캔버스를 Blob으로 변환
			return new Promise((resolve) => {
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							console.error('❌ Blob 생성 실패');
							resolve(null);
						} else {
							console.log(`✅Blob 생성 완료: ${blob.size} bytes`);
							resolve(blob);
						}
					},
					'image/png',
					1
				);
			});
		} catch (error) {
			console.error('❌ 캡처 중 오류 발생:', error);
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

				console.log(captureRef.current);
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
						// 성공 콜백 호출
						onPublishSuccess?.(reportResponse.data);

						// 사용자에게 성공 메시지 표시
						console.log(reportResponse.data);
					}
				}
			} catch (error) {
				console.error('서버 요청 중 오류:', error);
				onPublishError?.(error);
			} finally {
				setIsPublishing(false);
			}

			console.log('📦 FormData 준비됨:', formData);
		} catch (error) {
			console.error('❌ 발행 중 오류:', error);
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

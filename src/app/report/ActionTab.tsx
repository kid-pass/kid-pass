'use client';

import { Box, Button, useMantineTheme } from '@mantine/core';
import { RefObject, useState } from 'react';
import html2canvas from 'html2canvas';
import useAuth from '@/hook/useAuth';
import instance from '@/utils/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useImageUpload } from '@/hook/useImageUpload';
import { useToast } from '@/hook/useToast';

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
	const theme = useMantineTheme();
	const { getToken } = useAuth();
	const { crtChldrnNo } = useAuthStore();
	const { errorToast } = useToast();

	const captureElement = async (): Promise<Blob | null> => {
		if (!captureRef) return null;

		try {
			const element = captureRef.current;

			if (!element) {
				console.error('캡처할 요소가 없습니다');
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

				errorToast({
					title: '이미지 발행 실패',
					message:
						'이미지 발행에 문제가 발생했습니다. 문의 부탁드리겠습니다.',
					position: 'top-center',
					autoClose: 2000, // 5초 후 자동으로 닫힘
				});
				onPublishError?.('이미지 생성 실패');
				return;
			}

			// 공통 함수 사용
			const imageData = await useImageUpload(blob, {
				filePrefix: 'medical_record',
				token: token,
			});

			// 이미지 업로드 성공 후, 리포트 생성 API 호출
			if (imageData && imageData.url) {
				const reportResponse = await instance.post(
					'/report',
					{
						imageUrl: imageData.url,
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
			console.error('발행 중 오류:', error);
			errorToast({
				title: '레포트 발행 실패',
				message:
					'레포트 발행에 문제가 발생했습니다. 문의 부탁드리겠습니다.',
				position: 'top-center',
				autoClose: 2000, // 5초 후 자동으로 닫힘
			});
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
					loaderProps={{ color: '#FFFFFF' }}
				>
					발행하기
				</Button>
			</Box>
		</>
	);
};

export default ActionTab;

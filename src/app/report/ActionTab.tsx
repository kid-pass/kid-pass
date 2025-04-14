'use client';

import { Button } from '@mantine/core';
import { useState } from 'react';
import html2canvas from 'html2canvas';
import useAuth from '@/hook/useAuth';
import useAuthStore from '@/store/useAuthStore';
import instance from '@/utils/axios';

interface ActionTabProps {
	// 발행 성공 콜백
	onPublishSuccess?: (data: any) => void;

	// 발행 실패 콜백 (선택적)
	onPublishError?: (error: any) => void;
}

const ActionTab = ({ onPublishSuccess, onPublishError }: ActionTabProps) => {
	const [isPublishing, setIsPublishing] = useState(false);
	const { getToken } = useAuth();
	const { crtChldrnNo } = useAuthStore();

	// 발행하기 버튼 클릭 시 - 페이지 전체를 캡처하여 서버에 저장
	const handlePublishClick = async () => {
		try {
			setIsPublishing(true);

			const token = await getToken();

			if (!token) {
				setIsPublishing(false);
				return;
			}

			// 2. 페이지 전체 요소 찾기 (HTML 전체)
			const pageElement = document.documentElement;

			const canvas = await html2canvas(pageElement, {
				useCORS: true,
				scrollX: 0,
				scrollY: 0,
				windowWidth: document.documentElement.offsetWidth,
				windowHeight: document.documentElement.offsetHeight,
				scale: 1,
				logging: true,
				allowTaint: true,
			});

			// 4. 캔버스를 Blob으로 변환
			canvas.toBlob(
				async (blob) => {
					if (!blob) {
						console.error('이미지 생성 실패');
						setIsPublishing(false);
						onPublishError?.('이미지 생성 실패');
						return;
					}

					// 5. FormData 생성
					const formData = new FormData();
					formData.append('file', blob, 'medical_report.png');
					formData.append('filePrefix', 'medical_record'); // medical_record 접두사 사용

					// 6. 서버로 전송
					try {
						// 인스턴스 생성 및 이미지 API 호출

						const { data } = await instance.post(
							'/image',
							formData,
							{
								headers: {
									'Content-Type': 'multipart/form-data',
									Authorization: `Bearer ${token}`,
								},
							}
						);

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
				},
				'image/png',
				1
			);
		} catch (error) {
			console.error('리포트 캡처 중 오류:', error);
			setIsPublishing(false);
			onPublishError?.(error);
		}
	};

	return (
		<>
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
		</>
	);
};

export default ActionTab;

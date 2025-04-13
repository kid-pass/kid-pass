'use client';

import { Box, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import useAuth from '@/hook/useAuth';

interface ActionTabProps {
	// 수정 모드 상태 변경 콜백
	onEditingChange?: (isEditing: boolean) => void;

	// 발행 성공 콜백
	onPublishSuccess?: (data: any) => void;

	// 발행 실패 콜백 (선택적)
	onPublishError?: (error: any) => void;
}

const ActionTab = ({ onEditingChange }: ActionTabProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const { getToken } = useAuth();

	// isEditing 상태가 변경될 때마다 부모 컴포넌트에 알림
	useEffect(() => {
		onEditingChange?.(isEditing);
	}, [isEditing, onEditingChange]);

	// 수정하기 버튼 클릭 시
	const handleEditClick = () => {
		setIsEditing(true);
	};

	// 취소 버튼 클릭 시
	const handleCancelClick = () => {
		setIsEditing(false);
	};

	// 발행하기 버튼 클릭 시 - 페이지 전체를 캡처하여 서버에 저장
	const handlePublishClick = async () => {
		try {
			setIsPublishing(true);

			// 1. 토큰 가져오기
			const token = await getToken();

			if (!token) {
				alert('로그인이 필요합니다.');
				setIsPublishing(false);
				return;
			}

			// 2. 페이지 전체 요소 찾기 (HTML 전체)
			const pageElement = document.documentElement;

			// 3. html2canvas로 페이지 캡처
			console.log('리포트 캡처 시작...');
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
						return;
					}

					// 5. FormData 생성
					const formData = new FormData();
					formData.append('file', blob, 'medical_report.png');
					formData.append('filePrefix', 'medical_record'); // medical_record 접두사 사용

					// 6. 서버로 전송
					try {
						// 인스턴스 생성 및 API 호출
						const instance = axios.create({
							baseURL: process.env.NEXT_PUBLIC_API_URL,
						});

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

						console.log('리포트 업로드 성공:', data);
						alert('리포트가 성공적으로 발행되었습니다.');

						// 성공 후 추가 처리 (예: 리다이렉트 등)
					} catch (error) {
						console.error('리포트 업로드 실패:', error);
						alert('리포트 발행 중 오류가 발생했습니다.');
					}

					setIsPublishing(false);
				},
				'image/png',
				0.9
			); // 90% 품질로 PNG 생성
		} catch (error) {
			console.error('리포트 캡처 중 오류:', error);
			alert('리포트 캡처 중 오류가 발생했습니다.');
			setIsPublishing(false);
		}
	};

	return (
		<Box
			mt="48px"
			display="flex"
			w="100%"
			style={{ justifyContent: 'space-around' }}
		>
			{isEditing ? (
				// 수정 모드일 때 표시할 버튼
				<>
					<Text
						c="#000000"
						fw={600}
						fz="md-lg"
						style={{ cursor: 'pointer' }}
						onClick={handleCancelClick}
					>
						취소
					</Text>
					<Text c="#000000" fw={600} fz="md-lg">
						수정완료
					</Text>
				</>
			) : (
				// 기본 모드일 때 표시할 버튼
				<>
					<Text
						c="#000000"
						fw={600}
						fz="md-lg"
						style={{ cursor: 'pointer' }}
						onClick={handleEditClick}
					>
						수정하기
					</Text>
					<Text
						c="#000000"
						fw={600}
						fz="md-lg"
						style={{ cursor: 'pointer' }}
						onClick={handlePublishClick}
					>
						{isPublishing ? '발행 중...' : '발행하기'}
					</Text>
				</>
			)}
		</Box>
	);
};

export default ActionTab;

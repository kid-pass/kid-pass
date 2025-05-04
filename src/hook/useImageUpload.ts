// lib/imageUpload.ts

import instance from '@/utils/axios';

// 또는 사용 중인 API 클라이언트

/**
 * 이미지 파일을 서버에 업로드하는 공통 함수
 * @param file - 업로드할 이미지 Blob/File
 * @param options - 업로드 관련 옵션들
 * @returns 업로드된 이미지 URL과 응답 데이터
 */
export const useImageUpload = async (
	file: Blob | File,
	options: {
		childId?: string;
		filePrefix?: string;
		endpoint?: string;
		token?: string;
	} = {}
) => {
	const {
		childId,
		filePrefix = 'Image',
		endpoint = '/image',
		token,
	} = options;

	try {
		// FormData 생성
		const formData = new FormData();

		// File 객체로 변환 (이미 File이면 그대로 사용)
		const fileToUpload =
			file instanceof File
				? file
				: new File([file], 'image.png', {
						type: file.type || 'image/png',
				  });

		formData.append('file', fileToUpload);

		// 필요한 데이터 추가
		formData.append('filePrefix', filePrefix);

		// childId가 있는 경우 추가
		if (childId) {
			formData.append('childId', childId);
		}

		// 헤더 설정
		const headers: Record<string, string> = {
			'Content-Type': 'multipart/form-data',
		};

		// 토큰이 있는 경우 추가
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		// API 요청
		const response = await instance.post(endpoint, formData, { headers });
		return response.data;
	} catch (error) {
		console.error('이미지 업로드 오류:', error);
		throw error;
	}
};

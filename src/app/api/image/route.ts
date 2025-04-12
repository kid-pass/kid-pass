import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
	try {
		// JWT 토큰 검증
		const authHeader = request.headers.get('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ message: '인증이 필요합니다.' },
				{ status: 401 }
			);
		}

		const token = authHeader.split(' ')[1];
		jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

		// FormData 추출
		const formData = await request.formData();
		const file = formData.get('file') as File;
		// 파일명 접두사 추출 (기본값은 'prescription'으로 설정)
		const filePrefix = (formData.get('filePrefix') as string) || 'Image';

		if (!file) {
			return NextResponse.json(
				{ message: '파일이 없습니다.' },
				{ status: 400 }
			);
		}

		// 파일명 생성 - filePrefix를 사용
		const timestamp = new Date().getTime();
		const filename = `${filePrefix}_${timestamp}_${file.name.replace(
			/\s+/g,
			'_'
		)}`;

		// Vercel Blob에 이미지 업로드
		const blob = await put(filename, file, {
			access: 'public',
		});

		return NextResponse.json({
			success: true,
			url: blob.url,
			message: '이미지가 성공적으로 업로드되었습니다.',
		});
	} catch (error) {
		console.error('이미지 업로드 오류:', error);
		return NextResponse.json(
			{ message: '이미지 업로드 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

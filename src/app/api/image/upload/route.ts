import { NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// FormData 추출
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const childId = String(formData.get('childId'));

		if (!childId) {
			return NextResponse.json(
				{ message: '아이번호를 알 수 없습니다.' },
				{ status: 400 }
			);
		}

		if (!file) {
			return NextResponse.json(
				{ message: '파일이 없습니다.' },
				{ status: 400 }
			);
		}

		if (!file.type.startsWith('image/')) {
			return NextResponse.json(
				{ message: '이미지 파일만 업로드 가능합니다.' },
				{ status: 400 }
			);
		}

		const existingChild = await prisma.child.findUnique({
			where: {
				id: childId,
			},
			select: {
				profileImageUrl: true,
			},
		});

		// vercel blob 에 저장할 파일 이름 커스텀 및 저장
		const filePrefix = (formData.get('filePrefix') as string) || 'Image';
		const filename = `${filePrefix}_${file.name.replace(/\s+/g, '_')}`;

		const blob = await put(filename, file, {
			access: 'public',
		});

		// 이전 이미지가 있으면 삭제
		if (existingChild?.profileImageUrl) {
			try {
				// URL에서 파일 경로 추출
				const urlObj = new URL(existingChild.profileImageUrl);
				const pathname = urlObj.pathname;
				// 앞의 '/' 제거 - Vercel Blob 삭제 API에 필요
				const blobPath = pathname.startsWith('/')
					? pathname.substring(1)
					: pathname;

				await del(blobPath);
			} catch (deleteError) {
				console.error('이전 이미지 삭제 실패:', deleteError);
				// 삭제 실패해도 계속 진행
			}
		}

		//db에  저장하는 vercel blob image url 저장
		const updatedChild = await prisma.child.update({
			where: {
				id: childId,
			},
			data: {
				profileImageUrl: blob.url,
			},
		});

		// 성공 응답 반환
		return NextResponse.json({
			success: true,
			imageUrl: blob.url,
			child: {
				id: updatedChild.id,
				name: updatedChild.name,
				profileImageUrl: updatedChild.profileImageUrl,
			},
		});
	} catch (error) {
		console.error('이미지 업로드 서버 오류:', error);
		return NextResponse.json(
			{ message: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

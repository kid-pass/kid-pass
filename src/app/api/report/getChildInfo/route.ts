// /pages/api/child/getChild.ts 또는 /app/api/child/getChild/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		// JWT 토큰에서 사용자 정보 가져오기
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

		// URL에서 childId 파라미터 가져오기
		const { searchParams } = new URL(request.url);
		const childId = searchParams.get('childId');

		if (!childId) {
			return NextResponse.json(
				{ message: '아이 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 특정 아이 찾기
		const child = await prisma.child.findFirst({
			where: {
				id: childId,
				user: { userId: decoded.userId }, // 보안을 위해 현재 인증된 사용자의 자녀인지 확인
			},
			select: {
				id: true,
				name: true,
				birthDate: true,
				gender: true,
				weight: true,
				height: true,
				headCircumference: true,
				ageType: true,
				allergies: true,
				symptoms: true,
				memo: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '아이를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '아이 정보를 성공적으로 가져왔습니다.',
			data: child,
		});
	} catch (error) {
		console.error('아이 정보 조회 에러:', error);
		return NextResponse.json(
			{ message: '아이 정보를 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

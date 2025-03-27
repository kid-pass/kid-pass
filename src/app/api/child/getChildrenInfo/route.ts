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

		// 사용자 찾기
		const user = await prisma.user.findUnique({
			where: { userId: decoded.userId },
			include: {
				children: {
					orderBy: {
						createdAt: 'desc',
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
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '아이 목록을 성공적으로 가져왔습니다.',
			data: user.children,
		});
	} catch (error) {
		console.error('아이 목록 조회 에러:', error);
		return NextResponse.json(
			{ message: '아이 목록을 가져오는 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

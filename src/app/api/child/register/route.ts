import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const {
			name,
			birthDate,
			gender,
			weight,
			height,
			headCircumference,
			ageType,
			allergies,
			symptoms,
			memo,
		} = await request.json();

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
		});

		if (!user) {
			return NextResponse.json(
				{ message: '사용자를 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 트랜잭션 사용하여 Child와 Record를 원자적으로 생성
		const result = await prisma.$transaction(async (tx) => {
			// 1. 아이 정보 등록
			const child = await tx.child.create({
				data: {
					name,
					birthDate: new Date(birthDate),
					gender,
					weight: weight ? parseFloat(weight) : null,
					height: height ? parseFloat(height) : null,
					headCircumference: headCircumference
						? parseFloat(headCircumference)
						: null,
					ageType,
					allergies,
					symptoms,
					memo,
					userId: user.id,
				},
			});

			// 2. 성장 기록 생성 (weight, height, headCircumference가 있는 경우)
			if (weight || height || headCircumference) {
				// 현재 시간을 기준으로 성장 기록 생성
				const currentDate = new Date();

				await tx.record.create({
					data: {
						childId: child.id,
						type: 'GROWTH', // 성장 기록 타입 (필요에 따라 조정)
						startTime: currentDate, // 현재 시간
						// endTime은 null (성장 기록은 보통 순간 측정)

						// 성장 관련 정보
						weight: weight ? parseFloat(weight) : null,
						height: height ? parseFloat(height) : null,
						headSize: headCircumference
							? parseFloat(headCircumference)
							: null, // headSize로 매핑

						// 메모 (선택적)
						memo: '초기 등록 시 측정 데이터',
					},
				});
			}

			return child;
		});

		return NextResponse.json(
			{
				message: '아이 정보가 등록되었습니다.',
				data: result,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('아이 정보 등록 에러:', error);
		return NextResponse.json(
			{ message: '아이 정보 등록 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

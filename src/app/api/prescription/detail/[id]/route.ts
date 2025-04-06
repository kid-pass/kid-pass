// /api/prescription/detail/[prescriptionId]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
	request: Request,
	{ params }: { params: { prescriptionId: string } }
) {
	try {
		const prescriptionId = params.prescriptionId;

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

		// 처방전 조회
		const prescription = await prisma.prescription.findUnique({
			where: {
				id: prescriptionId,
			},
		});

		if (!prescription) {
			return NextResponse.json(
				{ message: '해당 처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		// 사용자 권한 확인 (해당 아이의 처방전인지)
		const child = await prisma.child.findFirst({
			where: {
				id: prescription.childId,
				user: {
					userId: decoded.userId,
				},
			},
		});

		if (!child) {
			return NextResponse.json(
				{ message: '접근 권한이 없습니다.' },
				{ status: 403 }
			);
		}

		return NextResponse.json({
			message: '처방전 상세 정보를 조회했습니다.',
			data: prescription,
		});
	} catch (error) {
		console.error('처방전 상세 조회 오류:', error);
		return NextResponse.json(
			{ message: '처방전 상세 조회 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}

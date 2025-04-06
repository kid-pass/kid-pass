// /child/[id]/prescription/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// GET 요청 처리 - childId로 최근 3일치 처방전 조회
export async function GET(request: NextRequest, { params }: Props) {
	try {
		const { id } = await params;
		const childId = id;

		// 3일 전 날짜 계산
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// 해당 childId에 연결된 최근 3일 내의 처방전 조회
		const prescriptions = await prisma.prescription.findMany({
			where: {
				childId: childId,
				date: {
					gte: threeDaysAgo,
				},
			},
			orderBy: {
				date: 'desc', // 날짜 최신순으로 정렬
			},
		});

		return NextResponse.json(prescriptions);
	} catch (error) {
		console.error('Error fetching recent prescriptions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch recent prescriptions' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
// 처방전 삭제 API
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
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

		// 처방전 ID 추출
		const prescriptionId = params.id;
		if (!prescriptionId) {
			return NextResponse.json(
				{ message: '처방전 ID가 필요합니다.' },
				{ status: 400 }
			);
		}

		// 처방전 조회 및 권한 확인
		const existingPrescription = await prisma.prescription.findUnique({
			where: {
				id: prescriptionId,
			},
			include: {
				child: {
					select: {
						userId: true,
					},
				},
			},
		});

		if (!existingPrescription) {
			return NextResponse.json(
				{ message: '처방전을 찾을 수 없습니다.' },
				{ status: 404 }
			);
		}

		if (existingPrescription.child.userId !== decoded.userId) {
			return NextResponse.json(
				{ message: '권한이 없습니다.' },
				{ status: 403 }
			);
		}

		// 처방전 삭제
		await prisma.prescription.delete({
			where: {
				id: prescriptionId,
			},
		});

		return NextResponse.json({
			message: '처방전이 삭제되었습니다.',
		});
	} catch (error) {
		console.error('처방전 삭제 오류:', error);
		return NextResponse.json(
			{ message: '처방전 삭제 중 오류가 발생했습니다.' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

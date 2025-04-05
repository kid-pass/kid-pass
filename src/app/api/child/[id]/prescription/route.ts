import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET 요청 처리 - childId로 처방전 조회
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const childId = params.id;

		// 해당 childId에 연결된 모든 처방전 조회
		const prescriptions = await prisma.prescription.findMany({
			where: {
				childId: childId,
			},
			orderBy: {
				date: 'desc', // 날짜 최신순으로 정렬
			},
		});

		return NextResponse.json(prescriptions);
	} catch (error) {
		console.error('Error fetching prescriptions:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch prescriptions' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
